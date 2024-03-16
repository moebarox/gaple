export const useMatch = () => {
  const match = useState<TMatch>('match', () => ({}) as TMatch)

  const board = computed(() => match.value?.state?.board ?? [])

  return {
    match,
    board,
  }
}
