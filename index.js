const Wallet = require("./src/wallet")
const Blockchain = require("./src/blockchain")
const Transaction = require("./src/transaction")  

alice = new Wallet()
bob = new Wallet()

const blockchain = new Blockchain()
const tx = new Transaction(alice.getPublicKey(), bob.getPublicKey(), 100)
tx.addSignature(alice.sign(tx.calculateHash()))

blockchain.addTransaction(tx)
blockchain.mineBlock(alice.getPublicKey())

blockchain.print()
