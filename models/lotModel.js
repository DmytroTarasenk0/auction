class Lot {
    constructor(id, title, startingPrice, description, userId, currentPrice, winnerId, isActive) {
      this.id = id;
      this.title = title;
      this.startingPrice = startingPrice;
      this.description = description;
      this.userId = userId;
      this.currentPrice = currentPrice;
      this.winnerId = winnerId;
      this.isActive = isActive;
    }
  }
  
  module.exports = Lot;
  