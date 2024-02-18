import chunk from 'lodash/chunk'

/**
 * Shuffles the cards.
 * It prevents having more than 4 double cards in a row
 *
 * @return {array} A new array with the cards shuffled.
 */
export const shuffleCards = () => {
  const cards = [...DEFAULT_CARDS]
  const shuffledCards = cards.sort(() => 0.5 - Math.random())

  const isDoubleCardOverTreshold = chunk(shuffledCards, 7).some(batch => {
    const doubleCardCount = batch.filter(c => {
      const [head, tail] = c.split('|')
      return head === tail
    })

    return doubleCardCount.length > DOUBLE_CARD_TRESHOLD
  })

  return isDoubleCardOverTreshold ? shuffleCards() : shuffledCards
}
