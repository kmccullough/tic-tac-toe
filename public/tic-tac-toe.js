(function () { 'use strict';

  class TicTacToe {

    constructor(
      router,
      gamesEl,
      usersEl,
      queueEl,
      name,
      input,
      renderer,
      net,
      title,
      player,
    ) {
      this.router = router;
      this.gamesEl = gamesEl;
      this.usersEl = usersEl;
      this.queueEl = queueEl;
      this.name = name;
      this.input = input;
      this.renderer = renderer;
      /** @type TicTacToeNetClient */
      this.net = net;
      this.title = title;
      this.player = player || {};

      this.input
        .on('name', name => this.net.name(name))
        .on('play', () => {
          // TODO add `queue` and `lobby` events or `state` event
          this.queueEl.classList.toggle('is-hidden');
          this.net.queueToPlay();
        })
        .on('mousemove', pos => this.renderer.setState({ mouse: pos }))
        .on('mouseout', () => this.renderer.setState({ mouse: null }))
        .on('click', pos => this.renderer.setState({ click: pos }))
      ;

      this.renderer.on('take-turn', pos => {
        this.net.takeTurn(pos);
      });

      const gameState = state => {
        this.renderer.setState({
          isMyTurn: state.turn === state.marker,
          turn: state.turn,
          board: state.board,
        });
      };

      let playersHash = {};
      let gamesHash = {};

      const gameUpdate = ({ id, status, players }) => {
        console.log('gameUpdate', { id, status });
        let game = gamesHash[id];
        if (status === 'end' && game) {
          game.el.remove();
          delete gamesHash[id];
        } else {
          if (!game) {
            const el = document.createElement('div');
            const p = players.map(p => `<span class="game-player">${p.name}</span>`);
            el.classList.add('game');
            el.innerHTML = `${p[0]} vs ${p[1]}`;
            gamesEl.appendChild(el);
            gamesHash[id] = { id, status, el };
          }
        }
      };

      this.net
        .on('maintenance', time => {
          const endTime = performance.now() + time;
          const warn = () => {
            const remaining = performance.now() - endTime;
            if (remaining < 0) {
              return clearInterval(interval);
            }
            console.log(`Server shutting down for maintenance in ${Math.floor(remaining / 1000)} minutes.`);
          }
          warn();
          const interval = setInterval(warn, 1000);
        })
        .on('player', player => {
          this.name.value = player.name;
          this.player = player;
          this.title.set(player.name);
          this.renderer.setState({ [this.renderer.state.myMarker]: player.name });
        })
        .on('players', players => {
          const hash = {};
          this.usersEl.innerHTML = players.map(player => {
            hash[player.id] = {
              ...player,
              game: playersHash[player.id]?.game,
            };
            return `<span class="connected-player">${player.name}</span>`;
          }).join('');
          Object.keys(playersHash).forEach(id => {
            if (!hash[id]) {
              // Do something for disconnected player
            }
          });
          playersHash = hash;
        })
        // TODO send more general player status messages and allow the client to handle this
        .on('opponent', player => {
          const { state } = this.renderer;
          this.renderer.setState({ [state.myMarker === 'x' ? 'o' : 'x']: player.name });
        })
        .on('game', gameUpdate)
        .on('games', games => games.forEach(gameUpdate))
        .on('game-start', state => {
          this.queueEl.classList.add('is-hidden');
          console.log('Match started against ' + state.opponent.name);
          console.log('My marker is ' + state.marker + ' and it is' + (state.turn === state.marker ? '' : ' not') + ' my turn.');
          this.renderer.setState({
            isInLobby: false,
            myMarker: state.marker,
            isHumanOpponent: true,
            [state.marker]: this.player.name,
            [state.marker === 'x' ? 'o' : 'x']: state.opponent.name,
          });
          gameState(state);
          router.transitionTo('game');
        })
        .on('game-state', state => {
          console.log('Game state:', state);
          gameState(state);
        })
        .on('game-end', state => {
          console.log('Match ended against ' + state.opponent.name);
          this.renderer.setState({
            board: state.board,
            result: state.result,
          });
          setTimeout(() => {
            router.transitionTo('lobby');
            this.renderer.setState({
              board: null,
              result: null,
              isInLobby: true,
            });
          }, 5000);
        })
      ;

      router.transitionTo('lobby');
    }

    animate(frame) {
      this.renderer.animate(frame);
    }

  }

  window.TicTacToe = TicTacToe;

})();
