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
