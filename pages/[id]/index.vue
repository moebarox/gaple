<template>
  <div>
    <template v-if="isEnteredMatch">
      <ScreenMatch v-if="isStarted" />
      <ScreenLobby v-else @start="handleStartMatch" />
    </template>
  </div>

  <UModal v-model="isProfileModalOpen" prevent-close>
    <form class="flex flex-col gap-8 p-8" @submit.prevent="enterMatch">
      <div class="flex flex-col gap-2">
        <div>Enter your name</div>
        <UInput v-model="name" size="lg" />
      </div>
      <div v-if="match?.settings?.password" class="flex flex-col gap-2">
        <div>Enter password</div>
        <UInput v-model="password" size="lg" />
      </div>
      <UButton
        block
        size="lg"
        color="primary"
        variant="solid"
        type="submit"
        :disabled="isRequirePassword && password.length < MIN_PASSWORD_LENGTH"
      >
        Enter Game
      </UButton>
    </form>
  </UModal>

  <UNotifications :ui="{ position: 'bottom-40 left-1/2 -translate-x-1/2' }" />
</template>

<script setup lang="ts">
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

import { MAX_PLAYERS, MIN_PASSWORD_LENGTH, DEFAULT_TOAST_TIMEOUT } from '#imports'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { $db } = useNuxtApp()

const matchId = route.params.id as string

const match = ref<TMatch>({} as TMatch)
const isEnteredMatch = ref(false)
const isProfileModalOpen = ref(false)
const name = ref('')
const password = ref('')

const players = computed(() => match.value?.players ?? [])
const isStarted = computed(() => match.value?.state?.round > 0)
const isPlayerNotInMatch = computed(() => !players.value.some(p => p.id === getUser().id))
const isRequirePassword = computed(() => match.value?.settings?.password !== '')

const handleStartMatch = (palyload: TMatch) => {
  match.value = palyload
}

const openProfileModal = () => {
  const user = getUser()
  name.value = user.name
  password.value = ''
  isProfileModalOpen.value = true
}

const redirectToHome = () => {
  router.replace({ name: 'index' })
}

const enterMatch = () => {
  if (isPlayerNotInMatch.value && isRequirePassword.value && password.value !== match.value?.settings?.password) {
    toast.add({ title: 'Wrong password!', timeout: DEFAULT_TOAST_TIMEOUT })
    return
  }

  isProfileModalOpen.value = false

  setUser(name.value)
  const user = getUser()

  if (players.value.length >= MAX_PLAYERS && isPlayerNotInMatch.value) {
    toast.add({
      title: 'Match is full! Redirecting to homepage...',
      timeout: 5000,
      callback: redirectToHome,
    })
    return
  }

  if (isPlayerNotInMatch.value) {
    updateDoc(doc($db, 'matches', matchId), {
      players: arrayUnion({
        id: user.id,
        name: user.name,
        cards: [],
        penalty: 0,
      }),
    })
  }

  isEnteredMatch.value = true
}

onMounted(async () => {
  const docSnap = await getDoc(doc($db, 'matches', matchId))

  if (!docSnap.exists()) {
    router.replace({ name: 'index' })
  }

  match.value = docSnap.data() as TMatch
  if (isPlayerNotInMatch.value) {
    openProfileModal()
    return
  }

  enterMatch()
})
</script>
