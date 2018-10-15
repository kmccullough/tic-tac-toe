(function(window, document) {

  function Emitter() {
    this.listeners = {};
  }
  Emitter.prototype = {
    on: function (event, fn) {
      const listeners = this.listeners[event] = this.listeners[event] || [];
      listeners.push(fn);
      return function () {
        const i = listeners.indexOf(fn);
        if (i >= 0) {
          listeners.splice(i, 1);
        }
      };
    },
    emit: function (event, args) {
      const listeners = this.listeners[event] || [];
      args = [].slice.call(arguments, 1);
      listeners.forEach(function (fn) {
        if (typeof fn === 'function') {
          fn.apply(this, args);
        }
      });
    },
  };

  function App() {
    this.emitter = new Emitter();
    document.addEventListener('DOMContentLoaded', () => {
      this.emitter.emit('run');
    });
  }
  App.prototype = {
    /**
     * Run given function after system ready
     * @param {function} fn Callback function
     * @returns {App}
     */
    run: function (fn) {
      const deregister = this.emitter.on('run', () => {
        deregister();
        app.fn.wrap(fn)();
      });
      return this;
    },
    /**
     * DOM Utility Functions
     */
    dom: {
      /**
       * Get one matching element from the DOM
       * @param {string} selector DOM query selector
       * @param {Element} [el] Element to search from
       * @returns {Element}
       */
      one: function (selector, el) {
        return (el || document).querySelector(selector);
      },
      /**
       * Get all matching element from the DOM
       * @param {string} selector DOM query selector
       * @param {Element} [el] Element to search from
       * @returns {NodeListOf<Element>}
       */
      all: function (selector, el) {
        return (el || document).querySelectorAll(selector);
      },
      /**
       * Remove all children from given element
       * @param {Element} el Element to clear children from
       * @returns {Element[]} Removed elements
       */
      clearChildren: function (el) {
        const removedNodes = [];
        while (el && el.firstChild) {
          removedNodes.push(el.removeChild(el.firstChild));
        }
        return removedNodes;
      },
      /**
       * Set given element's content to given element
       * @param {Element} el Element to append children to
       * @param {...Element[]} [childEls] Elements to append as children
       * @returns {dom}
       */
      setChildren: function(el, childEls) {
        const self = app.dom;
        self.clearChildren(el);
        childEls = [].slice.call(arguments, 1);
        self.addChildren.apply(self, [el].concat(childEls));
        return self;
      },
      /**
       * Add to given element's content, content of given template element
       * @param {Element} el Element to append children to
       * @param {...Element[]} [childEls] Elements to append as children
       * @returns {dom}
       */
      addChildren: function(el, childEls) {
        const self = app.dom;
        if (el && el.appendChild) {
          childEls = [].slice.call(arguments, 1).filter(el => el);
          childEls.forEach(function (childEl) {
            el.appendChild(childEl);
          });
        }
        return self;
      },
      /**
       * Returns imported node for given template
       * @param {Element} tpl Element to copy template content from
       * @returns {Element}
       */
      getTemplate: function(tpl) {
        return tpl && tpl.content && tpl.content.cloneNode(true);
      },
      /**
       * Set given element's content to content of given template element
       * @param {Element} el Element to copy template content to
       * @param {Element} [tpl] Element to copy template content from
       * @returns {dom}
       */
      setTemplate: function(el, tpl) {
        const self = app.dom;
        return self.setChildren(el, self.getTemplate(tpl));
      },
      /**
       * Add to given element's content, content of given template element
       * @param {Element} el Element to copy template content to
       * @param {Element} [tpl] Element to copy template content from
       * @returns {dom}
       */
      addTemplate: function(el, tpl) {
        const self = app.dom;
        return self.addChildren(el, self.getTemplate(tpl));
      }
    },
    /**
     * Canvas Utility Functions
     */
    canvas: {
      /**
       * Calls given animation function at given frame-rate
       * @param {number} fps Frames per-second
       * @param {function} fn Animation function
       * @returns {canvas}
       */
      animate: function(fps, fn) {
        const interval = 1000 / fps;
        let now;
        let last = Date.now();
        let delta;
        function draw() {
          requestAnimationFrame(draw);
          now = Date.now();
          delta = now - last;
          if (delta > interval) {
            // update time stuffs
            // Just `then = now` is not enough.
            // Lets say we set fps at 10 which means
            // each frame must take 100ms
            // Now frame executes in 16ms (60fps) so
            // the loop iterates 7 times (16*7 = 112ms) until
            // delta > interval === true
            // Eventually this lowers down the FPS as
            // 112*10 = 1120ms (NOT 1000ms).
            // So we have to get rid of that extra 12ms
            // by subtracting delta (112) % interval (100).
            // Hope that makes sense.
            last = now - (delta % interval);
            // ... Code for Drawing the Frame ...
            fn({
              now: now,
              last: last,
              delta: delta
            });
          }
        }
        draw();
        return app.canvas;
      }
    },
    /**
     * Function Utility Functions
     */
    fn: {
      /**
       * Whether given value is a function
       * @param {function|*} fn Value to test
       * @returns {boolean}
       */
      is: function (fn) {
        return typeof fn === 'function';
      },
      /**
       * Gives function which returns given function result or undefined
       * @param {function|*} fn Function to call, if it is a function
       * @param {object|null|*} [self] Context for given function call
       * @param {...*} [args] Arguments to pass to given function
       * @returns {function} Wrapped function
       */
      wrap: function (fn, self, args) {
        return typeof fn !== 'function' ? function () {}
          : fn.bind.apply(fn, [].slice.call(arguments, 1));
      },
      /**
       * Gives function which returns given function result or undefined
       * @param {object} self Context for given function call
       * @param {string} method Name of object method to call
       * @param {...*} [args] Arguments to pass to method
       * @returns {function} Wrapped function
       */
      method: function (self, method, args) {
        const fn = app.fn.wrap(self && self[method], self);
        return fn.bind.apply(fn, [].slice.call(arguments, 2));
      },
    },
    /**
     * Callback Utility Functions
     */
    cb: {
      Emitter: Emitter,
    },
    math: {
      is2DContained: (rect, pos) =>
        rect && pos
        && pos.x > rect.left && pos.x < rect.right
        && pos.y > rect.top  && pos.y < rect.bottom
    }
  };

  const app = window.app = new App();

})(window, document);
