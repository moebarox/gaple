<template>
  <button
    class="rounded-xl border-2 bg-gradient-to-r text-white drop-shadow-lg px-6 py-2"
    :class="{
      'from-green-400 to-green-500': variant === 'primary',
      'border-green-400': variant === 'primary',
      'from-red-400 to-red-500': variant === 'secondary',
      'border-red-400': variant === 'secondary',
      'cursor-not-allowed opacity-50': isDisabled,
    }"
    :disabled="isDisabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    isDisabled?: boolean
  }>(),
  {
    variant: 'primary',
    isDisabled: false,
  }
)
</script>
