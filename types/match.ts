export type TMatchSettings = {
  password: string
  roomMaster: string
}

export type TMatchPlayer = {
  id: string
  name: string
  cards: string[]
  penalty: number
}

export type TMatchState = {
  board: string[]
  round: number
  turn: string
  lastTurn: string
  firstTurnCard: string
}

export type TMatch = {
  settings: TMatchSettings
  players: TMatchPlayer[]
  state: TMatchState
  expireAt: number
}

export type TLastTurn = {
  playerId: string
  lastCard: string
}
