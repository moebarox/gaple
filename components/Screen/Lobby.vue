<template>
  <div class="w-screen h-screen flex flex-col items-center justify-center gap-8">
    <!-- TODO: add share match & QR code -->
    <UButton
      v-if="isRoomMaster"
      size="lg"
      color="primary"
      variant="solid"
      :disabled="players.length < MAX_PLAYERS"
      @click="startMatch"
    >
      Start Match
    </UButton>
    <div v-else class="flex flex-col items-center gap-4">
      <div class="text-gray-500 animate-pulse">Waiting room master to start the match...</div>
      <!-- TODO: handle leave match -->
      <UButton size="lg" color="red" variant="solid"> Leave Match </UButton>
    </div>

    <div class="flex justify-center gap-4">
      <!-- TODO: add kick player -->
      <UBadge v-for="player in players" :key="player.id" color="black" :ui="{ rounded: 'rounded-full' }">
        {{ player.name }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

const emits = defineEmits<{
  (e: 'start', match: TMatch): void
}>()

const { $db } = useNuxtApp()
const route = useRoute()
const user = getUser()

const match = ref<TMatch>({} as TMatch)
const unsubWaitForPlayers = ref()

const players = computed(() => match.value?.players ?? [])
const isRoomMaster = computed(() => match.value?.settings?.roomMaster === user.id)

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

  updateDoc(doc($db, 'matches', route.params.id as string), {
    players: playersWithCards,
    'state.round': 1,
    'state.turn': firstTurnPlayer?.id,
    'state.firstTurnCard': FIRST_TURN_CARD,
  })
}

const handleWaitForPlayers = doc => {
  match.value = doc.data()

  if (match.value?.state.round !== 0) {
    emits('start', match.value)
  }
}

onMounted(() => {
  unsubWaitForPlayers.value = onSnapshot(doc($db, 'matches', route.params.id as string), handleWaitForPlayers)
})

onUnmounted(() => {
  if (unsubWaitForPlayers.value) {
    unsubWaitForPlayers.value()
  }
})
</script>
