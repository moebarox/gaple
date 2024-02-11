<template>
  <div>ID: {{ $route.params.id }}</div>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const { $db } = useNuxtApp()

onMounted(async () => {
  const id: string = route.params.id as string
  const match = await getDoc(doc($db, 'matches', id))
  console.log(match)
})
</script>
