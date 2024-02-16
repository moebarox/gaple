<template>
  <div
    class="rounded bg-gray-200 px-4 py-2"
    :class="{
      'opacity-50': isDisabled,
      'cursor-pointer': isSelectable,
    }"
    :disabled="isDisabled"
    @click="$emit('select', card)"
  >
    {{ card }}
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    card: string
    isDisabled?: boolean
    isSelectable?: boolean
  }>(),
  {
    isDisabled: false,
    isSelectable: false,
  }
)
</script>
