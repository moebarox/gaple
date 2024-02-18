/**
 * Find a player in the array of match players by their ID.
 *
 * @param {TMatchPlayer[]} players - The array of match players
 * @param {string} id - The ID of the player to find
 * @return {TMatchPlayer | undefined} The found player or undefined if not found
 */
export const findPlayer = (players: TMatchPlayer[], id: string): TMatchPlayer | undefined => {
  return players.find(p => p.id === id)
}
