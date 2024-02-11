export default function () {
  const user = localStorage.getItem('user')

  if (user) {
    return JSON.parse(user)
  } else {
    const name = prompt('Enter your name:')
    const id = Math.random().toString(36).substring(2, 8)
    localStorage.setItem('user', JSON.stringify({ id, name }))

    return { id, name }
  }
}
