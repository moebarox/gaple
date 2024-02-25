<template>
  <div
    class="absolute top-28 left-36 right-36 bottom-28 bg-[#354566] rounded-full border-[36px] border-[#3d5172] drop-shadow-2xl shadow-inner before:absolute before:top-4 before:left-4 before:right-4 before:bottom-4 before:rounded-full before:border-2 before:border-[#3d5172] before:z-[-1]"
  >
    <div ref="innerBoard" class="absolute w-5/6 h-5/6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <template v-for="(cards, rowIdx) in chunkedCards" :key="rowIdx">
        <template v-for="(card, cardIdx) in cards" :key="card">
          <div
            v-if="Object.values(BOARD_POSITION).includes(card)"
            class="absolute rounded-md bg-[#2e3d58] border-[1px] border-dashed border-[#3d5172] cursor-pointer w-[35px] h-[70px] z-10 before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:rounded-md before:animate-ping before:bg-[#2e3d58] before:pointer-events-none"
            :style="generateCardStyle(rowIdx, cardIdx)"
            @click="handleSelect(card)"
          ></div>
          <AssetsDomino v-else :card="card" size="small" class="absolute" :style="generateCardStyle(rowIdx, cardIdx)" />
        </template>
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
  const chunkedCards = [firstArray, ...remainingArray].filter(arr => arr.length > 0)

  if (props.isSelectable) {
    if (chunkedCards[0].length >= cardPerRow.value) {
      chunkedCards.unshift([BOARD_POSITION.head])
    } else {
      chunkedCards[0].unshift(BOARD_POSITION.head)
    }

    if (chunkedCards[chunkedCards.length - 1].length >= cardPerRow.value) {
      chunkedCards.push([BOARD_POSITION.tail])
    } else {
      chunkedCards[chunkedCards.length - 1].push(BOARD_POSITION.tail)
    }
  }

  return chunkedCards
})

const generateCardStyle = (rowIdx: number, columnIdx: number) => {
  const style: Record<string, string> = {}
  const card = chunkedCards.value[rowIdx][columnIdx]
  const isFirstRow = rowIdx === 0
  const hasMultipleRow = chunkedCards.value.length > 1
  const isDirectionRightToLeft = hasMultipleRow && rowIdx % 2 === 0
  const isReversed = typeof card === 'string' && isCardReversed(card)

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

const handleSelect = position => {
  if (!props.isSelectable) return

  emits('select', position as BOARD_POSITION)
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
