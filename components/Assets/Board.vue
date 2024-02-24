<template>
  <div
    class="absolute top-28 left-28 right-28 bottom-28 bg-[#354566] rounded-full border-[36px] border-[#3d5172] drop-shadow-2xl shadow-inner before:absolute before:top-4 before:left-4 before:right-4 before:bottom-4 before:rounded-full before:border-2 before:border-[#3d5172] before:z-[-1]"
  >
    <div ref="innerBoard" class="w-full h-full">
      <template v-for="(cards, rowIdx) in chunkedCards" :key="rowIdx">
        <AssetsDomino
          v-for="(card, cardIdx) in cards"
          :key="card"
          :card="card"
          size="small"
          class="absolute"
          :style="generateCardStyle(rowIdx, cardIdx)"
          @select="handleSelect(cardIdx)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import chunk from 'lodash/chunk'

import { BOARD_POSITION } from '#imports'

const BOARD_CARD_LENGTH = 70

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

const innerBoard = ref<HTMLDivElement | null>(null)
const innerBoardPaddingHorizontal = ref(0)
const innerBoardCenterVertical = ref(0)
const innerBoardCenterHorizontal = ref(0)
const cardPerRow = ref(0)

const chunkedCards = computed<string[][]>(() => {
  if (props.cards.length <= cardPerRow.value) {
    return [props.cards]
  }

  const clonedCards = [...props.cards]
  const firstSize = Math.ceil((props.cards.length % cardPerRow.value) / 2)
  const firstArray = clonedCards.splice(0, firstSize)
  const remainingArray = chunk(clonedCards, cardPerRow.value)
  return [firstArray, ...remainingArray].filter(arr => arr.length > 0)
})

const generateCardStyle = (rowIdx: number, columnIdx: number) => {
  const style: Record<string, string> = {}
  const isFirstRow = rowIdx === 0
  const hasMultipleRow = chunkedCards.value.length > 1
  const isDirectionRightToLeft = hasMultipleRow && rowIdx % 2 === 0
  const isReversed = isCardReversed(chunkedCards.value[rowIdx][columnIdx])

  const centerRowIdx = Math.floor(chunkedCards.value.length / 2)
  const centerColumnIdx = chunkedCards.value.length === 1 ? chunkedCards.value[0].length / 2 : cardPerRow.value / 2

  const relativeRowPosition = rowIdx - centerRowIdx
  const relativeColumnPosition = columnIdx - centerColumnIdx

  let y = innerBoardCenterVertical.value + relativeRowPosition * BOARD_CARD_LENGTH - BOARD_CARD_LENGTH / 2
  let x = innerBoardCenterHorizontal.value + relativeColumnPosition * BOARD_CARD_LENGTH

  if (columnIdx !== 0 || (isFirstRow && chunkedCards.value[0].length < cardPerRow.value)) {
    if ((isReversed && !isDirectionRightToLeft) || (!isReversed && isDirectionRightToLeft)) {
      style.transform = 'rotate(90deg)'
    } else {
      style.transform = 'rotate(-90deg)'
    }
  } else {
    y -= BOARD_CARD_LENGTH / 4
    x += BOARD_CARD_LENGTH / 4

    if (isReversed) {
      style.transform = 'rotate(180deg)'
    }
  }

  if (isFirstRow && hasMultipleRow) {
    const emptyCards = cardPerRow.value - chunkedCards.value[rowIdx].length
    x += emptyCards * BOARD_CARD_LENGTH
  }

  style.top = `${y}px`

  if (isDirectionRightToLeft) {
    style.right = `${x}px`
  } else {
    style.left = `${x}px`
  }

  return style
}

const isCardReversed = card => card.at(0) > card.at(2)

const handleSelect = (idx: number) => {
  if (!props.isSelectable) return

  if (idx === 0) {
    emits('select', BOARD_POSITION.head)
  } else {
    emits('select', BOARD_POSITION.tail)
  }
}

const calculateBoardSize = () => {
  if (!innerBoard.value) return
  cardPerRow.value = Math.floor(innerBoard.value.offsetWidth / BOARD_CARD_LENGTH)
  innerBoardPaddingHorizontal.value = (innerBoard.value.offsetWidth % BOARD_CARD_LENGTH) / 2
  innerBoardCenterVertical.value = innerBoard.value.offsetHeight / 2
  innerBoardCenterHorizontal.value = innerBoard.value.offsetWidth / 2
}

onMounted(() => {
  window.addEventListener('resize', calculateBoardSize)
  calculateBoardSize()
})
</script>
