export type TPlayerId = string

export type TMatchSettings = {
  password: string
  roomMaster: TPlayerId
}

export type TMatchPlayer = {
  id: TPlayerId
  name: string
  cards: string[]
  penalty: number
}

export type TMatchState = {
  board: string[]
  round: number
  turn: TPlayerId
  lastTurn: TPlayerId
  firstTurnCard: string
  rt: TPlayerId
}

export type TMatch = {
  settings: TMatchSettings
  players: TMatchPlayer[]
  state: TMatchState
  expireAt: number
}

export type TLastTurn = {
  playerId: TPlayerId
  lastCard: string
}
