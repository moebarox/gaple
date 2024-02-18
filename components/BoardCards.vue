<template>
  <div class="flex flex-col gap-1 p-4">
    <div
      v-for="(cards, rowIdx) in chunkedCards"
      :key="rowIdx"
      class="flex flex-wrap gap-1"
      :class="{
        'justify-end': rowIdx === 0,
        [rowDirection(rowIdx)]: true,
      }"
    >
      <DominoCard
        v-for="(card, cardIdx) in cards"
        :key="card"
        :card="card"
        :is-selectable="isSelectable && isCardSelectable(card)"
        :is-disabled="isSelectable && !isCardSelectable(card)"
        @select="handleSelect(cardIdx)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import chunk from 'lodash/chunk'

import { BOARD_POSITION } from '#imports'

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

const chunkedCards = computed<string[][]>(() => {
  const divider = 5

  if (props.cards.length <= divider) {
    return [props.cards]
  }

  const clonedCards = [...props.cards]
  const firstSize = Math.floor((props.cards.length % divider) / 2)
  const firstArray = clonedCards.splice(0, firstSize)
  const remainingArray = chunk(clonedCards, divider)
  return [firstArray, ...remainingArray].filter(arr => arr.length > 0)
})

const isCardSelectable = (card: string) => {
  return card === props.cards[0] || card === props.cards[props.cards.length - 1]
}

const handleSelect = (idx: number) => {
  if (!props.isSelectable) return

  if (idx === 0) {
    emits('select', BOARD_POSITION.head)
  } else {
    emits('select', BOARD_POSITION.tail)
  }
}

const rowDirection = (idx: number) => {
  if (chunkedCards.value.length % 2 === 0 || chunkedCards.value.length === 1) {
    return idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
  } else {
    return idx % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
  }
}
</script>
