<template>
  <div class="w-screen h-screen flex flex-col items-center justify-center gap-8">
    <!-- TODO: add share match & QR code -->
    <div v-if="isRoomMaster" class="flex flex-col items-center gap-4">
      <div v-if="isMatchFull">Match is full! Start the next match</div>
      <div v-else>Need {{ MAX_PLAYERS - players.length }} more players to start the match</div>

      <UButton size="lg" color="primary" variant="solid" :disabled="players.length < MAX_PLAYERS" @click="startMatch">
        Start Match
      </UButton>
    </div>
    <div v-else class="flex flex-col items-center gap-4">
      <div class="text-gray-500 animate-pulse">Waiting room master to start the match...</div>
      <UButton v-if="isPlayerInMatch" size="lg" color="red" variant="solid" @click="leaveMatch">Leave Match</UButton>
    </div>

    <div class="flex justify-center gap-4">
      <UBadge
        v-for="player in players"
        :key="player.id"
        color="black"
        :ui="{ rounded: 'rounded-full' }"
        :class="{
          'cursor-pointer': isRoomMaster && player.id !== settings.roomMaster,
        }"
        @click="kickPlayer(player.id)"
      >
        <div class="flex items-center gap-1">
          <UIcon v-if="settings.roomMaster === player.id" dynamic name="i-icon-park-twotone:crown-three" />
          <span>{{ player.name }}</span>
          <UIcon v-if="isRoomMaster && player.id !== settings.roomMaster" dynamic name="i-ci:close-md" />
        </div>
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore'

import { FIRST_TURN_CARD, MAX_PLAYERS } from '#imports'

const emits = defineEmits<{
  (e: 'start', match: TMatch): void
}>()

const { $db } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { match, settings, state, players, currentPlayer, isRoomMaster, isPlayerInMatch, isMatchFull, getPlayer } =
  useMatch()

const matchId = route.params.id as string

const unsubWaitForPlayers = ref()

const startMatch = async () => {
  if (!isRoomMaster.value) {
    return
  }

  const shuffledCards = shuffleCards()
  const playersWithCards = players.value.map(player => ({
    ...player,
    cards: shuffledCards.splice(0, 7),
  }))

  const firstTurnPlayer = findCardOwner(playersWithCards, FIRST_TURN_CARD)

  updateDoc(doc($db, 'matches', matchId), {
    players: playersWithCards,
    'state.round': 1,
    'state.turn': firstTurnPlayer?.id,
    'state.firstTurnCard': FIRST_TURN_CARD,
  })
}

const redirectToHome = () => {
  router.replace({ name: 'index' })
}

const leaveMatch = async () => {
  await updateDoc(doc($db, 'matches', matchId), {
    players: arrayRemove(currentPlayer.value),
  })

  unsubFirestore()

  toast.add({
    title: 'Left match! Redirecting to homepage...',
    timeout: 5000,
    callback: redirectToHome,
  })
}

const kickPlayer = async (id: string) => {
  if (!isRoomMaster.value) {
    return
  }

  const player = getPlayer(id)
  await updateDoc(doc($db, 'matches', matchId), {
    players: arrayRemove(player),
  })
  toast.add({ title: `${player.name} was kicked`, timeout: DEFAULT_TOAST_TIMEOUT })
}

const handleWaitForPlayers = doc => {
  match.value = doc.data()

  if (!isPlayerInMatch.value) {
    unsubFirestore()

    toast.add({
      title: 'You are kicked! Redirecting to homepage...',
      timeout: 5000,
      callback: redirectToHome,
    })
    return
  }

  if (state.value.round !== 0) {
    emits('start', match.value)
  }
}

const unsubFirestore = () => {
  if (unsubWaitForPlayers.value) {
    unsubWaitForPlayers.value()
  }
}

onMounted(() => {
  unsubWaitForPlayers.value = onSnapshot(doc($db, 'matches', route.params.id as string), handleWaitForPlayers)
})

onUnmounted(() => {
  unsubFirestore()
})
</script>
