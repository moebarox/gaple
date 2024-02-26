<template>
  <div>
    <template v-if="isEnteredMatch">
      <ScreenMatch v-if="isStarted" />
      <ScreenLobby v-else @start="handleStartMatch" />
    </template>
  </div>

  <UModal v-model="isPasswordModalOpen" prevent-close>
    <form class="flex flex-col gap-8 p-8" @submit.prevent="validatePassword">
      <div class="flex flex-col gap-2">
        <div>Enter your name</div>
        <UInput v-model="name" size="lg" />
      </div>
      <div class="flex flex-col gap-2">
        <div>Enter password</div>
        <UInput v-model="password" size="lg" />
      </div>
      <InterfaceButton :is-disabled="password.length < MIN_PASSWORD_LENGTH" type="submit">Enter Game</InterfaceButton>
    </form>
  </UModal>

  <UNotifications />
</template>

<script setup lang="ts">
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const { $db } = useNuxtApp()

const matchId = route.params.id as string

const match = ref<TMatch>({} as TMatch)
const isEnteredMatch = ref(false)
const isPasswordModalOpen = ref(false)
const name = ref('')
const password = ref('')

const players = computed(() => match.value?.players ?? [])
const isStarted = computed(() => match.value?.state?.round > 0)
const isPlayerNotInMatch = computed(() => !players.value.some(p => p.id === getUser().id))

const handleStartMatch = (palyload: TMatch) => {
  match.value = palyload
}

const openPasswordModal = () => {
  const user = getUser()
  name.value = user.name
  password.value = ''
  isPasswordModalOpen.value = true
}

const validatePassword = () => {
  if (password.value !== match.value?.settings?.password) {
    toast.add({ title: 'Wrong password!', timeout: 2000 })
    return
  }

  isPasswordModalOpen.value = false
  enterMatch()
}

const redirectToHome = () => {
  router.replace({ name: 'index' })
}

const enterMatch = () => {
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
  if (match.value?.settings?.password && isPlayerNotInMatch.value) {
    openPasswordModal()
    return
  }

  enterMatch()
})
</script>
