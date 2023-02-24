const { Players } = require('./players');
const { TicTacToeBoard } = require('./tic-tac-toe-board');

let matchId = 0;

class PlayerMatch {

  id = ++matchId;

  constructor(
    players,
    board
  ) {
    this.turnMarker = 'x';
    /** @type Players */
    this.players = Players.wrap(players);
    this.board = board || new TicTacToeBoard();
  }

  getPlayerMarker(player) {
    return this.players.indexOf(player) ? 'o' : 'x';
  }

  getMarker() {
    return this.turnMarker;
  }

  isPlayerTurn(player) {
    return this.getPlayerMarker(player) === this.getMarker();
  }

  toggleMarker() {
    this.turnMarker = this.turnMarker === 'o' ? 'x' : 'o'
  }

  setResult(result) {
    this.result = result;
  }

}

module.exports = {
  PlayerMatch,
};
