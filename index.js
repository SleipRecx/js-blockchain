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

    addSignature(signature){
        this.signature = signature
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

class Blockchain {
    constructor() {
      this.chain = [new Block(Date.now(), [], '0000')]
      this.difficulty = 3
      this.pendingTransactions = []
      this.miningReward = 25
    }

    addTransaction(transaction) {
         this.pendingTransactions.push(transaction);
    }

    mineBlock(adress){
        const rewardTransaction = new Transaction(null, adress, this.miningReward);
        this.pendingTransactions.push(rewardTransaction);

        let block = new Block(Date.now(), this.pendingTransactions, this.chain[this.chain.length - 1].hash);
        const nonce = block.mine(this.difficulty);
        this.chain.push(block);

        this.pendingTransactions = [];
        return nonce
    }


    isValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const previous = this.chain[i-1]
            const current = this.chain[i]

            if (current.previousHash !== previous.hash){
                return false
            }

            if (!current.isValid()) {
                return false;
            }
            if (current.hash !== current.calculateHash()) {
                return false;
            }
        }
        return true
    }

    print(){
        console.log(JSON.stringify(this.chain, null, 2))
    }
}

class Wallet {
    constructor(){
        this.keyPair = ec.genKeyPair()   
    }

    getPublicKey(){
        return this.keyPair.getPublic("hex")
    }

    sign(hash){
        return this.keyPair.sign(hash, 'base64').toDER('hex')
    }
}

  
alice = new Wallet()
bob = new Wallet()

const blockchain = new Blockchain()
const tx = new Transaction(alice.getPublicKey(), bob.getPublicKey(), 100)
tx.addSignature(alice.sign(tx.calculateHash()))

blockchain.addTransaction(tx)
blockchain.mineBlock(alice.getPublicKey())

blockchain.print()
