<template>
  <div class="relative flex justify-center items-center w-screen h-screen">
    <BoardCards :cards="board" :is-selectable="state === TURN_STATE.selectPosition" @select="handleSelectPosition" />

    <div class="absolute bottom-0 w-full p-4">
      <div v-if="isPlayerTurn" class="text-center text-gray-400 mb-4">Your turn!</div>
      <div class="flex justify-center gap-4">
        <DominoCard
          v-for="card in player.cards"
          :key="card"
          :card="card"
          :is-selectable="isSelectable(card)"
          :is-disabled="isPlayerTurn && !selectableCards.includes(card)"
          @select="handleSelectCard"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

import { FORBIDDEN_FIRST_TURN_CARDS } from '~/constants/card'
import { BOARD_POSITION, TURN_STATE } from '~/constants/match'
import type { TMatch, TMatchPlayer } from '~/types/match'

const route = useRoute()
const { $db } = useNuxtApp()
const user = getUser()

const match = ref<TMatch>({} as TMatch)
const state = ref<TURN_STATE>(TURN_STATE.pickCard)
const selectedCard = ref('')
const unsubGameplay = ref()

const board = computed<string[]>(() => match.value.state?.board ?? [])
const player = computed<TMatchPlayer>(() => match.value.players?.find(p => p.id === user.id) ?? ({} as TMatchPlayer))
const isPlayerTurn = computed(() => match.value.state?.turn === user.id)
const head = computed<string>(() => board.value[0]?.charAt(0) ?? '')
const tail = computed<string>(() => board.value[board.value.length - 1]?.charAt(2) ?? '')

const selectableCards = computed<string[]>(() => {
  if (board.value.length === 0) {
    if (match.value.state?.lastRoundCard) {
      return [match.value.state?.lastRoundCard]
    } else {
      return player.value.cards?.filter(c => !FORBIDDEN_FIRST_TURN_CARDS.includes(c)) ?? []
    }
  }

  return getPossibleCards(player.value.cards, head.value, tail.value)
})

const isSelectable = (card: string) =>
  isPlayerTurn.value && state.value === TURN_STATE.pickCard && selectableCards.value.includes(card)

const handleTurn = doc => {
  match.value = doc.data()

  if (match.value.state.turn !== user.id) {
    return
  }

  if (selectableCards.value.length === 0) {
    skipTurn()
    return
  }
}

const skipTurn = () => {
  console.log('skip')
}

const handleSelectCard = (card: string) => {
  if (!isPlayerTurn.value || state.value !== TURN_STATE.pickCard) {
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
  const idx = player.value.cards?.indexOf(card)
  player.value.cards?.splice(idx, 1)

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

  const playerIdx = match.value.players?.findIndex(p => p.id === user.id)
  const nextPlayer = match.value.players?.[playerIdx + 1] ?? match.value.players?.[0]

  const players = match.value.players?.map(p => {
    if (p.id === user.id) {
      return player.value
    } else {
      return p
    }
  })

  await updateDoc(doc($db, 'matches', route.params.id as string), {
    players,
    'state.board': board.value,
    'state.turn': nextPlayer?.id,
    'state.lastTurn': user.id,
  })

  endTurn()
}

const endTurn = () => {
  state.value = TURN_STATE.pickCard
}

onMounted(() => {
  unsubGameplay.value = onSnapshot(doc($db, 'matches', route.params.id as string), handleTurn)
})

onUnmounted(() => {
  if (unsubGameplay.value) {
    unsubGameplay.value()
  }
})
</script>
