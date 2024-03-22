import { MAX_PLAYERS, PENALTY_POINT_TRESHOLD } from '#imports'

export const useMatch = () => {
  const { user } = useUser()

  const match = useState<TMatch>('match', () => ({}) as TMatch)

  const settings = computed<TMatchSettings>(() => match.value?.settings ?? {})
  const players = computed<TMatchPlayer[]>(() => match.value?.players ?? [])
  const state = computed<TMatchState>(() => match.value?.state ?? {})
  const board = computed(() => state.value.board ?? [])
  const head = computed<string>(() => board.value[0]?.charAt(0) ?? '')
  const tail = computed<string>(() => board.value[board.value.length - 1]?.charAt(2) ?? '')

  const playerIdx = computed(() => players.value.findIndex(p => p.id === user.value.id))
  const currentPlayer = computed<TMatchPlayer>(() => getPlayer(user.value.id))
  const nextPlayer = computed<TMatchPlayer>(() => players.value[playerIdx.value + 1] ?? players.value[0])
  const rtPlayer = computed<TMatchPlayer>(
    () => players.value.filter(p => p.penalty >= PENALTY_POINT_TRESHOLD).sort((a, b) => b.penalty - a.penalty)[0]
  )

  const isRoomMaster = computed(() => match.value?.settings?.roomMaster === user.value.id)
  const isPlayerInMatch = computed(() => players.value.some(p => p.id === user.value.id))
  const isMatchFull = computed(() => players.value.length === MAX_PLAYERS)
  const isPlayerTurn = computed(() => state.value.turn === user.value.id)
  const isAnyPlayerWin = computed(() => players.value.some(p => p.cards?.length === 0))
  const isMatchDraw = computed(() =>
    players.value.every(p => getPossibleCards(p.cards, head.value, tail.value).length === 0)
  )
  const isMatchOver = computed(() => isAnyPlayerWin.value || isMatchDraw.value)

  const getPlayer = id => players.value.find(p => p.id === id) ?? ({} as TMatchPlayer)

  return {
    match,
    settings,
    players,
    state,
    board,
    head,
    tail,
    playerIdx,
    currentPlayer,
    nextPlayer,
    rtPlayer,
    isRoomMaster,
    isPlayerInMatch,
    isMatchFull,
    isPlayerTurn,
    isMatchOver,
    isMatchDraw,
    getPlayer,
  }
}
