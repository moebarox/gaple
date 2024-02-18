/**
 * Returns the possible cards that include the specified head or tail.
 *
 * @param {string[]} cards - array of cards
 * @param {string} head - head string to match
 * @param {string} tail - tail string to match
 * @return {string[]} filtered array of cards
 */
export const getPossibleCards = (cards: string[], head: string, tail: string): string[] => {
  return cards.filter(c => c.includes(head) || c.includes(tail))
}
