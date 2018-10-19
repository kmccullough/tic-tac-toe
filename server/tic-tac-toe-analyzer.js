const { TicTacToeBoard } = require('./tic-tac-toe-board');

class TicTacToeAnalyzer {

  /**
   * @param {TicTacToeBoard} board
   * @returns {{isOver: boolean, isDraw: boolean, isFull: boolean, isInvalid: boolean, winningMarker: null|'x'|'o', winningVectors: {rows: *[]|boolean, columns: *[]|boolean, diagonals: *[]|boolean}, markerCounts: {x: number, o: number}}}
   */
  analyze(board) {
    const result = {
      isOver: false,
      isDraw: false,
      isFull: true,
      isInvalid: false,
      winningMarker: null,
      winningVectors: {
        rows: [{}, {}, {}],
        columns: [{}, {}, {}],
        diagonals: [{}, {}],
      },
      markerCounts: { x: 0, o: 0 },
    };
    const winVectors = result.winningVectors;
    const win = (marker) => {
      if (!result.isOver) {
        result.isOver = true;
        result.winningMarker = marker;
      } else if (result.winningMarker !== marker) {
        // Not possible to have two winners
        result.isInvalid = true;
        console.log('Not possible to have two winners');
      }
    };
    if (!(board instanceof TicTacToeBoard)) {
      throw Error('Expected TicTacToeBoard');
    }
    board.board.forEach((row, y) => {
      row.forEach((marker, x) => {
        if (!marker) {
          // No marker
          result.isFull = false;
        } else if (marker !== 'x' && marker !== 'o') {
          // Unrecognized marker
          result.isInvalid = true;
          console.log('Unrecognized marker:', marker);
        } else {
          // Player marker
          ++result.markerCounts[marker];
          // Row vectors
          const row = y;
          const rowVectors = winVectors.rows;
          const rowVector = rowVectors[row];
          if (!rowVector) {
            // Row win not possible
          } else if (!rowVector.marker) {
            // First marker in row
            rowVector.marker = marker;
            rowVector.count = 1;
          } else if (rowVector.marker === marker) {
            // Same marker in row
            if (++rowVector.count >= 3) {
              rowVectors[row] = true;
              win(marker);
            }
          } else {
            // Opposing marker in row
            rowVectors[row] = false;
          }
          // Column vectors
          const column = x;
          const columnVectors = winVectors.columns;
          const columnVector = columnVectors[column];
          if (!columnVector) {
            // Column win not possible
          } else if (!columnVector.marker) {
            // First marker in column
            columnVector.marker = marker;
            columnVector.count = 1;
          } else if (columnVector.marker === marker) {
            // Same marker in column
            if (++columnVector.count >= 3) {
              columnVectors[column] = true;
              win(marker);
            }
          } else {
            // Opposing marker in column
            columnVectors[column] = false;
          }
          // Diagonal vectors
          const isDiagonal = [
            x === y,
            2 - x === y
          ];
          if (isDiagonal[0] || isDiagonal[1]) {
            const diagonalVectors = winVectors.diagonals;
            diagonalVectors.forEach((diagonalVector, diagonal) => {
              if (!isDiagonal[diagonal] || !diagonalVector
                || diagonalVector === true
              ) {
                return;
              }
              if (!diagonalVector.marker) {
                // First marker in diagonal
                diagonalVector.marker = marker;
                diagonalVector.count = 1;
              } else if (diagonalVector.marker === marker) {
                // Same marker in diagonal
                if (++diagonalVector.count >= 3) {
                  diagonalVectors[diagonal] = true;
                  win(marker);
                }
              } else {
                // Opposing marker in diagonal
                diagonalVectors[diagonal] = false;
              }
            });
          }
        }
      });
    });
    // Simplify win vector report
    const winPossible = winPossible => winPossible;
    Object.keys(result.winningVectors).forEach(vector => {
      if (!result.winningVectors[vector].some(winPossible)) {
        result.winningVectors[vector] = false;
      }
    });
    // Verify turn count
    const countDiff = result.markerCounts.x - result.markerCounts.o;
    if (countDiff < 0 || countDiff > 1) {
      // Wrong number of turns
      result.isInvalid = true;
      console.log('Wrong number of turns');
    }
    // Check for draw game
    if (result.isFull && !result.isOver) {
      result.isOver = true;
      result.isDraw = true;
    }
    return result;
  }

}

module.exports = {
  TicTacToeAnalyzer,
};
