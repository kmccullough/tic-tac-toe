(function () { 'use strict';

  class TicTacToeRouter {

    constructor(parentEl, routes) {
      this.parentEl = parentEl
      this.routes = { ...routes };
    }

    transitionTo(route) {
      const oldRoute = this.route;
      if (oldRoute === route || !(route in this.routes)) {
        return;
      }
      const { routes } = this;
      this.route = route;
      Object.entries(routes).forEach(([ r, el ]) => {
        if (r === route) {
          return;
        }
        el.remove();
      });
      this.parentEl.appendChild(routes[route]);
    }

  }

  window.TicTacToeRouter = TicTacToeRouter;

})();
