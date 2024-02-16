<template>
  <div class="absolute">
    <div class="flex justify-center gap-1">
      <DominoCard
        v-for="(card, idx) in cards"
        :key="card"
        :card="card"
        :is-selectable="isSelectable && isPositionSelectable(idx)"
        :is-disabled="isSelectable && !isPositionSelectable(idx)"
        @select="handleSelect(idx)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BOARD_POSITION } from '~/constants/match'

const props = withDefaults(
  defineProps<{
    cards: string[]
    isSelectable: boolean
  }>(),
  {
    isSelectable: false,
  }
)

const emits = defineEmits<{
  (e: 'select', position: BOARD_POSITION): void
}>()

const isPositionSelectable = (idx: number) => idx === 0 || idx === props.cards.length - 1

const handleSelect = (idx: number) => {
  if (idx === 0) {
    emits('select', BOARD_POSITION.head)
  } else {
    emits('select', BOARD_POSITION.tail)
  }
}
</script>
