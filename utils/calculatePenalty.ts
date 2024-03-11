import { ULTIMATE_LAST_CARD, LAST_BALAK_POINT } from '#imports'

type TPlayerStatistic = TMatchPlayer & {
  count: number
  value: number
}

/**
 * Calculates penalty for the players based on their card values and certain game rules.
 *
 * @param {TMatch} match - the game match object
 * @param {number} penalty - penalty value to be added
 * @param {TLastTurn} [lastTurn] - the last turn details
 * @return {TMatchPlayer[]} - updated player objects after applying penalties
 */
export const calculatePenalty = (match: TMatch, penalty: number, lastTurn?: TLastTurn): TMatchPlayer[] => {
  let highestCardValue = 0
  let zeroCardExists = false
  let doubleZeroCardOwnerId = ''
  let sixCardExists = false
  let doubleSixCardOwnerId = ''

  const players: Record<string, TPlayerStatistic> = match.players.reduce((acc, p) => {
    const cards = p.cards
    const cardValues = cards.reduce((acc, c) => {
      if (c === '0|0') {
        doubleZeroCardOwnerId = p.id
      } else if (c.includes('0')) {
        zeroCardExists = true
      }

      if (c === '6|6') {
        doubleSixCardOwnerId = p.id
      } else if (c.includes('6')) {
        sixCardExists = true
      }

      const [h, t] = c.split('|')
      return acc + parseInt(h) + parseInt(t)
    }, 0)

    highestCardValue = Math.max(highestCardValue, cardValues)

    return {
      ...acc,
      [p.id]: {
        id: p.id,
        name: p.name,
        count: cards.length,
        value: cardValues,
        penalty: 0,
      },
    }
  }, {})

  let loserCandidates = Object.values(players).filter(p => p.value === highestCardValue)
  const highestCardCount = Math.max(...loserCandidates.map(p => p.count))
  loserCandidates = loserCandidates.filter(p => p.count === highestCardCount)

  // Give point to user(s) with the highest remaining card
  loserCandidates.forEach(lc => {
    players[lc.id].penalty += penalty
  })

  // Give point to user owning double zero card
  if (!zeroCardExists && doubleZeroCardOwnerId) {
    players[doubleZeroCardOwnerId].penalty = players[doubleZeroCardOwnerId].penalty + LAST_BALAK_POINT
  }

  // Give point to user owning double six card
  if (!sixCardExists && doubleSixCardOwnerId) {
    players[doubleSixCardOwnerId].penalty = players[doubleSixCardOwnerId].penalty + LAST_BALAK_POINT
  }

  // Give point to every player
  // if the last player finished the game
  // using double zero or double six card
  if (lastTurn && ULTIMATE_LAST_CARD.includes(lastTurn.lastCard)) {
    Object.values(players).forEach(p => {
      if (p.id !== lastTurn.playerId) {
        p.penalty = p.penalty + LAST_BALAK_POINT
      }
    })
  }

  return match.players.map(p => ({
    ...p,
    penalty: p.penalty + players[p.id].penalty,
  }))
}
