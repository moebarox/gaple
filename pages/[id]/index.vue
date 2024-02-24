<template>
  <div>
    <template v-if="players.length > 0">
      <ScreenMatch v-if="isStarted" />
      <ScreenLobby v-else @start="handleStartMatch" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const { $db } = useNuxtApp()

const match = ref<TMatch>({} as TMatch)

const players = computed(() => match.value?.players ?? [])
const isStarted = computed(() => match.value?.state?.round > 0)

const handleStartMatch = (palyload: TMatch) => {
  match.value = palyload
}

onMounted(async () => {
  const id: string = route.params.id as string
  const docSnap = await getDoc(doc($db, 'matches', id))

  if (!docSnap.exists()) {
    router.replace({ name: 'index' })
  }

  match.value = docSnap.data() as TMatch
  if (match.value?.settings?.password) {
    const password = prompt('Enter password:')
    if (password !== match.value?.settings?.password) {
      alert('Incorrect password!')
      return
    }
  }

  const user = getUser()
  if (players.value.length >= MAX_PLAYERS && !players.value.some(p => p.id === user.id)) {
    alert('Match is full!')
    router.replace({ name: 'index' })
    return
  }

  if (!players.value.some(p => p.id === user.id)) {
    updateDoc(doc($db, 'matches', id), {
      players: arrayUnion({
        id: user.id,
        name: user.name,
        cards: [],
        penalty: 0,
      }),
    })
  }
})
</script>
