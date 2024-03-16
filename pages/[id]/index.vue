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
      <div v-if="settings.password" class="flex flex-col gap-2">
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

import { MIN_PASSWORD_LENGTH, DEFAULT_TOAST_TIMEOUT } from '#imports'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { $db } = useNuxtApp()
const { user, setName } = useUser()
const { match, settings, state, isPlayerInMatch, isMatchFull } = useMatch()

const matchId = route.params.id as string

const isEnteredMatch = ref(false)
const isProfileModalOpen = ref(false)
const name = ref('')
const password = ref('')

const isStarted = computed(() => state.value.round > 0)
const isRequirePassword = computed(() => settings.value.password !== '')

const handleStartMatch = (palyload: TMatch) => {
  match.value = palyload
}

const openProfileModal = () => {
  name.value = user.value.name || getRandomName()
  password.value = ''
  isProfileModalOpen.value = true
}

const redirectToHome = () => {
  router.replace({ name: 'index' })
}

const enterMatch = () => {
  if (!isPlayerInMatch.value && isRequirePassword.value && password.value !== settings.value.password) {
    toast.add({ title: 'Wrong password!', timeout: DEFAULT_TOAST_TIMEOUT })
    return
  }

  isProfileModalOpen.value = false

  setName(name.value)

  if (isMatchFull.value && !isPlayerInMatch.value) {
    toast.add({
      title: 'Match is full! Redirecting to homepage...',
      timeout: 5000,
      callback: redirectToHome,
    })
    return
  }

  if (!isPlayerInMatch.value) {
    updateDoc(doc($db, 'matches', matchId), {
      players: arrayUnion({
        id: user.value.id,
        name: user.value.name,
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
  if (!isPlayerInMatch.value) {
    openProfileModal()
    return
  }

  enterMatch()
})
</script>
