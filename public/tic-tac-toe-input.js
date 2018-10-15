(function () { 'use strict';

  class TicTacToeInput {

    constructor(
      element
    ) {
      this.element = element = element || document;
      this.emitter = new app.cb.Emitter();

      element.addEventListener('click', event => {
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
