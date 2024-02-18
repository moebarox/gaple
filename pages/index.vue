<template>
  <div class="w-screen h-screen flex items-center justify-center gap-4">
    <button class="rounded bg-green-500 text-white px-4 py-2" @click="createMatch">Create a new game</button>
    <button class="rounded bg-blue-500 text-white px-4 py-2" @click="joinMatch">Join existing game</button>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc } from 'firebase/firestore'

const router = useRouter()
const { $db } = useNuxtApp()

const createMatch = async () => {
  const user = getUser()
  const password = prompt('Enter password:')

  if (password === null) {
    return
  }

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
