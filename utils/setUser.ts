/**
 * Sets the user's name in local storage.
 *
 * @param {string} name - the name of the user
 * @return {void}
 */
export const setUser = (name: string) => {
  const user = getUser()
  localStorage.setItem('user', JSON.stringify({ ...user, name }))
}
