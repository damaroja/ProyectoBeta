

const Transaction = require('./transaction')
const Wallet = require('./wallet')
const Blockchain = require('./blockchain')
const Pool = require('./pool')


class Miner{
    constructor(pool, blockchain, minerAddress){
        this.pool = pool
        this.blockchain = blockchain
        this.minerAddress = minerAddress
    }

    mine(){
        //  comprobar todas las transacciones del pool. La transaccion erronea se borra del pool
        this.pool.poolTransactions.map((transaction, index)=> {
            const publicKey = Pool.addressOfTransaction(transaction)
            if (!transaction.authenticateTransaction(publicKey, this.blockchain)){
                this.pool.poolTransactions.slice(index, 1)
            }
        })
        const timestamp = Date.now()
        const rewardTransaction = Transaction.coinbaseTransaction(this.minerAddress, this.blockchain.chain.length, timestamp)
        this.pool.poolTransactions.push(rewardTransaction)
        const transactions = this.pool.poolTransactions
        const newBlock = this.blockchain.addBlock(transactions)
        this.pool.clearPool()
        return newBlock
    }
}

module.exports = Miner


