export const getPossibleCards = (cards: string[], head: string, tail: string) => {
  return cards.filter(c => c.includes(head) || c.includes(tail))
}
