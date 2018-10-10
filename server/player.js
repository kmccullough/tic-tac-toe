class Player {

  constructor(
    playerOrId
  ) {
    if (typeof playerOrId === 'string' || typeof playerOrId === 'number') {
      this.id = playerOrId;
    } else if (playerOrId) {
      this.id = playerOrId.id;
      this.name = playerOrId.name;
    }
  }

  static wrap(playerLike) {
    return playerLike instanceof Player ? playerLike : new Player(playerLike);
  }

}

module.exports = Player;
