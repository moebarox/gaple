<!-- TODO: add analytics -->
<template>
  <div class="w-screen h-dvh flex flex-col items-center justify-center gap-8">
    <img src="/images/logo.png" alt="logo" class="w-[300px]" />
    <div class="flex flex-col justify-center gap-4 w-full p-4 md:flex-row">
      <div class="grow">
        <UButton block size="lg" color="primary" variant="solid" @click="openCreateMatchModal">
          Create a New Game
        </UButton>
      </div>
      <div class="grow">
        <UButton block size="lg" color="red" variant="solid" @click="openJoinMatchModal">Join Existing Game</UButton>
      </div>
    </div>
  </div>

  <UModal v-model="isCreateModalOpen">
    <form class="flex flex-col gap-8 p-8" @submit.prevent="createMatch">
      <div class="flex flex-col gap-2">
        <div>Enter your name</div>
        <UInput v-model="name" size="lg" />
      </div>
      <div class="flex flex-col gap-2">
        <div>Is this game private?</div>
        <UToggle v-model="isMatchPrivate" />
      </div>
      <div v-if="isMatchPrivate" class="flex flex-col gap-2">
        <div>Enter password</div>
        <UInput v-model="password" size="lg" />
      </div>
      <UButton
        block
        size="lg"
        color="primary"
        variant="solid"
        type="submit"
        :disabled="isMatchPrivate && password.length < MIN_PASSWORD_LENGTH"
      >
        Create Game
      </UButton>
    </form>
  </UModal>

  <UModal v-model="isJoinModalOpen">
    <form class="flex flex-col gap-8 p-8" @submit.prevent="joinMatch">
      <div class="flex flex-col gap-2">
        <div>Enter match id</div>
        <UInput v-model="matchId" size="lg" />
      </div>
      <UButton block size="lg" color="primary" variant="solid" type="submit">Join Game</UButton>
    </form>
  </UModal>
</template>

<script setup lang="ts">
import { collection, addDoc, Timestamp } from 'firebase/firestore'

import { DEFAULT_MATCH, MATCH_EXPIRE_TIME, MIN_PASSWORD_LENGTH } from '#imports'

const router = useRouter()
const { $db } = useNuxtApp()
const { user, setName } = useUser()

const isCreateModalOpen = ref(false)
const isJoinModalOpen = ref(false)
const isMatchPrivate = ref(false)
const name = ref('')
const password = ref('')
const matchId = ref('')

const createMatch = async () => {
  if (isMatchPrivate.value && password.value.trim() === '') {
    return
  }

  setName(name.value)

  // set expires in 7 days
  const expireAt = new Date(Date.now() + MATCH_EXPIRE_TIME)
  const docRef = await addDoc(collection($db, 'matches'), {
    ...DEFAULT_MATCH,
    players: [
      {
        id: user.value.id,
        name: user.value.name,
        cards: [],
        penalty: 0,
      },
    ],
    settings: {
      ...DEFAULT_MATCH.settings,
      password: password.value.trim(),
      roomMaster: user.value.id,
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

const openCreateMatchModal = () => {
  name.value = user.value.name
  isMatchPrivate.value = false
  password.value = ''
  isCreateModalOpen.value = true
}

const openJoinMatchModal = () => {
  matchId.value = ''
  isJoinModalOpen.value = true
}

const joinMatch = () => {
  if (!matchId.value) {
    return
  }

  router.push({
    name: 'id',
    params: {
      id: matchId.value,
    },
  })
}
</script>
