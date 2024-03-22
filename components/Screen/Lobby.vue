<template>
  <div class="w-screen h-dvh flex flex-col items-center justify-center gap-8">
    <!-- TODO: add share match & QR code -->
    <div v-if="isPlayerInMatch" class="flex flex-col items-center gap-4">
      <template v-if="isMatchFull">
        <div v-if="isRoomMaster">
          {{ $t('info.matchFull') }}
        </div>
        <div v-else class="text-gray-500 animate-pulse">{{ $t('info.waitingToStart') }}</div>
      </template>
      <div v-else>{{ $t('info.needPlayer', { num: MAX_PLAYERS - players.length }) }}</div>

      <div class="flex gap-4">
        <UButton v-if="isRoomMaster && isMatchFull" size="lg" color="primary" variant="solid" @click="startMatch">
          {{ $t('action.startMatch') }}
        </UButton>
        <UButton size="lg" color="blue" variant="solid" @click="inviteOthers">
          {{ $t('action.inviteOthers') }}
        </UButton>
        <UButton v-if="!isRoomMaster" size="lg" color="red" variant="solid" @click="leaveMatch">
          {{ $t('action.leaveMatch') }}
        </UButton>
      </div>
    </div>

    <div class="flex flex-wrap justify-center gap-4">
      <UBadge
        v-for="player in players"
        :key="player.id"
        color="black"
        size="md"
        :ui="{ rounded: 'rounded-full' }"
        :class="{
          'cursor-pointer': isRoomMaster && player.id !== settings.roomMaster,
        }"
        @click="confirmKick(player)"
      >
        <div class="flex items-center gap-1">
          <UIcon v-if="settings.roomMaster === player.id" dynamic name="i-mdi:crown" />
          <span>{{ player.name }}</span>
          <UIcon v-if="isRoomMaster && player.id !== settings.roomMaster" dynamic name="i-mdi:close" />
        </div>
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore'

import { FIRST_TURN_CARD, MAX_PLAYERS, type TMatchPlayer } from '#imports'

const emits = defineEmits<{
  (e: 'start', match: TMatch): void
}>()

const { $db, $confirmation } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const { match, settings, state, players, currentPlayer, isRoomMaster, isPlayerInMatch, isMatchFull } = useMatch()

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

const inviteOthers = () => {
  const shareData: ShareData = {
    text: t('placeholder.share', { url: window.location.href }),
  }

  try {
    throw new Error('hehe')
    if (navigator.canShare(shareData)) {
      navigator.share(shareData)
    } else {
      navigator.clipboard.writeText(shareData.text!)
      toast.add({
        title: t('notification.copiedToClipboard'),
      })
    }
  } catch (err) {
    console.error(err)
    toast.add({
      title: t('notification.error'),
      timeout: DEFAULT_TOAST_TIMEOUT,
    })
  }
}

const leaveMatch = async () => {
  await updateDoc(doc($db, 'matches', matchId), {
    players: arrayRemove(currentPlayer.value),
  })

  unsubFirestore()

  toast.add({
    title: t('notification.leftMatch'),
    timeout: 5000,
    callback: redirectToHome,
  })
}

const confirmKick = (player: TMatchPlayer) => {
  if (!isRoomMaster.value || player.id === settings.value.roomMaster) {
    return
  }

  $confirmation.open({
    text: t('confirm.kick.text', { playerName: player.name }),
    preventClose: true,
    onConfirm: () => kickPlayer(player),
  })
}

const kickPlayer = async (player: TMatchPlayer) => {
  if (!isRoomMaster.value || player.id === settings.value.roomMaster) {
    return
  }

  await updateDoc(doc($db, 'matches', matchId), {
    players: arrayRemove(player),
  })
  toast.add({
    title: t('notification.playerKicked', { playerName: player.name }),
    timeout: DEFAULT_TOAST_TIMEOUT,
  })
}

const handleWaitForPlayers = doc => {
  match.value = doc.data()

  if (!isPlayerInMatch.value) {
    unsubFirestore()

    toast.add({
      title: t('notification.kicked'),
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
