<template>
  <div class="w-screen h-screen flex items-center justify-center gap-4">
    <button class="rounded bg-green-500 text-white px-4 py-2" @click="createMatch">Create a new game</button>
    <button class="rounded bg-blue-500 text-white px-4 py-2" @click="joinMatch">Join existing game</button>
  </div>
</template>

<script setup lang="ts">
const createMatch = () => {
  console.log('createMatch')
}
const joinMatch = () => {
  console.log('joinMatch')
}
</script>
