const SHA256 = require('crypto-js/sha256');

module.exports = class Block {
    constructor(timestamp, transactions, previousHash = '') {
      this.previousHash = previousHash;
      this.timestamp = timestamp;
      this.transactions = transactions;
      this.nonce = 0;
      this.hash = this.calculateHash();
    }
  
    calculateHash() {
      return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    isValid(){
        if (this.hash !== this.calculateHash()){
            return false
        }
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
              return false;
            }
          }
        return true
    }

    mine(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
          this.nonce++;
          this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
        return this.nonce
      }
    
}