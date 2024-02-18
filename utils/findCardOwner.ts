/**
 * Find the owner of a specific card among the players.
 *
 * @param {TMatchPlayer[]} players - array of match players
 * @param {string} card - the card to find the owner of
 * @return {TMatchPlayer | undefined} the player who owns the card, or undefined if not found
 */
export const findCardOwner = (players: TMatchPlayer[], card: string): TMatchPlayer | undefined => {
  return players.find(p => p.cards.includes(card))
}
