const Players = require('./players');
const TicTacToeBoard = require('./tic-tac-toe-board');

class PlayerMatch {

  constructor(
    players,
    board
  ) {
    this.turnMarker = 'x';
    /** @type Players */
    this.players = Players.wrap(players);
    this.markersByPlayerId = Array.from(this.players).reduce((obj, player, i) => {
      obj[player.id] = i < 0 ? null : i === 0 ? 'x' : 'o';
      return obj;
    }, {});
    this.board = new TicTacToeBoard(board);
  }

  getPlayerMarker(player) {
    return this.markersByPlayerId[player.id];
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

module.exports = PlayerMatch;
