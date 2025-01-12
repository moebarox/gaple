<!-- TODO: add analytics -->
<template>
  <div class="max-w-screen-sm mx-auto h-dvh flex flex-col items-center justify-center gap-8 relative bg-gradient-to-br from-[#2a2e31] to-[#202427] text-white">
    <img src="/images/logo.png" alt="logo" class="w-[300px]" />
    <div class="flex flex-col justify-center gap-4 w-full p-4 md:flex-row">
      <div class="grow md:grow-0">
        <UButton
          size="lg"
          color="primary"
          variant="solid"
          class="w-full justify-center px-8 md:w-auto"
          @click="openCreateMatchModal"
        >
          {{ $t('action.createMatch') }}
        </UButton>
      </div>
      <div class="grow md:grow-0">
        <UButton
          size="lg"
          color="red"
          variant="solid"
          class="w-full justify-center px-8 md:w-auto"
          @click="openJoinMatchModal"
        >
          {{ $t('action.joinMatch') }}
        </UButton>
      </div>
    </div>
  </div>

  <UModal v-model="isCreateModalOpen" prevent-close>
    <form class="flex flex-col gap-8 p-8" @submit.prevent="createMatch">
      <div class="flex flex-col gap-2">
        <div>{{ $t('form.name.label') }}</div>
        <UInput v-model="name" size="lg" />
      </div>
      <div class="flex flex-col gap-2">
        <div>{{ $t('form.isPrivate.label') }}</div>
        <UToggle v-model="isMatchPrivate" />
      </div>
      <div v-if="isMatchPrivate" class="flex flex-col gap-2">
        <div>{{ $t('form.password.label') }}</div>
        <UInput v-model="password" size="lg" />
      </div>

      <div class="flex flex-col gap-4">
        <UButton
          block
          size="lg"
          color="primary"
          variant="solid"
          type="submit"
          :disabled="isMatchPrivate && password.length < MIN_PASSWORD_LENGTH"
        >
          {{ $t('action.createMatch') }}
        </UButton>
        <UButton block size="lg" color="red" variant="solid" @click="closeCreateModal">
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </form>
  </UModal>

  <UModal v-model="isJoinModalOpen" prevent-close>
    <form class="flex flex-col gap-8 p-8" @submit.prevent="joinMatch">
      <div class="flex flex-col gap-2">
        <div>{{ $t('form.matchId.label') }}</div>
        <UInput v-model="matchId" size="lg" />
      </div>

      <div class="flex flex-col gap-4">
        <UButton block size="lg" color="primary" variant="solid" type="submit">{{ $t('action.joinMatch') }}</UButton>
        <UButton block size="lg" color="red" variant="solid" @click="closeJoinModal">
          {{ $t('common.cancel') }}
        </UButton>
      </div>
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
    name: 'match-id',
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

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const openJoinMatchModal = () => {
  matchId.value = ''
  isJoinModalOpen.value = true
}

const closeJoinModal = () => {
  isJoinModalOpen.value = false
}

const joinMatch = () => {
  if (!matchId.value) {
    return
  }

  router.push({
    name: 'match-id',
    params: {
      id: matchId.value,
    },
  })
}
</script>
