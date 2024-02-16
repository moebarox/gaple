import { DEFAULT_CARDS } from '~/constants/card'

export const shuffleCards = () => {
  const cards = [...DEFAULT_CARDS]
  return cards.sort(() => 0.5 - Math.random())
}
