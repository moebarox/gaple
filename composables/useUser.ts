/**
 * Retrieves the user data from localStorage. If the user data is not found, generates a random user ID and name,
 * stores it in localStorage, and returns the generated user data.
 *
 * @return {TUser} The user data retrieved from localStorage or the generated user data.
 */
const getUser = (): TUser => {
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

export const useUser = () => {
  const user = useState<TUser>('user', () => getUser())

  /**
   * Sets the user's name in local storage.
   *
   * @param {string} name - the name of the user
   * @return {void}
   */
  const setName = (name: string) => {
    localStorage.setItem('user', JSON.stringify({ ...user.value, name }))
    user.value.name = name
  }

  return {
    user,
    getUser,
    setName,
  }
}
