<template>
  <div
    class="rounded bg-gray-200 text-black px-4 py-2"
    :class="{
      'opacity-50': isDisabled,
      'cursor-pointer': isSelectable,
    }"
    @click="handleClick"
  >
    {{ card }}
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
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

const emits = defineEmits<{
  (e: 'select', card: string): void
}>()

const handleClick = () => {
  if (props.isDisabled || !props.isSelectable) {
    return
  }

  emits('select', props.card)
}
</script>
