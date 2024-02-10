
// Define a class for the game logic
class DominoGame {
  constructor(option) {
    // Initialize the game state
    this.io = option.io; // The socket.io instance
    this.players = []; // An array of player objects
    this.board = []; // An array of domino objects on the board
    this.boneyard = []; // An array of domino objects in the boneyard
    this.turn = 0; // The index of the current player
    this.winner = null; // The index of the winner, or null if the game is not over
    this.createDominoes(); // Create the 28 dominoes and shuffle them
    this.dealDominoes(); // Deal 7 dominoes to each player
  }

  // Create the 28 dominoes and shuffle them
  createDominoes() {
    // Loop through the possible values of the dominoes
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        // Create a new domino object with the values i and j
        let domino = {
          value1: i,
          value2: j,
          flipped: false // A flag to indicate if the domino is flipped or not
        };
        // Push the domino to the boneyard array
        this.boneyard.push(domino);
      }
    }
    // Shuffle the boneyard array using the Fisher-Yates algorithm
    for (let i = this.boneyard.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i
      let j = Math.floor(Math.random() * (i + 1));
      // Swap the elements at i and j
      let temp = this.boneyard[i];
      this.boneyard[i] = this.boneyard[j];
      this.boneyard[j] = temp;
    }
  }

  // Deal 7 dominoes to each player
  dealDominoes() {
    // Loop through the players array
    for (let player of this.players) {
      // Initialize an empty array for the player's hand
      player.hand = [];
      // Loop 7 times
      for (let i = 0; i < 7; i++) {
        // Pop a domino from the boneyard and push it to the player's hand
        player.hand.push(this.boneyard.pop());
      }
    }
  }

  // Add a new player to the game
  addPlayer(socket) {
    // Create a new player object with the socket id and a random name
    let player = {
      id: socket.id,
      name: 'Player' + Math.floor(Math.random() * 100),
      hand: [], // An array of dominoes in the player's hand
      score: 0 // The player's score
    };
    // Push the player to the players array
    this.players.push(player);
    // Return the player object
    return player;
  }

  // Remove a player from the game
  removePlayer(socket) {
    // Find the index of the player with the socket id
    let index = this.players.findIndex(player => player.id === socket.id);
    // If the index is valid, splice the player from the players array
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  // Check if the game is full
  isFull() {
    // Return true if the players array has 4 elements, false otherwise
    return this.players.length === 4;
  }

  // Check if the game is ready to start
  isReady() {
    // Return true if the players array has at least 2 elements, false otherwise
    return this.players.length >= 2;
  }

  // Start the game
  start() {
    // Set the turn to a random index from 0 to 3
    this.turn = Math.floor(Math.random() * 4);
    // Set the winner to null
    this.winner = null;
    // Emit a 'game-started' event to all the players with the game state
    this.io.to(this.id).emit('game-started', this.getState());
  }

  // End the game
  end() {
    // Set the winner to the index of the player with the highest score
    this.winner = this.players.reduce((maxIndex, player, index, array) => {
      return player.score > array[maxIndex].score ? index : maxIndex;
    }, 0);
    // Emit a 'game-ended' event to all the players with the game state
    this.io.to(this.id).emit('game-ended', this.getState());
  }

  // Get the game state
  getState() {
    // Return an object with the relevant information of the game state
    return {
      id: this.id, // The game id
      players: this.players.map(player => ({ // An array of player objects
        id: player.id, // The player id
        name: player.name, // The player name
        hand: player.hand.length, // The number of dominoes in the player's hand
        score: player.score // The player's score
      })),
      board: this.board, // An array of domino objects on the board
      boneyard: this.boneyard.length, // The number of dominoes in the boneyard
      turn: this.turn, // The index of the current player
      winner: this.winner // The index of the winner, or null if the game is not over
    };
  }

  // Move a domino from a player's hand to the board
  moveDomino(socket, dominoIndex, boardIndex) {
    // Find the player with the socket id
    let player = this.players.find(player => player.id === socket.id);
    // If the player is not found, return false
    if (!player) {
      return false;
    }
    // If the player is not the current player, return false
    if (this.players[this.turn] !== player) {
      return false;
    }
    // If the domino index is invalid, return false
    if (dominoIndex < 0 || dominoIndex >= player.hand.length) {
      return false;
    }
    // If the board index is invalid, return false
    if (boardIndex < 0 || boardIndex > this.board.length) {
      return false;
    }
    // Get the domino from the player's hand
    let domino = player.hand[dominoIndex];
    // If the board is empty, add the domino to the board
    if (this.board.length === 0) {
      this.board.push(domino);
    } else {
      // If the board is not empty, check if the domino can be placed at the board index
      // Get the left and right dominoes on the board
      let leftDomino = this.board[0];
      let rightDomino = this.board[this.board.length - 1];
      // If the board index is 0, check if the domino can be placed on the left
      if (boardIndex === 0) {
        // If the domino's value1 matches the left domino's value1, flip the domino and add it to the left
        if (domino.value1 === leftDomino.value1) {
          domino.flipped = true;
          this.board.unshift(domino);
        // If the domino's value2 matches the left domino's value1, add it to the left
        } else if (domino.value2 === leftDomino.value1) {
          this.board.unshift(domino);
        // Otherwise, return false
        } else {
          return false;
        }
      // If the board index is the board length, check if the domino can be placed on the right
      } else if (boardIndex === this.board.length) {
        // If the domino's value1 matches the right domino's value2, add it to the right
        if (domino.value1 === rightDomino.value2) {
          this.board.push(domino);
        // If the domino's value2 matches the right domino's value2, flip the domino and add it to the right
        } else if (domino.value2 === rightDomino.value2) {
          domino.flipped = true;
          this.board.push(domino);
        // Otherwise, return false
        } else {
          return false;
        }
      // Otherwise, return false
      } else {
        return false;
      }
    }
    // Remove the domino from the player's hand
    player.hand.splice(dominoIndex, 1);
    // Update the player's score by adding the domino's values
    player.score += domino.value1 + domino.value2;
    // Check if the player has won the game by emptying their hand
    if (player.hand.length === 0) {
      // End the game and return true
      this.end();
      return true;
    }
    // Check if the game is blocked by no possible moves
    if (this.isBlocked()) {
      // End the game and return true
      this.end();
      return true;
    }
    // Advance the turn to the next player
    this.nextTurn();
    // Emit a 'game-updated' event to all the players with the game state
    this.io.to(this.id).emit('game-updated', this.getState());
        // Return true
    return true;
  }

  // Draw a domino from the boneyard to a player's hand
  drawDomino(socket) {
    // Find the player with the socket id
    let player = this.players.find(player => player.id === socket.id);
    // If the player is not found, return false
    if (!player) {
      return false;
    }
    // If the player is not the current player, return false
    if (this.players[this.turn] !== player) {
      return false;
    }
    // If the boneyard is empty, return false
    if (this.boneyard.length === 0) {
      return false;
    }
    // Pop a domino from the boneyard and push it to the player's hand
    let domino = this.boneyard.pop();
    player.hand.push(domino);
    // Emit a 'game-updated' event to all the players with the game state
    this.io.to(this.id).emit('game-updated', this.getState());
    // Return true
    return true;
  }

  // Check if the game is blocked by no possible moves
  isBlocked() {
    // Loop through the players array
    for (let player of this.players) {
      // Loop through the player's hand
      for (let domino of player.hand) {
        // If the domino can be placed on either end of the board, return false
        if (this.canPlaceDomino(domino)) {
          return false;
        }
      }
    }
    // If none of the players can place a domino, return true
    return true;
  }

  // Check if a domino can be placed on either end of the board
  canPlaceDomino(domino) {
    // If the board is empty, return true
    if (this.board.length === 0) {
      return true;
    }
    // Get the left and right dominoes on the board
    let leftDomino = this.board[0];
    let rightDomino = this.board[this.board.length - 1];
    // If the domino's value1 or value2 matches the left domino's value1, return true
    if (domino.value1 === leftDomino.value1 || domino.value2 === leftDomino.value1) {
      return true;
    }
    // If the domino's value1 or value2 matches the right domino's value2, return true
    if (domino.value1 === rightDomino.value2 || domino.value2 === rightDomino.value2) {
      return true;
    }
    // Otherwise, return false
    return false;
  }

  // Advance the turn to the next player
  nextTurn() {
    // Increment the turn by 1
    this.turn++;
    // If the turn exceeds the number of players, wrap it around to 0
    if (this.turn >= this.players.length) {
      this.turn = 0;
    }
  }
}

// Export the DominoGame class
module.exports = DominoGame;
