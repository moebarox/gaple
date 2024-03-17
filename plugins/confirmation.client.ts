import { AssetsModalConfirmation } from '#components'

export default defineNuxtPlugin(() => {
  const modal = useModal()

  const confirmation = {
    open: (data: any) => {
      modal.open(AssetsModalConfirmation, data)
    },
  }

  return {
    provide: {
      confirmation,
    },
  }
})
