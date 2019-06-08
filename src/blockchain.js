const Block = require("./block")
const Transaction = require("./transaction")  

module.exports = class Blockchain {
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
