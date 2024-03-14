<template>
  <div class="p-2 text-center md:p-4" :class="`player-info-${PLAYER_INFO_POSITION[position]}`">
    <div
      class="flex items-center justify-center h-full"
      :class="{
        'flex-col': isPositionLeft || isPositionRight,
        'md:justify-start': isPositionBottom,
      }"
    >
      <div
        class="flex gap-2 md:flex-row md:gap-4"
        :class="{
          'md:flex-row-reverse': isPositionRight,
          'flex-col': isPositionLeft || isPositionRight,
          'items-center': isPositionTop || isPositionBottom,
        }"
      >
        <div
          class="relative w-12 h-12 md:w-20 md:h-20"
          :class="{
            'before:w-full before:h-full before:absolute before:top-0 before:left-0 before:rounded-full before:z-[-1] before:animate-ping before:bg-gray-600':
              isHighlighted,
          }"
        >
          <UAvatar
            :ui="{ wrapper: '!w-full !h-full' }"
            img-class="!w-full !h-full"
            size="xl"
            :src="`https://avatar.iran.liara.run/public/boy?username=${player.id}`"
            :alt="player.name"
            :chip-text="isRt ? 'RT' : ''"
            :chip-color="isRt ? 'primary' : null"
          />
          <div
            v-if="showCards"
            class="absolute top-2/3 hidden md:flex stacked-card"
            :class="{
              'right-0': isPositionRight,
              'left-0': isPositionTop || isPositionLeft || isPositionBottom,
            }"
          >
            <div
              v-for="card in player.cards"
              :key="card"
              class="relative w-[25px] h-[50px] rounded-md bg-gradient-to-br from-[#fd797f] to-[#ec585f] border-2 border-[#fe9297]"
            ></div>
          </div>
        </div>

        <div
          class="flex flex-col gap-1 md:gap-2"
          :class="{
            'items-start text-left': isPositionTop || isPositionLeft || isPositionBottom,
            'items-end text-right': isPositionRight,
          }"
        >
          <div class="text-lg font-bold">{{ player.name }}</div>
          <UBadge color="black" :ui="{ rounded: 'rounded-full' }">
            {{ player.penalty }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PLAYER_INFO_POSITION } from '#imports'

const props = defineProps<{
  player: TMatchPlayer
  position: PLAYER_INFO_POSITION
  isHighlighted: boolean
  isRt: boolean
  showCards?: boolean
}>()

const isPositionLeft = computed(() => props.position === PLAYER_INFO_POSITION.left)
const isPositionTop = computed(() => props.position === PLAYER_INFO_POSITION.top)
const isPositionRight = computed(() => props.position === PLAYER_INFO_POSITION.right)
const isPositionBottom = computed(() => props.position === PLAYER_INFO_POSITION.bottom)
</script>

<style scoped lang="scss">
.player-info-left {
  @apply absolute left-0 h-full;
}

.player-info-top {
  @apply absolute top-0;
}

.player-info-right {
  @apply absolute right-0 h-full;
}

.player-info-bottom {
  @apply relative;
}

.stacked-card {
  div:not(:first-child) {
    @apply ml-[-12px];
  }
}
</style>
