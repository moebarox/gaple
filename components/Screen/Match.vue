<template>
  <div class="relative flex justify-center items-center w-screen h-dvh overflow-hidden">
    <AssetsBoard
      :show-head-placeholder="!isMatchOver && isPlayerTurn && possiblyPlacedOnHead"
      :show-tail-placeholder="!isMatchOver && isPlayerTurn && possiblyPlacedOnTail"
      :can-select-position="!isMatchOver && isPlayerTurn && turnState === TURN_STATE.selectPosition"
      @select="handleSelectPosition"
    />

    <AssetsPlayerInfo
      v-for="(player, idx) in otherPlayers"
      :key="player.id"
      show-cards
      :player="player"
      :position="idx"
      :is-reveal-card="isMatchOver"
      :is-highlighted="!isMatchOver && match?.state?.turn === player.id"
      :is-rt="match?.state?.rt === player.id"
    />

    <div class="absolute text-center bottom-0 w-full">
      <UButton v-if="isMatchOver && isRoomMaster" size="lg" color="primary" variant="solid" @click="nextRound">
        Start Next Round!
      </UButton>

      <div class="flex flex-col items-center md:flex-row-reverse">
        <div class="flex justify-center grow gap-3 p-2 md:justify-end md:gap-4 md:p-4">
          <AssetsDomino
            v-for="card in currentPlayer.cards"
            :key="card"
            :card="card"
            :width="cardSize"
            :is-selectable="!isMatchOver && isSelectable(card)"
            :is-disabled="!isMatchOver && isPlayerTurn && !selectableCards.includes(card)"
            :class="{
              '-translate-y-4': card === selectedCard,
            }"
            @select="handleSelectCard"
          />
        </div>
        <AssetsPlayerInfo
          :player="currentPlayer"
          :position="PLAYER_INFO_POSITION.bottom"
          :is-highlighted="!isMatchOver && match?.state?.turn === currentPlayer.id"
          :is-rt="match?.state?.rt === currentPlayer.id"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore'

import {
  TURN_STATE,
  BOARD_POSITION,
  FORBIDDEN_FIRST_TURN_CARDS,
  SKIP_POINT,
  GAPLE_POINT,
  POLDAN_POINT,
  DEFAULT_TOAST_TIMEOUT,
} from '#imports'

const route = useRoute()
const { $db, $viewport } = useNuxtApp()
const { user } = useUser()
const toast = useToast()
const {
  match,
  players,
  state,
  board,
  head,
  tail,
  playerIdx,
  currentPlayer,
  nextPlayer,
  isRoomMaster,
  isPlayerTurn,
  isMatchOver,
  isMatchDraw,
} = useMatch()

const matchId = route.params.id as string

const turnState = ref<TURN_STATE>(TURN_STATE.pickCard)
const selectedCard = ref('')
const unsubGameplay = ref()

const otherPlayers = computed<TMatchPlayer[]>(() => {
  const idx = playerIdx.value
  return players.value.slice(idx + 1, players.value.length).concat(players.value.slice(0, idx))
})

const selectableCards = computed<string[]>(() => {
  if (board.value.length === 0) {
    if (state.value.firstTurnCard) {
      return [state.value.firstTurnCard]
    } else {
      return currentPlayer.value.cards?.filter(c => !FORBIDDEN_FIRST_TURN_CARDS.includes(c)) ?? []
    }
  }

  return getPossibleCards(currentPlayer.value.cards, head.value, tail.value)
})

const possiblyPlacedOnHead = computed(() => selectableCards.value.some(c => c.includes(head.value)))
const possiblyPlacedOnTail = computed(() => selectableCards.value.some(c => c.includes(tail.value)))
const cardSize = computed(() => ($viewport.isGreaterOrEquals('md') ? 70 : 40))

const isSelectable = (card: string) => isPlayerTurn.value && selectableCards.value.includes(card)

const handleTurn = async doc => {
  match.value = doc.data()

  if (isMatchOver.value) {
    toast.add({
      title: 'Game over! Waiting for room master to start a new match...',
      timeout: DEFAULT_TOAST_TIMEOUT,
    })
    return
  }

  if (!isPlayerTurn.value) {
    return
  }

  if (selectableCards.value.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      title: 'No more possible cards! Skipping turn...',
      timeout: 5000,
      click: () => {
        skipTurn()
      },
      callback: () => {
        skipTurn()
      },
    })

    return
  }

  toast.add({
    title: 'Your turn!',
    timeout: DEFAULT_TOAST_TIMEOUT,
  })
}

const skipTurn = () => {
  const lastTurnPlayer = players.value.find(p => p.id === state.value.lastTurn)
  const playersWithPenalty = players.value.map(p => {
    if (p.id === lastTurnPlayer?.id) {
      return {
        ...p,
        penalty: Math.max(p.penalty - SKIP_POINT, 0),
      }
    } else if (p.id === user.value.id) {
      return {
        ...p,
        penalty: p.penalty + SKIP_POINT,
      }
    } else {
      return p
    }
  })

  updateDoc(doc($db, 'matches', matchId), {
    players: playersWithPenalty,
    'state.turn': nextPlayer.value.id,
  })
}

const handleSelectCard = (card: string) => {
  if (isMatchOver.value || !isPlayerTurn.value) {
    return
  }

  if (card === selectedCard.value) {
    selectedCard.value = ''
    turnState.value = TURN_STATE.pickCard
    return
  }

  const canPlaceOnHead = card.includes(head.value)
  const canPlaceOnTail = card.includes(tail.value)

  if (board.value.length !== 0 && canPlaceOnHead && canPlaceOnTail && head.value !== tail.value) {
    selectedCard.value = card
    turnState.value = TURN_STATE.selectPosition
    toast.add({
      title: 'Please select where to place card on the board!',
      timeout: DEFAULT_TOAST_TIMEOUT,
    })
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

  const updatedPlayers = players.value.map(p => {
    if (p.id === user.value.id) {
      return currentPlayer.value
    } else {
      return p
    }
  })

  const payload = {
    players: updatedPlayers,
    'state.board': board.value,
    'state.turn': nextPlayer.value.id,
    'state.lastTurn': user.value.id,
  }

  if (currentPlayer.value.cards?.length === 0) {
    const playersWithPenalty = calculatePenalty(match.value, POLDAN_POINT, {
      playerId: currentPlayer.value.id,
      lastCard: card,
    })

    payload.players = playersWithPenalty
    payload['state.turn'] = user.value.id
  } else if (isMatchDraw.value) {
    const playersWithPenalty = calculatePenalty(match.value, GAPLE_POINT)

    payload.players = playersWithPenalty
    payload['state.turn'] = user.value.id
  }

  await updateDoc(doc($db, 'matches', matchId), payload)

  endTurn()
}

const endTurn = () => {
  turnState.value = TURN_STATE.pickCard
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
    'state.turn': state.value.lastTurn,
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

const unsubFirestore = () => {
  if (unsubGameplay.value) {
    unsubGameplay.value()
  }
}

onMounted(() => {
  unsubGameplay.value = onSnapshot(doc($db, 'matches', matchId), handleTurn)
})

onUnmounted(() => {
  unsubFirestore()
})
</script>
