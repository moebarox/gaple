<template>
  <div
    class="p-2 text-center"
    :class="{
      'absolute left-0 h-full': isPositionLeft,
      'absolute top-0': isPositionTop,
      'absolute right-0 h-full': isPositionRight,
      'relative': isPositionBottom,
    }"
  >
    <div
      class="flex items-center justify-center h-full"
      :class="{
        'flex-col': isPositionLeft || isPositionRight,
      }"
    >
      <div
        class="relative flex gap-2"
        :class="{
          'items-end': isPositionRight,
          'items-center': isPositionTop || isPositionBottom,
          'flex-col': isPositionLeft || isPositionRight,
        }"
      >
        <div
          class="relative w-12 h-12 rounded-full shadow-lg"
          :class="{
            'outline outline-4 outline-yellow-400 outline-offset-2': isHighlighted,
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
        </div>

        <div
          class="flex flex-col gap-1"
          :class="{
            'items-start text-left': isPositionTop || isPositionLeft || isPositionBottom,
            'items-end text-right': isPositionRight,
          }"
        >
          <div class="text-ellipsis overflow-hidden font-bold max-w-20">{{ player.name }}</div>
          <div
            class="flex gap-1"
            :class="{
              'flex-col': isPositionLeft || isPositionRight,
              'items-start': isPositionLeft,
              'items-end': isPositionRight,
              'items-center': isPositionTop || isPositionBottom,
            }"
          >
            <UBadge color="black" :ui="{ rounded: 'rounded-full' }">
              <div class="flex items-center gap-1">
                <UIcon dynamic name="i-mdi:cards" />
                <span>{{ player.cards.length }}</span>
              </div>
            </UBadge>
            <div class="relative">
              <UBadge color="black" :ui="{ rounded: 'rounded-full' }">
                <span class="font-bold mr-1">RT</span>
                <span>{{ player.penalty }}</span>
              </UBadge>

              <Transition name="raise" @after-enter="clearPenaltyPoint">
                <UBadge
                  v-if="penaltyPoint"
                  color="black"
                  :ui="{ rounded: 'rounded-full' }"
                  class="absolute top-0 right-0 opacity-100"
                >
                  {{ penaltyPoint }}
                </UBadge>
              </Transition>
            </div>
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
          <AssetsDomino v-for="card in player.cards" :key="card" :card="card" :width="35" class="shadow-lg" />
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
}

const clearPenaltyPoint = () => {
  penaltyPoint.value = ''
}
</script>

<style scoped lang="scss">
.raise-leave-active {
  @apply transition-all duration-1000;
}

.raise-leave-to {
  @apply opacity-0 -translate-y-4;
}
</style>
