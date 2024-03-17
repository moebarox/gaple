<template>
  <UModal :prevent-close="preventClose">
    <div class="flex flex-col gap-6 p-6">
      <div class="text-center">{{ text }}</div>
      <div class="flex justify-center gap-4">
        <UButton color="primary" variant="solid" class="px-8" @click="confirm">{{ confirmText }}</UButton>
        <UButton color="red" variant="solid" class="px-8" @click="cancel">{{ cancelText }}</UButton>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const modal = useModal()

const props = withDefaults(
  defineProps<{
    text: string
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    preventClose?: boolean
  }>(),
  {
    confirmText: 'Yes',
    cancelText: 'No',
  }
)

const confirm = () => {
  props.onConfirm()
  modal.close()
}

const cancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }

  modal.close()
}
</script>
