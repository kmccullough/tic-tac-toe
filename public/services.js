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

  const PlayerInfo = function() {
    this.emitter = new app.cb.Emitter();
    this.data = {};
  };

  PlayerInfo.prototype = {

    set: function (data) {
      this.data = data || {};
      this.emitter.emit('change', this.data);
      return this;
    },

    get: function () {
      return this.data || {};
    },

    on: function (event, fn) {
      return this.emitter.on(event, fn);
    },

  };

  window.PlayerInfo = PlayerInfo;


  const ServerPlayers = function() {
    this.emitter = new app.cb.Emitter();
    this.players = [];
  };

  ServerPlayers.prototype = {

    set: function (players) {
      this.players = players || [];
      this.emitter.emit('change', this.players);
      return this;
    },

    get: function () {
      return this.players || [];
    },

    on: function (event, fn) {
      return this.emitter.on(event, fn);
    },

  };

  window.ServerPlayers = ServerPlayers;


  const ServerChat = function() {
    this.emitter = new app.cb.Emitter();
    this.chat = [];
  };

  ServerChat.prototype = {

    add: function (chat) {
      this.chat = this.concat(chat);
      this.emitter.emit('change', chat);
      return this;
    },

    get: function () {
      return this.chat || [];
    },

    on: function (event, fn) {
      return this.emitter.on(event, fn);
    },

  };

  window.ServerChat = ServerChat;


})(window, window.app);
