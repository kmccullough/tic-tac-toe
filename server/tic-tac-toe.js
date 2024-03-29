const { Players } = require('./players');
const { PlayerMatch } = require('./match');
const { PlayerMatches } = require('./matches');

class TicTacToe {

  constructor(
    analyzer,
    net,
    names,
    players,
    queue,
  ) {
    /** @type TicTacToeAnalyzer */
    this.analyzer = analyzer;
    /** @type TicTacToeNetServer */
    this.net = net;
    this.names = names;
    this.players = players || new Players();
    this.queue = queue || new Players();
    this.matches = new PlayerMatches();

    const emitPlayers = () => {
      const players = [ ...this.players ]
        .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
      this.net.broadcastPlayers(players);
    }

    this.players
      .on('add', () => {
        emitPlayers();
      })
      .on('remove', player => {
        this.names.remove(player.name);
        this.queue.remove(player);
        this.matches.getByPlayer(player)
          .forEach(match => this.matches.remove(match));
        emitPlayers();
      })
      .on('update', () => {
        emitPlayers();
      })
    ;

    this.queue
      .on('add', player => {
        console.log(`Player queueing: ${player.name} (${this.queue.length})`);
        // Try to match players whenever a new player added to the queue
        this.matchPlayers();
      })
      .on('remove', player => {
        console.log(`Player dequeueing: ${player.name} (${this.queue.length})`);
      })
    ;

    this.matches
      .on('add', match => {
        const players = [ ...match.players ];
        console.log(`Match started between ${players[0].name} and ${players[1].name}`);
        // Notify players of their starting match
        this.net.broadcastMatchStart(match);
      })
      .on('remove', match => {
        const players = [ ...match.players ];
        console.log(`Match ended between ${players[0].name} and ${players[1].name}`);
        // Notify players match is over
        this.net.broadcastMatchEnd(match);
      })
    ;

    this.net
      .on('connection', player => {
        player.name = this.names.add();
        console.log(`Player connected: ${player.name} (${this.players.length + 1})`);
        // Tell the player who they are
        this.net.emitPlayer(player);
        // Add the player to the collection
        this.players.add(player);
        this.net.emit(player, ...this.net.getMatchesData(this.matches.matches));
        this.net.emit(player, 'data', [
          this.net.getMatchesData(this.matches.matches),
        ]);
      })
      .on('name', (player, name) => {
        console.log(`Player ${player.name} changed name to ${name}`);
        this.names.remove(player.name);
        player.name = this.names.add(name, true);
        this.players.update(player);
        // Confirm the name change
        this.net.emitPlayer(player);
      })
      .on('queue', player => {
        // Add player to match queue
        this.queue.toggle(player);
      })
      .on('take-turn', (player, pos) => {
        /** @type PlayerMatch */
        const match = this.matches.getByPlayer(player)[0];
        if (!match) {
          this.net.error('take-turn', 'You are not in a match.');
        } else if (!match.isPlayerTurn(player)) {
          this.net.error('take-turn', 'It is not your turn.');
        } else if (!match.board.isEmptyAt(pos)) {
          this.net.error('take-turn', 'That position is not empty.')
        } else {
          // Make the move
          match.board.setMarker(pos, match.getMarker());
          // Change turn marker
          match.toggleMarker();
          // Analyze the resulting board
          const analysis = this.analyzer.analyze(match.board);
          if (analysis.isInvalid) {
            console.log('Invalid game state');
            // Something went wrong
            match.setResult({ error: 'Invalid game state' });
            this.matches.remove(match);
          } else if (analysis.isOver) {
            match.setResult({ winner: analysis.winningMarker });
            this.matches.remove(match);
          } else {
            // Still playing, broadcast state
            this.net.broadcastMatchState(match);
          }
        }
      })
      .on('disconnect', player => {
        console.log(`Player disconnected: ${player.name} (${this.players.length - 1})`);
        this.players.remove(player);
      })
    ;
  }

  matchPlayers() {
    const players = [ ...this.queue ];
    while (players.length >= 2) {
      const p = players.splice(0, 2);
      const match = new PlayerMatch(p);
      this.queue.remove(p[0]).remove(p[1]);
      this.matches.add(match);
    }
    return this;
  }

}

module.exports = {
  TicTacToe,
};
