/**
 * Retrieves the user data from localStorage. If the user data is not found, generates a random user ID and name,
 * stores it in localStorage, and returns the generated user data.
 *
 * @return {TUser} The user data retrieved from localStorage or the generated user data.
 */
export const getUser = (): TUser => {
  const user = localStorage.getItem('user')

  if (user) {
    return JSON.parse(user) as TUser
  } else {
    const id = Math.random().toString(36).substring(2, 8)
    const name = getRandomName()
    localStorage.setItem('user', JSON.stringify({ id, name }))

    return { id, name }
  }
}
