const FORBIDDEN_FIRST_TURN_CARDS = ['0|0', '6|6']
const DEFAULT_MATCH = {
  settings: {
    password: '',
    roomMaster: '',
  },
  players: [],
  state: {
    board: [],
    round: 0,
    turn: '',
    lastTurn: '',
    lastRoundCard: '',
  },
}

const db = firebase.firestore()
let unsubWaitForPlayer
let unsubPlayMatch

const createMatch = () => {
  const user = getUser()
  const password = prompt('Enter password:')

  db.collection('matches')
    .add({
      ...DEFAULT_MATCH,
      players: [
        {
          id: user.id,
          name: user.name,
          cards: [],
          penalty: 0,
        },
      ],
      settings: {
        ...DEFAULT_MATCH.settings,
        password: password.trim(),
        roomMaster: user.id,
      },
    })
    .then(doc => {
      console.log('Match created with ID:', doc.id)
      history.replaceState({ id: doc.id }, '', `?id=${doc.id}`)
      waitForPlayer(doc.id)
    })
}

const waitForPlayer = id => {
  if (!id) {
    return
  }

  console.log('Waiting for players...')

  unsubWaitForPlayer = db
    .collection('matches')
    .doc(id)
    .onSnapshot(doc => {
      const match = doc.data()
      console.log('PLAYERS:', match.players)

      if (match.players.length >= 4) {
        console.log('Enough players!')
      }

      if (match.state.round !== 0) {
        playMatch(id)
      }
    })
}

const startMatch = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')

  if (!id) {
    return
  }

  db.collection('matches')
    .doc(id)
    .get()
    .then(doc => {
      const match = doc.data()
      const user = getUser()
      if (match.settings.roomMaster !== user.id) {
        console.log('Not roomMaster!')
        return
      }

      if (match.state.round !== 0) {
        console.log('Already started!')
        return
      }

      if (unsubWaitForPlayer) {
        unsubWaitForPlayer()
      }

      const shuffledCards = shuffleCards()
      match.players.forEach(player => {
        player.cards = shuffledCards.splice(0, 7)
      })

      db.collection('matches')
        .doc(id)
        .update({
          players: match.players,
          'state.round': 1,
          'state.turn': user.id,
        })
        .then(() => {
          playMatch(id)
        })
    })
}

const nextRound = (id, match) => {
  const shuffledCards = shuffleCards()
  match.players.forEach(player => {
    player.cards = shuffledCards.splice(0, 7)
  })

  let head = match.board[0].charAt(0)
  let tail = match.board[match.board.length - 1].charAt(2)

  if (head === 0 && tail === 0) {
    head = 1
    tail = 1
  } else if (head === 6 && tail === 6) {
    head = 5
    tail = 5
  }

  const lastRoundCard = [head, tail].sort().join('|')
  const firstTurnIdx = match.players.findIndex(
    p => p.cards.includes(`${head}|${tail}`) || p.cards.includes(`${tail}|${head}`)
  )

  // TODO: handle game over scoring

  db.collection('matches')
    .doc(id)
    .update({
      players: match.players,
      'state.board': [],
      'state.round': match.state.round + 1,
      'state.turn': match.players[firstTurnIdx].id,
      'state.lastTurn': '',
      'state.lastRoundCard': lastRoundCard,
    })
    .then(() => {
      console.log('New round!', lastRoundCard)
    })
}

const joinMatch = id => {
  if (!id) {
    return
  }

  db.collection('matches')
    .doc(id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such match!')
        return
      }

      const match = doc.data()

      if (match.settings.password) {
        const password = prompt('Enter password:')
        if (password !== match.settings.password) {
          console.log('Wrong password!')
          return
        }
      }

      console.log('Found match!')

      const user = getUser()

      if (match.players.length >= 4 && !match.players.some(p => p.id === user.id)) {
        console.log('Match is full!')
        return
      }

      if (!match.players.some(p => p.id === user.id)) {
        db.collection('matches')
          .doc(id)
          .update({
            players: firebase.firestore.FieldValue.arrayUnion({
              id: user.id,
              name: user.name,
              cards: [],
              penalty: 0,
            }),
          })
      }

      waitForPlayer(id)
    })
}

const playMatch = id => {
  console.log('Match started!')

  if (unsubWaitForPlayer) {
    unsubWaitForPlayer()
  }

  unsubPlayMatch = db.collection('matches').doc(id).onSnapshot(handleTurn)
}

const handleTurn = doc => {
  const id = doc.id
  const match = doc.data()
  const user = getUser()
  const board = match.state.board

  console.log('BOARD:', board)

  if (match.state.turn !== user.id) {
    return
  }

  console.log('Your turn, pick a card!')

  const playerData = match.players.find(p => p.id === user.id)
  let possibleCards = playerData.cards
  let head = ''
  let tail = ''

  if (board.length === 0) {
    if (match.state.lastRoundCard) {
      console.log('Matching last round card...', match.state.lastRoundCard)
      possibleCards = [match.state.lastRoundCard]
    } else {
      console.log('First turn...')
      possibleCards = possibleCards.filter(c => !FORBIDDEN_FIRST_TURN_CARDS.includes(c))
    }
  } else {
    head = board[0].charAt(0)
    tail = board[board.length - 1].charAt(2)
    possibleCards = findPossibleCard(playerData.cards, head, tail)
  }

  console.log('YOUR CARDS:', playerData.cards)
  console.log('POSSIBLE CARDS:', possibleCards)

  if (possibleCards.length === 0) {
    console.log('No cards available!')
    skipTurn(id, match, playerData)
    return
  }

  const cardOptions = possibleCards.map((c, idx) => `[${idx}] ${c}`).join('\n')
  const selectedCardIdx = prompt(`Pick a card from your hand:\n${cardOptions}`)
  let card = possibleCards[selectedCardIdx]
  const idx = playerData.cards.indexOf(card)

  const canPlaceOnHead = card.includes(head)
  const canPlaceOnTail = card.includes(tail)
  let selectedPosition = ''
  if (board.length !== 0 && canPlaceOnHead && canPlaceOnTail && head !== tail) {
    console.log('Card can be placed on both head and tail!')
    selectedPosition = prompt('[1] head\n[2] tail')
  }

  if (canPlaceOnHead || selectedPosition === '1') {
    if (card.charAt(0) === head) {
      card = card.split('').reverse().join('')
    }
    board.unshift(card)
  } else if (canPlaceOnTail || selectedPosition === '2') {
    if (card.charAt(2) === tail) {
      card = card.split('').reverse().join('')
    }
    board.push(card)
  }

  playerData.cards.splice(idx, 1)
  const players = match.players.map(p => {
    if (p.id === user.id) {
      return playerData
    } else {
      return p
    }
  })

  const userIdx = match.players.findIndex(p => p.id === user.id)
  const nextPlayer = match.players[(userIdx + 1) % 4]

  if (playerData.cards.length === 0) {
    console.log('You win!')

    // TODO: handle game over scoring

    db.collection('matches')
      .doc(id)
      .update({
        'state.round': match.state.round + 1,
        'state.turn': user.id,
      })
    return
  }

  console.log('NEXT PLAYER:', nextPlayer.name)

  db.collection('matches').doc(id).update({
    players,
    'state.board': board,
    'state.turn': nextPlayer.id,
    'state.lastTurn': user.id,
  })
}

const skipTurn = (id, match, player) => {
  const userIdx = match.players.findIndex(p => p.id === player.id)
  const nextPlayer = match.players[(userIdx + 1) % 4]

  if (checkGameOver(match)) {
    console.log('Game over!')
    nextRound(id, match)
    return
  }

  const lastTurnPlayer = match.players.find(p => p.id === match.state.lastTurn)
  const players = match.players.map(p => {
    if (p.id === lastTurnPlayer.id) {
      return {
        ...p,
        penalty: Math.max(p.penalty - 1, 0),
      }
    } else if (p.id === player.id) {
      return {
        ...p,
        penalty: p.penalty + 1,
      }
    } else {
      return p
    }
  })

  db.collection('matches').doc(id).update({
    players,
    'state.turn': nextPlayer.id,
  })
}

const shuffleCards = () => {
  const cards = [
    '0|0',
    '0|1',
    '0|2',
    '0|3',
    '0|4',
    '0|5',
    '0|6',
    '1|1',
    '1|2',
    '1|3',
    '1|4',
    '1|5',
    '1|6',
    '2|2',
    '2|3',
    '2|4',
    '2|5',
    '2|6',
    '3|3',
    '3|4',
    '3|5',
    '3|6',
    '4|4',
    '4|5',
    '4|6',
    '5|5',
    '5|6',
    '6|6',
  ]

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = cards[i]
    cards[i] = cards[j]
    cards[j] = temp
  }

  return cards
}

const findPossibleCard = (cards, head, tail) => {
  return cards.filter(c => c.includes(head) || c.includes(tail))
}

const checkGameOver = match => {
  const board = match.state.board
  const head = board[0].charAt(0)
  const tail = board[board.length - 1].charAt(2)
  return match.players.every(p => findPossibleCard(p.cards, head, tail).length === 0)
}

const getLosers = (match, penalty) => {
  let highestValue = 0
  const players = match.players.reduce((acc, p) => {
    const cards = p.cards
    const cardValues = cards.reduce((acc, c) => {
      const [h, t] = c.split('|')
      return acc + parseInt(h) + parseInt(t)
    }, 0)
    highestValue = Math.max(highestValue, cardValues)

    return [...acc, { id: p.id, name: p.name, count: cards.length, value: cardValues }]
  }, [])

  let loserCandidates = players.filter(p => p.value === highestValue)
  const maxCount = Math.max(...loserCandidates.map(p => p.count))
  loserCandidates = loserCandidates.filter(p => p.count === maxCount)

  const losers = loserCandidates.map(p => {
    return {
      id: p.id,
      name: p.name,
      penalty,
    }
  })

  // CHECKPOINT

  // TODO: handle last round card 0|0 or 6|6

  // TODO: handle no pair of 0|0 or 6|6

  return losers
}

const getUser = () => {
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

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')

  if (!id) {
    return
  }

  joinMatch(id)
}

window.onunload = () => {
  if (unsubWaitForPlayer) {
    unsubWaitForPlayer()
  }
  if (unsubPlayMatch) {
    unsubPlayMatch()
  }
}
