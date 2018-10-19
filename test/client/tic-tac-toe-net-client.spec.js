require('../../public/lib');
const { MockSocket } = require('./mock/socket');
require('../../public/tic-tac-toe-net-client');

describe('TicTacToeNetClient', () => {

  /** @type TicTacToeNetClient */
  let client;
  let socket;
  let player;

  beforeEach(() => {
    socket = new MockSocket();
    player = {
      id: 123,
      name: 'Albert'
    }
  });

  it('should instantiate', () => {
    client = new TicTacToeNetClient( socket, player );
    expect(client).toBeTruthy();
  });

});
