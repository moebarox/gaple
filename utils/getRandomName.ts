/**
 * Generates a random name from the DEFAULT_NAMES array.
 *
 * @return {string} The randomly selected name.
 */
export const getRandomName = () => {
  return DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)]
}
