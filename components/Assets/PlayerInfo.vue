<template>
  <div class="absolute p-4 text-center" :class="`player-info-${PLAYER_INFO_POSITION[position]}`">
    <div
      class="flex items-center justify-center h-full"
      :class="{
        'flex-col': isPositionLeft || isPositionRight,
      }"
    >
      <div
        class="flex gap-4"
        :class="{
          'flex-row-reverse': isPositionRight,
        }"
      >
        <div
          class="relative w-20 h-20"
          :class="{
            'before:w-full before:h-full before:absolute before:top-0 before:left-0 before:rounded-full before:z-[-1] before:animate-ping before:bg-gray-600':
              isHighlighted,
          }"
        >
          <NuxtImg
            placeholder
            :src="`https://avatar.iran.liara.run/public/boy?username=${player.id}`"
            :alt="player.name"
            loading="lazy"
          />
          <div
            class="absolute top-2/3 flex stacked-card"
            :class="{
              'right-0': isPositionRight,
              'left-0': isPositionTop || isPositionLeft,
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
          class="flex flex-col gap-2"
          :class="{
            'items-start text-left': isPositionTop || isPositionLeft,
            'items-end text-right': isPositionRight,
          }"
        >
          <div class="text-lg font-bold">{{ player.name }}</div>
          <InterfaceCapsule class="text-sm">{{ player.penalty }}</InterfaceCapsule>
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
}>()

const isPositionLeft = computed(() => props.position === PLAYER_INFO_POSITION.left)
const isPositionTop = computed(() => props.position === PLAYER_INFO_POSITION.top)
const isPositionRight = computed(() => props.position === PLAYER_INFO_POSITION.right)
</script>

<style scoped lang="scss">
.player-info-left {
  @apply left-0 h-full;
}

.player-info-top {
  @apply top-0;
}

.player-info-right {
  @apply right-0 h-full;
}

.stacked-card {
  div:not(:first-child) {
    @apply ml-[-12px];
  }
}
</style>
