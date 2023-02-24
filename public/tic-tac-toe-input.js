(function () { 'use strict';

  class TicTacToeInput {

    constructor(
      canvas,
      name,
      play
    ) {
      this.canvas = canvas;
      this.name = name;
      this.play = play;
      this.emitter = new app.cb.Emitter();

      name.addEventListener('change', () => this.emitter.emit('name', name.value));
      play.addEventListener('click', () => this.emitter.emit('play'));

      canvas.addEventListener('mousemove', event => {
        this.emitter.emit('mousemove', {
          event: event,
          x: event.clientX,
          y: event.clientY,
        });
      });
      canvas.addEventListener('mouseout', event => {
        this.emitter.emit('mouseout', {
          event: event,
          x: event.clientX,
          y: event.clientY,
        });
      });
      canvas.addEventListener('click', event => {
        this.emitter.emit('click', {
          event: event,
          x: event.clientX,
          y: event.clientY,
        });
      });
    }

    on(event, fn) {
      this.emitter.on(event, fn);
      return this;
    }

  }

  window.TicTacToeInput = TicTacToeInput;

})();
