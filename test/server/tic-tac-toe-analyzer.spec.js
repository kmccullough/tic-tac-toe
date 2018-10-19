const { TicTacToeBoard } = require('../../server/tic-tac-toe-board');
const { TicTacToeAnalyzer } = require('../../server/tic-tac-toe-analyzer');

describe('TicTacToeAnalyzer', () => {

  /** @type TicTacToeAnalyzer */
  let analyzer;

  beforeEach(() => {
    analyzer = new TicTacToeAnalyzer();
  });

  it('should raise error without board', () => {
    expect(() => analyzer.analyze()).toThrow();
  });

  it('should raise error given non-board type', () => {
    expect(() => analyzer.analyze({})).toThrow();
  });

  describe('should count markers', () => {
    [
      {
        board: [
          ['',  '',  '' ],
          ['',  '',  '' ],
          ['',  '',  '' ]
        ],
        counts: { x: 0, o: 0 }
      },
      {
        board: [
          ['x', 'x', 'x'],
          ['x', 'x', 'x'],
          ['x', 'x', 'x']
        ],
        counts: { x: 9, o: 0 }
      },
      {
        board: [
          ['o', 'o', 'o'],
          ['o', 'o', 'o'],
          ['o', 'o', 'o']
        ],
        counts: { x: 0, o: 9 }
      },
      {
        board: [
          ['x', 'o', '' ],
          ['',  'x', 'o'],
          ['o', '',  'x']
        ],
        counts: { x: 3, o: 3 }
      },
    ].forEach(({board, counts }) => {
      it('with board: ' + JSON.stringify(board), () => {
        board = new TicTacToeBoard(board);
        expect(
          analyzer.analyze(board)
        ).toEqual(jasmine.objectContaining({
          markerCounts: counts
        }))
      });
    });
  });

  describe('should identify board fullness', () => {
    [
      {
        board: [
          ['',  '',  '' ],
          ['',  '',  '' ],
          ['',  '',  '' ]
        ],
        isFull: false
      },
      {
        board: [
          ['',  'x', 'x'],
          ['x', 'x', 'x'],
          ['x', 'x', 'x']
        ],
        isFull: false
      },
      {
        board: [
          ['x', 'x', 'x'],
          ['x', '', 'x' ],
          ['x', 'x', 'x']
        ],
        isFull: false
      },
      {
        board: [
          ['x', 'x', 'x'],
          ['x', 'x', 'x'],
          ['x', 'x', '' ]
        ],
        isFull: false
      },
      {
        board: [
          ['x', 'x', 'x'],
          ['x', 'x', 'x'],
          ['x', 'x', 'x']
        ],
        isFull: true
      },
      {
        board: [
          ['o', 'o', 'o'],
          ['o', 'o', 'o'],
          ['o', 'o', 'o']
        ],
        isFull: true
      },
      {
        board: [
          ['x', 'o', ''],
          ['',  'x', 'o'],
          ['o', '',  'x']
        ],
        isFull: false
      },
    ].forEach(({board, isFull }) => {
      it('with board: ' + JSON.stringify(board), () => {
        board = new TicTacToeBoard(board);
        expect(
          analyzer.analyze(board)
        ).toEqual(jasmine.objectContaining({
          isFull
        }))
      });
    });
  });

  describe('should identify draw games', () => {
    [
      [
        ['o', 'x', 'o'],
        ['x', 'x', 'o'],
        ['o', 'o', 'x']
      ],
      [
        ['x', 'o', 'x'],
        ['o', 'o', 'x'],
        ['x', 'x', 'o']
      ],
    ].forEach((board) => {
      it('with board: ' + JSON.stringify(board), () => {
        board = new TicTacToeBoard(board);
        expect(
          analyzer.analyze(board)
        ).toEqual(jasmine.objectContaining({
          isOver: true,
          isDraw: true,
        }))
      });
    });
  });

  describe('should identify invalid boards', () => {
    [
      // Marker o has taken too many turns
      [
        ['o', '',  '' ],
        ['',  '',  '' ],
        ['',  '',  '' ]
      ],
      [
        ['o', 'x', 'o'],
        ['x', 'x', 'o'],
        ['o', 'o', 'x']
      ],
      // Marker x has taken too many turns
      [
        ['x', '',  '' ],
        ['',  '',  '' ],
        ['',  '',  'x']
      ],
      [
        ['x', 'x', 'x'],
        ['o', 'o', 'x'],
        ['x', 'x', 'o']
      ],
      // Unrecognized marker
      [
        ['',  '',  '' ],
        ['',  '%', '' ],
        ['',  '',  '' ]
      ],
      // Multiple winners
      [
        ['x', 'x', 'x'],
        ['o', 'o', 'o'],
        ['',  '',  '' ]
      ],
    ].forEach((board) => {
      it('with board: ' + JSON.stringify(board), () => {
        board = new TicTacToeBoard(board);
        expect(
          analyzer.analyze(board)
        ).toEqual(jasmine.objectContaining({
          isInvalid: true,
        }))
      });
    });
  });

  describe('should identify winning boards', () => {
    [
      {
        board: [
          ['o', 'o', 'o'],
          ['',  '' , '' ],
          ['',  '' , '' ],
        ],
        winner: 'o'
      },
      {
        board: [
          ['',  '' , '' ],
          ['x', 'x', 'x'],
          ['',  '' , '' ],
        ],
        winner: 'x'
      },
      {
        board: [
          ['',  '',  '' ],
          ['',  '',  '' ],
          ['o', 'o', 'o'],
        ],
        winner: 'o'
      },
      {
        board: [
          ['x', '',  '' ],
          ['x', '',  '' ],
          ['x', '',  '' ]
        ],
        winner: 'x'
      },
      {
        board: [
          ['',  'o', '' ],
          ['',  'o', '' ],
          ['',  'o', '' ]
        ],
        winner: 'o'
      },
      {
        board: [
          ['',  '',  'x'],
          ['',  '',  'x'],
          ['',  '',  'x']
        ],
        winner: 'x'
      },
      {
        board: [
          ['x', '',  ''],
          ['',  'x', ''],
          ['',  '',  'x']
        ],
        winner: 'x'
      },
      {
        board: [
          ['',  '',  'o'],
          ['',  'o', '' ],
          ['o', '',  '' ]
        ],
        winner: 'o'
      },
      // Identified as an error at some-point
      {
        board: [
          ['x', 'o', 'o'],
          ['',  'x', '' ],
          ['',  '',  'x']
        ],
        winner: 'x'
      },
    ].forEach(({ board, winner }) => {
      it('with board: ' + JSON.stringify(board), () => {
        board = new TicTacToeBoard(board);
        expect(
          analyzer.analyze(board)
        ).toEqual(jasmine.objectContaining({
          isOver: true,
          winningMarker: winner,
        }))
      });
    });
  });

});
