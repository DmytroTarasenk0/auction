class Bid {
  constructor(id, userId, lotId, amount, createdAt) {
    this.id = id;
    this.userId = userId;
    this.lotId = lotId;
    this.amount = amount;
    this.timestamp = createdAt;
  }
}

module.exports = Bid;