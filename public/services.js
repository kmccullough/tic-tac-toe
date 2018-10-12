(function(window, app) {

  const originalPart = 'original';
  const defaultPart = 'current';
  const defaultFormatFn = function (parts) {
    const titles = [];
    if (parts[originalPart]) {
      titles.unshift(parts[originalPart]);
    }
    if (parts[defaultPart]) {
      titles.unshift(parts[defaultPart]);
    }
    return titles.join(' - ');
  };

  const TitleService = function() {
    this.currentPart = defaultPart;
    this.emitter = new app.cb.Emitter();
    this.parts = [];
  };

  TitleService.prototype = {

    /**
     * Set specific title part
     * @param {string} part Part key
     * @param {string} text Text to add to title
     * @returns {TitleService}
     */
    setPart: function (part, text) {
      this.parts[part] = text;
      this.emitter.emit('change', this.get());
      return this;
    },

    /**
     * Sets current part changed when set called
     * @param {string} part Part key
     */
    setCurrentPart: function (part) {
      this.currentPart = part;
      return this;
    },

    /**
     * Sets current title part to given text
     * @param {string} text Text to add to title
     * @returns {TitleService}
     */
    set: function (text) {
      return this.setPart(this.currentPart || defaultPart, text);
    },

    /**
     * Set format function
     * @param fn
     * @returns {TitleService}
     */
    format: function (fn) {
      this.formatFn = fn;
      return this;
    },

    get: function () {
      const formatFn = this.formatFn || defaultFormatFn;
      return formatFn(this.parts);
    },

    on: function (event, fn) {
      return this.emitter.on(event, fn);
    },

  };

  window.TitleService = TitleService;


})(window, window.app);
