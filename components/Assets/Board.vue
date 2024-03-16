<template>
  <div
    class="absolute top-16 left-16 right-16 bottom-16 md:top-28 md:left-36 md:right-36 md:bottom-28 bg-[#354566] rounded-full border-8 border-[#3d5172] drop-shadow-2xl shadow-inner before:absolute before:top-4 before:left-4 before:right-4 before:bottom-4 before:rounded-full before:border-2 before:border-[#3d5172] before:z-[-1]"
  >
    <div ref="innerBoard" class="absolute w-5/6 h-5/6 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <template v-for="card in board">
        <div
          v-if="Object.values(BOARD_POSITION).includes(BOARD_POSITION[card])"
          class="absolute rounded-md bg-[#2e3d58] border-[1px] border-dashed border-[#3d5172] cursor-pointer w-[35px] h-[70px] z-10 before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:rounded-md before:animate-ping before:bg-[#2e3d58] before:pointer-events-none"
          :style="generateCardStyle(card)"
          @click="handleSelect(card)"
        ></div>
        <AssetsDomino v-else :key="card" :card="card" size="small" class="absolute" :style="generateCardStyle(card)" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BOARD_POSITION } from '#imports'

const { board, totalRows, cardPerRow, getCardPosition } = useBoard()

const BOARD_CARD_LENGTH = 70

const props = defineProps<{
  isSelectable?: boolean
}>()

const emits = defineEmits<{
  (e: 'select', position: BOARD_POSITION): void
}>()

const innerBoard = ref<HTMLDivElement | null>(null)
const innerBoardWidth = ref(0)
const innerBoardHeight = ref(0)

const topPadding = computed(() => (innerBoardHeight.value - BOARD_CARD_LENGTH * totalRows.value) / 2)
const leftPadding = computed(() => (innerBoardWidth.value - BOARD_CARD_LENGTH * cardPerRow.value) / 2)

const generateCardStyle = (card: string) => {
  const style: Record<string, string> = {}
  const isReversed = isCardReversed(card)

  const { row, col, direction } = getCardPosition(card)

  let top = topPadding.value + row * BOARD_CARD_LENGTH
  let left = leftPadding.value + col * BOARD_CARD_LENGTH - BOARD_CARD_LENGTH / 2

  if (direction === CARD_DIRECTION.left) {
    if (col === 0) {
      top += BOARD_CARD_LENGTH / 4
    } else {
      left -= BOARD_CARD_LENGTH / 4
    }
  } else {
    if (col === cardPerRow.value - 1) {
      top += BOARD_CARD_LENGTH / 4
    } else {
      left += BOARD_CARD_LENGTH / 4
    }
  }

  style.top = `${top}px`
  style.left = `${left}px`

  switch (true) {
    case direction === CARD_DIRECTION.right && isReversed && col === cardPerRow.value - 1:
    case direction === CARD_DIRECTION.left && isReversed && col === 0:
      style.transform = 'rotate(180deg)'
      break
    case direction === CARD_DIRECTION.right && col === cardPerRow.value - 1:
    case direction === CARD_DIRECTION.left && col === 0:
      break
    case direction === CARD_DIRECTION.right && isReversed:
    case direction === CARD_DIRECTION.left && !isReversed:
      style.transform = 'rotate(90deg)'
      break
    case direction === CARD_DIRECTION.right && !isReversed:
    case direction === CARD_DIRECTION.left && isReversed:
      style.transform = 'rotate(-90deg)'
      break
  }

  return style
}

const isCardReversed = card => card.at(0) > card.at(2)

const handleSelect = position => {
  if (!props.isSelectable) return

  emits('select', BOARD_POSITION[position as keyof typeof BOARD_POSITION])
}

const calculateBoardSize = () => {
  if (!innerBoard.value) {
    return
  }

  cardPerRow.value = Math.floor(innerBoard.value.offsetWidth / BOARD_CARD_LENGTH)
  innerBoardWidth.value = innerBoard.value.offsetWidth
  innerBoardHeight.value = innerBoard.value.offsetHeight
}

onMounted(() => {
  window.addEventListener('resize', calculateBoardSize)
  calculateBoardSize()
})
</script>
