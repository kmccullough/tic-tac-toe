(function () { 'use strict';

  class TicTacToe {

    constructor(
      renderer,
      socket,
      title,
      player,
      players,
      chat
    ) {
      this.renderer = renderer;
      this.socket = socket;
      this.title = title;

      this.player = player || new PlayerInfo();
      this.players = players || new ServerPlayers();
      this.chat = chat || new ServerChat();
      this._allPlayers = [];

      this._initSocket();
    }

    _initSocket() {

      const filterPlayers = () => {
        if (this._allPlayers.length && this.player.name) {
          this.players.set(
            this._allPlayers.filter(player => player.name !== this.player.name)
          );
        }
      };

      // Get our own player information
      this.socket.on('player', player => {
        this.player.set(player);
        filterPlayers();
        this.title.set(player.name);
      })

      // Get information on connected players
      .on('players', players => {
        this._allPlayers = players;
        filterPlayers();
      });

      // Get player chatter
      this.socket.on('chat', chat => {
        this.chat.add(chat);
      });

    }

    animate(frame) {
      this.renderer.animate(frame);
    }

  }

  window.TicTacToe = TicTacToe;

})();
