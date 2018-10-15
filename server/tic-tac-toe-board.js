class TicTacToeBoard {

  constructor(
    board,
  ) {
    this.board = board || [['','',''],['','',''],['','','']];
  }

  isEmptyAt(pos) {
    return !this.board[pos.y][pos.x];
  }

  setMarker(pos, marker) {
    this.board[pos.y][pos.x] = marker === 'x' ? 'x' : marker === 'o' ? 'o' : '';
  }
}

module.exports = TicTacToeBoard;
