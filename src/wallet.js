const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

module.exports = class Wallet {
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