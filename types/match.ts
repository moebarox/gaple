export type TMatchSettings = {
  password: string
  roomMaster: string
}

export type TMatchPlayer = {
  id: string
  name: string
  cards: string[]
}

export type TMatchState = {
  board: string[]
  round: number
  turn: string
  lastTurn: string
  lastRoundCard: string
}

export type TMatch = {
  settings: TMatchSettings
  players: TMatchPlayer[]
  state: TMatchState
}
