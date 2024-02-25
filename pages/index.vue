<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <div class="flex flex-wrap justify-center gap-4">
      <InterfaceButton variant="primary" @click="createMatch">Create a New Game</InterfaceButton>
      <InterfaceButton variant="secondary" @click="joinMatch">Join Existing Game</InterfaceButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, Timestamp } from 'firebase/firestore'

const router = useRouter()
const { $db } = useNuxtApp()

const createMatch = async () => {
  const user = getUser()
  const password = prompt('Enter password:')

  if (password === null) {
    return
  }

  const expireAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  const docRef = await addDoc(collection($db, 'matches'), {
    ...DEFAULT_MATCH,
    players: [
      {
        id: user.id,
        name: user.name,
        cards: [],
        penalty: 0,
      },
    ],
    settings: {
      ...DEFAULT_MATCH.settings,
      password: password?.trim(),
      roomMaster: user.id,
    },
    expireAt: Timestamp.fromDate(expireAt),
  })
  router.replace({
    name: 'id',
    params: {
      id: docRef.id,
    },
  })
}

const joinMatch = () => {
  const id = prompt('Enter match id:')

  if (!id) {
    return
  }

  router.push({
    name: 'id',
    params: {
      id,
    },
  })
}
</script>
