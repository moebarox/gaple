<template>
  <div class="relative flex justify-center items-center w-screen h-screen overflow-hidden">
    <AssetsBoard
      :cards="board"
      :is-selectable="!isMatchOver && isPlayerTurn && state === TURN_STATE.selectPosition"
      @select="handleSelectPosition"
    />

    <AssetsPlayerInfo
      v-for="(player, idx) in otherPlayers"
      :key="player.id"
      :player="player"
      :position="getPlayerPosition(idx)"
      :is-highlighted="!isMatchOver && match?.state?.turn === player.id"
    />

    <div class="absolute p-4 text-center bottom-0 w-full">
      <div v-if="isMatchOver" class="mb-4">
        <button v-if="isRoomMaster" class="rounded bg-green-500 text-white px-4 py-2" @click="nextRound">
          Start Next Round!
        </button>
        <div v-else class="text-red-400">Game over! Waiting for room master to start a new match...</div>
      </div>
      <div
        v-else
        class="mb-4"
        :class="{
          'text-green-400': isPlayerTurn,
          'text-gray-400': !isPlayerTurn,
        }"
      >
        <template v-if="isPlayerTurn">Your turn!</template>
        <template v-else>{{ findPlayer(players, match?.state?.turn)?.name }}'s turn</template>
      </div>
      <div class="flex justify-center gap-4">
        <AssetsDomino
          v-for="card in currentPlayer.cards"
          :key="card"
          :card="card"
          :is-selectable="!isMatchOver && isSelectable(card)"
          :is-disabled="!isMatchOver && isPlayerTurn && !selectableCards.includes(card)"
          :class="{
            '-translate-y-4': card === selectedCard,
          }"
          @select="handleSelectCard"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore'

import { TURN_STATE, BOARD_POSITION } from '#imports'

const route = useRoute()
const { $db } = useNuxtApp()
const user = getUser()

const matchId = route.params.id as string

const match = ref<TMatch>({} as TMatch)
const state = ref<TURN_STATE>(TURN_STATE.pickCard)
const selectedCard = ref('')
const unsubGameplay = ref()

const board = computed<string[]>(() => match.value?.state?.board ?? [])
const players = computed<TMatchPlayer[]>(() => match.value?.players ?? [])
const currentPlayer = computed<TMatchPlayer>(
  () => match.value?.players?.find(p => p.id === user.id) ?? ({} as TMatchPlayer)
)
const playerIdx = computed(() => match.value?.players?.findIndex(p => p.id === user.id))
const isRoomMaster = computed(() => match.value?.settings?.roomMaster === user.id)
const isPlayerTurn = computed(() => match.value?.state?.turn === user.id)
const isAnyPlayerWin = computed(() => players.value.some(p => p.cards?.length === 0))
const isMatchDraw = computed(() =>
  players.value.every(p => getPossibleCards(p.cards, head.value, tail.value).length === 0)
)
const isMatchOver = computed(() => isAnyPlayerWin.value || isMatchDraw.value)
const head = computed<string>(() => board.value[0]?.charAt(0) ?? '')
const tail = computed<string>(() => board.value[board.value.length - 1]?.charAt(2) ?? '')

const selectableCards = computed<string[]>(() => {
  if (board.value.length === 0) {
    if (match.value?.state?.firstTurnCard) {
      return [match.value?.state?.firstTurnCard]
    } else {
      return currentPlayer.value.cards?.filter(c => !FORBIDDEN_FIRST_TURN_CARDS.includes(c)) ?? []
    }
  }

  return getPossibleCards(currentPlayer.value.cards, head.value, tail.value)
})

const otherPlayers = computed<TMatchPlayer[]>(() => {
  const idx = playerIdx.value
  const players = match.value?.players ?? []
  return players.slice(idx + 1, players.length).concat(players.slice(0, idx))
})

const isSelectable = (card: string) => isPlayerTurn.value && selectableCards.value.includes(card)

const handleTurn = doc => {
  match.value = doc.data()

  if (match.value?.state.turn !== user.id) {
    return
  }

  if (selectableCards.value.length === 0 && !isMatchOver.value) {
    skipTurn()
    return
  }
}

const skipTurn = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const nextPlayer = match.value?.players?.[playerIdx.value + 1] ?? match.value?.players?.[0]
  const lastTurnPlayer = players.value.find(p => p.id === match.value?.state.lastTurn)
  const playersWithPenalty = players.value.map(p => {
    if (p.id === lastTurnPlayer?.id) {
      return {
        ...p,
        penalty: Math.max(p.penalty - SKIP_POINT, 0),
      }
    } else if (p.id === user.id) {
      return {
        ...p,
        penalty: p.penalty + SKIP_POINT,
      }
    } else {
      return p
    }
  })

  alert('No more possible cards! Skipping turn...')

  updateDoc(doc($db, 'matches', matchId), {
    players: playersWithPenalty,
    'state.turn': nextPlayer?.id,
  })
}

const handleSelectCard = (card: string) => {
  if (isMatchOver.value || !isPlayerTurn.value) {
    return
  }

  const canPlaceOnHead = card.includes(head.value)
  const canPlaceOnTail = card.includes(tail.value)

  if (board.value.length !== 0 && canPlaceOnHead && canPlaceOnTail && head.value !== tail.value) {
    selectedCard.value = card
    state.value = TURN_STATE.selectPosition
    return
  }

  if (canPlaceOnHead) {
    putCard(card, BOARD_POSITION.head)
  } else if (canPlaceOnTail) {
    putCard(card, BOARD_POSITION.tail)
  }
}

const handleSelectPosition = (position: BOARD_POSITION) => {
  putCard(selectedCard.value, position)
}

const putCard = async (card: string, position: BOARD_POSITION) => {
  const idx = currentPlayer.value.cards?.indexOf(card)
  currentPlayer.value.cards?.splice(idx, 1)

  if (position === BOARD_POSITION.head) {
    if (card.charAt(0) === head.value) {
      card = card.split('').reverse().join('')
    }
    board.value.unshift(card)
  } else if (position === BOARD_POSITION.tail) {
    if (card.charAt(2) === tail.value) {
      card = card.split('').reverse().join('')
    }
    board.value.push(card)
  }

  const nextPlayer = match.value?.players?.[playerIdx.value + 1] ?? match.value?.players?.[0]

  const updatedPlayers = match.value?.players?.map(p => {
    if (p.id === user.id) {
      return currentPlayer.value
    } else {
      return p
    }
  })

  const payload = {
    players: updatedPlayers,
    'state.board': board.value,
    'state.turn': nextPlayer?.id,
    'state.lastTurn': user.id,
  }

  if (currentPlayer.value.cards?.length === 0) {
    const playersWithPenalty = calculatePenalty(match.value, POLDAN_POINT, {
      playerId: currentPlayer.value.id,
      lastCard: card,
    })

    payload.players = playersWithPenalty
    payload['state.turn'] = user.id
  } else if (isMatchDraw.value) {
    const playersWithPenalty = calculatePenalty(match.value, GAPLE_POINT)

    payload.players = playersWithPenalty
    payload['state.turn'] = user.id
  }

  await updateDoc(doc($db, 'matches', matchId), payload)

  endTurn()
}

const endTurn = () => {
  state.value = TURN_STATE.pickCard
  selectedCard.value = ''
}

const nextRound = () => {
  if (!isRoomMaster.value) {
    return
  }

  const shuffledCards = shuffleCards()
  const playersWithCards = players.value.map(player => ({
    ...player,
    cards: shuffledCards.splice(0, 7),
  }))

  const payload = {
    players: playersWithCards,
    'state.board': [],
    'state.round': increment(1),
    'state.turn': match.value?.state?.lastTurn,
    'state.lastTurn': '',
    'state.firstTurnCard': '',
  }

  if (isMatchDraw.value) {
    let lastHead = head.value
    let lastTail = tail.value

    if (lastHead === '0' && lastTail === '0') {
      lastHead = '1'
      lastTail = '1'
    } else if (lastHead === '6' && lastTail === '6') {
      lastHead = '5'
      lastTail = '5'
    }

    const firstTurnCard = [lastHead, lastTail].sort().join('|')
    const firstTurnPlayer = playersWithCards.find(p => p.cards.includes(firstTurnCard))

    payload['state.turn'] = firstTurnPlayer!.id
    payload['state.firstTurnCard'] = firstTurnCard
  }

  updateDoc(doc($db, 'matches', matchId), payload)
}

const getPlayerPosition = idx => {
  return {
    0: 'right',
    1: 'top',
    2: 'left',
  }[idx]
}

onMounted(() => {
  unsubGameplay.value = onSnapshot(doc($db, 'matches', matchId), handleTurn)
})

onUnmounted(() => {
  if (unsubGameplay.value) {
    unsubGameplay.value()
  }
})
</script>
