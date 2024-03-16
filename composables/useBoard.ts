import { CARD_DIRECTION } from '#imports'

export const useBoard = () => {
  const { board } = useMatch()

  const firstCard = useState('firstCard', () => '')
  const cardPerRow = useState('cardPerRow', () => 0)

  /**
   * The actual index of the first placed card
   */
  const firstCardIdx = computed(() => board.value.indexOf(firstCard.value))

  /**
   * The relative index of card on the head based on the first card
   */
  const headRelativeIdx = computed(() => getRelativeIdx(0))

  /**
   * The relative index of card on the tail based on the first card
   */
  const tailRelativeIdx = computed(() => getRelativeIdx(board.value.length - 1))

  /**
   * The row of the first placed card
   */
  const firstCardRow = computed(() => getRow(0))

  /**
   * The first index that start the row (1st row)
   */
  const firstRowIdx = computed(() => Math.floor(headRelativeIdx.value / cardPerRow.value) * cardPerRow.value)

  /**
   * The total rows
   */
  const totalRows = computed(() => {
    return getRow(tailRelativeIdx.value) + 1
  })

  watch(
    () => board.value,
    () => {
      if (firstCard.value || board.value.length === 0) {
        return
      }

      firstCard.value = board.value[0]
    },
    { immediate: true }
  )

  const getRelativeIdx = (idx: number) => {
    return idx - firstCardIdx.value + Math.floor(cardPerRow.value / 2)
  }

  /**
   * Get the row of the card
   *
   * @param {number} relativeIdx - the relative index based on the first card
   * @return {number} zero index row
   */
  const getRow = (relativeIdx: number) => {
    return Math.floor((relativeIdx - firstRowIdx.value) / cardPerRow.value)
  }

  /**
   * Get the column of the card
   *
   * @param {number} relativeIdx - the relative index based on the first card
   * @param {number} row - the row of the card
   * @return {number} zero index column
   */
  const getColumn = (relativeIdx: number, row: number) => {
    const columnOrder = ((relativeIdx % cardPerRow.value) + cardPerRow.value) % cardPerRow.value

    if (row % 2 === firstCardRow.value % 2) {
      return columnOrder
    }

    return cardPerRow.value - columnOrder - 1
  }

  /**
   * Get the direction of the card
   *
   * @param {number} row - the row of the card
   * @return {CARD_DIRECTION} the direction of the card
   */
  const getDirection = row => {
    if (row % 2 === firstCardRow.value % 2) {
      return CARD_DIRECTION.right
    }

    return CARD_DIRECTION.left
  }

  const getCardPosition = (card: string) => {
    // The actual index of the card
    const cardIdx = board.value.indexOf(card)

    // The relative index of the card based on the first card
    const relativeIdx = getRelativeIdx(cardIdx)

    const row = getRow(relativeIdx)
    const col = getColumn(relativeIdx, row)
    const direction = getDirection(row)

    return {
      row,
      col,
      direction,
    }
  }

  return {
    board,
    totalRows,
    cardPerRow,
    getRow,
    getColumn,
    getDirection,
    getRelativeIdx,
    getCardPosition,
  }
}
