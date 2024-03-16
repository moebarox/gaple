import { getCardPosition } from '~/utils/getCardPosition'

describe(getCardPosition, () => {
  it.each([
    [0, 1, 1],
    [1, 1, 2],
    [2, 1, 3],
    [3, 1, 4],
    [4, 2, 4],
    [5, 2, 3],
    [6, 2, 2],
    [7, 2, 1],
    [8, 2, 0],
    [9, 3, 0],
    [10, 3, 1],
    [11, 3, 2],
    [12, 3, 3],
    [13, 3, 4],
    [14, 4, 4],
    [15, 4, 3],
    [16, 4, 2],
    [17, 4, 1],
    [18, 4, 0],
    [19, 5, 0],
    [20, 5, 1],
  ])('expected position for card with index %s is row: %s col: %s', (idx, row, col) => {
    expect(getCardPosition(idx, 11, 5)).toEqual({ row, col })
  })
})
