(function () { 'use strict';

  class TicTacToeNetClient {

    static excludePlayer(players, player) {
      players = players || [];
      if (player) {
        const i = players.findIndex(p => p.id === player.id);
        if (i >= 0) {
          players.splice(i, 1);
        }
      }
      return players;
    }

    static normalizePlayers(players, player) {
      const inclusive = [];
      const exclusive = [];
      let found = false;
      (players || []).forEach(p => {
        inclusive.push(p);
        if (player && player.id === p.id) {
          found = true;
        } else {
          exclusive.push(p);
        }
      });
      if (!found && player) {
        inclusive.push(player)
      }
      return [ inclusive, exclusive ];
    }

    constructor(
      socket,
      player,
      players,
      chat
    ) {
      this.emitter = new app.cb.Emitter();
      this.socket = socket;

      this.player = player;
      [ this.allPlayers, this.players ]
        = TicTacToeNetClient.normalizePlayers(players, player);
      this.chat = chat || [];

      this.socket
        .on('data', data => {
          if (Array.isArray(data)) {
            for (const [ event, ...args ] of data) {
              this.socket._callbacks?.['$' + event]
                ?.forEach(cb => cb.apply(socket, args))
            }
          }
        })
        .on('games', games => this.emitter.emit('games', games))
        .on('game', game => this.emitter.emit('game', game))
        // Get our own player information
        .on('player', player => {
          this.player = player;
          this.players = TicTacToeNetClient.excludePlayer(players, this.player);
          this.emitter.emit('player', player);
        })
        // Get information on connected players
        .on('players', players => {
          this.allPlayers = players;
          this.players = TicTacToeNetClient.excludePlayer(players, this.player);
          this.emitter.emit('all-players', players);
          this.emitter.emit('players', this.players);
        })
        // Get player chatter
        .on('chat', chat => {
          this.chat.concat(chat);
          this.emitter.emit('chat', chat);
        })
        // Match made; game starting
        .on('game-start', game => {
          this.emitter.emit('game-start', game);
        })
        // Update of game state
        .on('game-state', game => {
          this.emitter.emit('game-state', game);
        })
        // Game over
        .on('game-end', game => {
          this.emitter.emit('game-end', game);
        })
      ;
    }

    on(event, fn) {
      this.emitter.on(event, fn);
      return this;
    }

    name(name) {
      this.socket.emit('name', name)
    }

    takeTurn(pos) {
      this.socket.emit('take-turn', pos)
    }

    queueToPlay() {
      this.socket.emit('queue');
    }

  }

  window.TicTacToeNetClient = TicTacToeNetClient;

})();
