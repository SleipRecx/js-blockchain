const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(from, to, amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.timestamp = Date.now();
      }

    calculateHash(){
        return SHA256(this.from + this.to + this.amount + this.timestamp).toString()
    }

    sign(key){
        if (key.getPublic('hex') !== this.from) {
            throw new Error("You can only sign your own transactions.")
        }
        this.signature = key.sign(this.calculateHash(), 'base64').toDER('hex')
    }

    isValid(){
        if (this.from === null) return true;
        if (!this.signature || this.signature.length === 0) return false;
        const publicKey = ec.keyFromPublic(this.from, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
    
}


class Block {
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

    hasValidTransactions() {
        for (const tx of this.transactions) {
          if (!tx.isValid()) {
            return false;
          }
        }

        return true;
      }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
          this.nonce++;
          this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
        return this.nonce
      }
    
}

class Blockchain {
    constructor() {
      this.chain = [new Block(Date.now(), [], 'genisis')]
      this.difficulty = 3
      this.pendingTransactions = []
      this.miningReward = 50
    }

    addTransaction(transaction) {
         this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(adress){
        const rewardTransaction = new Transaction(null, adress, this.miningReward);
        this.pendingTransactions.push(rewardTransaction);

        let block = new Block(Date.now(), this.pendingTransactions, this.chain[this.chain.length - 1].hash);
        const nonce = block.mineBlock(this.difficulty);
        this.chain.push(block);

        /*
        if (this.chain.length % 2016 === 0){
            const twoWeeks = 1209600
            const timeElapsed = Math.ceil((Date.now() - this.chain[this.chain.length - 2016].timestamp) / 1000)
            console.log(timeElapsed)
            this.difficulty = this.difficulty * twoWeeks / timeElapsed
            console.log("Diff changed")
            console.log(this.difficulty)
        }
        */

        this.pendingTransactions = [];
        return nonce
    }

    getBalance(address){
        let balance = 0;

        for (const block of this.chain) {
          for (const trans of block.transactions) {
            if (trans.from === address) {
              balance -= trans.amount;
            }
    
            if (trans.to === address) {
              balance += trans.amount;
            }
          }
        }
    
        return balance;
    }
    isValid(){
        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i]
            
            if (!block.hasValidTransactions()) {
                return false;
            }
            if (block.hash !== block.calculateHash()) {
                return false;
            }
        }
        return true
    }
}
  
  
const alice = ec.genKeyPair();
const alicePublic = alice.getPublic("hex")

const bob = ec.genKeyPair();
const bobPublic = bob.getPublic("hex")



const blockchain = new Blockchain()



blockchain.minePendingTransactions(alicePublic)

//const tx = new Transaction(alicePublic, bobPublic, 100)
//tx.sign(alice)

//blockchain.addTransaction(tx)
//blockchain.minePendingTransactions(alicePublic)

console.log(blockchain.isValid())


blockchain.chain[1].transactions[0].amount = 1000

console.log(blockchain.isValid())
