const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

module.exports = class Transaction {
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
