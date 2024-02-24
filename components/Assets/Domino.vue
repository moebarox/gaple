<template>
  <div
    class="domino"
    :class="{
      [dominoClass]: true,
      'domino-small': size === 'small',
      'cursor-pointer': isSelectable,
      'cursor-not-allowed opacity-50': isDisabled,
    }"
    @click="handleClick"
  ></div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    card: string
    size?: 'normal' | 'small'
    isDisabled?: boolean
    isSelectable?: boolean
  }>(),
  {
    size: 'normal',
    isDisabled: false,
    isSelectable: false,
  }
)

const emits = defineEmits<{
  (e: 'select', card: string): void
}>()

const dominoClass = computed(() => {
  const card = props.card.split('|').sort().join('_')
  return `domino-${card}`
})

const handleClick = () => {
  if (props.isDisabled || !props.isSelectable) {
    return
  }

  emits('select', props.card)
}
</script>

<style scoped lang="scss">
$width: 70px;
$height: 140px;

@mixin domino-size($size) {
  $scaled-width: $width * $size;
  $scaled-height: $height * $size;

  background-size: #{7 * $scaled-width} #{4 * $scaled-height};
  width: $scaled-width;
  height: $scaled-height;

  $positions: (
    0_0: 0 0,
    0_1: #{-$scaled-width} 0,
    0_2: #{-2 * $scaled-width} 0,
    0_3: #{-3 * $scaled-width} 0,
    0_4: #{-4 * $scaled-width} 0,
    0_5: #{-5 * $scaled-width} 0,
    0_6: #{-6 * $scaled-width} 0,
    1_1: 0 #{-$scaled-height},
    1_2: #{-$scaled-width} #{-$scaled-height},
    1_3: #{-2 * $scaled-width} #{-$scaled-height},
    1_4: #{-3 * $scaled-width} #{-$scaled-height},
    1_5: #{-4 * $scaled-width} #{-$scaled-height},
    1_6: #{-5 * $scaled-width} #{-$scaled-height},
    6_6: #{-6 * $scaled-width} #{-$scaled-height},
    2_2: 0 #{-2 * $scaled-height},
    2_3: #{-$scaled-width} #{-2 * $scaled-height},
    2_4: #{-2 * $scaled-width} #{-2 * $scaled-height},
    2_5: #{-3 * $scaled-width} #{-2 * $scaled-height},
    2_6: #{-4 * $scaled-width} #{-2 * $scaled-height},
    5_5: #{-5 * $scaled-width} #{-2 * $scaled-height},
    5_6: #{-6 * $scaled-width} #{-2 * $scaled-height},
    3_3: 0 #{-3 * $scaled-height},
    3_4: #{-$scaled-width} #{-3 * $scaled-height},
    3_5: #{-2 * $scaled-width} #{-3 * $scaled-height},
    3_6: #{-3 * $scaled-width} #{-3 * $scaled-height},
    4_4: #{-4 * $scaled-width} #{-3 * $scaled-height},
    4_5: #{-5 * $scaled-width} #{-3 * $scaled-height},
    4_6: #{-6 * $scaled-width} #{-3 * $scaled-height},
  );

  @each $name, $position in $positions {
    &.domino-#{$name} {
      background-position: $position;
    }
  }
}

.domino {
  @apply bg-[url('/images/dominoes.png')] shrink-0 transition-all;
  @include domino-size(1);

  &-small {
    @include domino-size(0.5);
  }
}
</style>
