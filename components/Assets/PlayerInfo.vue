<template>
  <div
    class="p-2 text-center md:p-4"
    :class="{
      'absolute left-0 h-full': isPositionLeft,
      'absolute top-0': isPositionTop,
      'absolute right-0 h-full': isPositionRight,
      relative: isPositionBottom,
    }"
  >
    <div
      class="flex items-center justify-center h-full"
      :class="{
        'flex-col': isPositionLeft || isPositionRight,
        'md:justify-start': isPositionBottom,
      }"
    >
      <div
        class="relative flex gap-2 md:flex-row md:gap-4"
        :class="{
          'items-end md:items-start md:flex-row-reverse': isPositionRight,
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
            v-if="showCards && !isRevealCard"
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
          <div class="relative">
            <UBadge color="black" :ui="{ rounded: 'rounded-full' }">
              {{ player.penalty }}
            </UBadge>

            <Transition name="raise">
              <UBadge
                v-if="penaltyPoint"
                color="black"
                :ui="{ rounded: 'rounded-full' }"
                class="absolute top-0 left-0 opacity-0"
              >
                {{ penaltyPoint }}
              </UBadge>
            </Transition>
          </div>
        </div>

        <div
          v-if="isRevealCard"
          class="absolute -bottom-2 translate-y-full flex gap-1"
          :class="{
            'right-0': isPositionRight,
            'left-0': isPositionTop || isPositionLeft || isPositionBottom,
          }"
        >
          <AssetsDomino v-for="card in player.cards" :key="card" :card="card" size="small" />
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
  isHighlighted?: boolean
  isRt?: boolean
  isRevealCard?: boolean
  showCards?: boolean
}>()

const penaltyPoint = ref('')

const isPositionLeft = computed(() => props.position === PLAYER_INFO_POSITION.left)
const isPositionTop = computed(() => props.position === PLAYER_INFO_POSITION.top)
const isPositionRight = computed(() => props.position === PLAYER_INFO_POSITION.right)
const isPositionBottom = computed(() => props.position === PLAYER_INFO_POSITION.bottom)

watch(
  () => props.player.penalty,
  (newValue, oldValue) => {
    if (newValue === oldValue) {
      return
    }

    updatePenalty(newValue - oldValue)
  }
)

const updatePenalty = (diff: number) => {
  penaltyPoint.value = diff > 0 ? `+${diff}` : `${diff}`

  setTimeout(() => {
    penaltyPoint.value = ''
  }, 900)
}
</script>

<style scoped lang="scss">
.stacked-card {
  div:not(:first-child) {
    @apply ml-[-12px];
  }
}

.raise-enter-active {
  @apply transition-all duration-1000;
}

.raise-enter-from {
  @apply opacity-100;
}

.raise-enter-to {
  @apply opacity-0 -translate-y-4;
}
</style>
