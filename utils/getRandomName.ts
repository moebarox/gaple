export const getRandomName = () => {
  return DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)]
}
