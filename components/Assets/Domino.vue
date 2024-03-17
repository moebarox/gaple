<template>
  <div
    class="bg-[url('/images/dominoes.png')] shrink-0 transition-all"
    :class="{
      'cursor-pointer': isSelectable,
      'cursor-not-allowed opacity-50': isDisabled,
    }"
    :style="dominoStyle"
    @click="handleClick"
  ></div>
</template>

<script setup lang="ts">
import {
  DEFAULT_CARD_WIDTH,
  DEFAULT_CARD_HEIGHT,
  HORIZONTAL_SPRITE_COUNT,
  VERTICAL_SPRITE_COUNT,
  DOMINO_SPRITE_MAPPING,
} from '#imports'

const props = withDefaults(
  defineProps<{
    card: string
    width?: number
    isDisabled?: boolean
    isSelectable?: boolean
  }>(),
  {
    width: DEFAULT_CARD_WIDTH,
    isDisabled: false,
    isSelectable: false,
  }
)

const emits = defineEmits<{
  (e: 'select', card: string): void
}>()

const dominoStyle = computed(() => {
  const sprite = DOMINO_SPRITE_MAPPING[props.card]
  const scaledWidth = DEFAULT_CARD_WIDTH * (props.width / DEFAULT_CARD_WIDTH)
  const scaledHeight = DEFAULT_CARD_HEIGHT * ((props.width * 2) / DEFAULT_CARD_HEIGHT)

  return {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    backgroundSize: `${HORIZONTAL_SPRITE_COUNT * scaledWidth}px ${VERTICAL_SPRITE_COUNT * scaledHeight}px`,
    backgroundPosition: `${sprite[0] * scaledWidth}px ${sprite[1] * scaledHeight}px`,
  }
})

const handleClick = () => {
  if (props.isDisabled || !props.isSelectable) {
    return
  }

  emits('select', props.card)
}
</script>
