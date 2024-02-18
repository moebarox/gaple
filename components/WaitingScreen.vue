<template>
  <div class="w-screen h-screen flex flex-col items-center justify-center gap-4">
    <button
      v-if="isRoomMaster"
      class="rounded bg-green-500 text-white px-4 py-2"
      :class="{ 'cursor-not-allowed opacity-50': players.length < MAX_PLAYERS }"
      :disabled="players.length < MAX_PLAYERS"
      @click="startMatch"
    >
      Start match
    </button>
    <div v-else class="text-gray-400">Waiting room master to start the match...</div>

    <div class="flex justify-center gap-4">
      <div v-for="player in players" :key="player.id">
        {{ player.name }}
      </div>
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
