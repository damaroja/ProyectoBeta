

const Block = require('./block')
const Transaction = require('./transaction')
const TxOut = require('./txout')
const TxIn = require('./txin')
const ChainUtil = require('./chainutil')
const Wallet = require('./wallet')
const Pool = require('./pool')
const Miner = require('./miner')




class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    lastBlock(){
        return this.chain[this.chain.length - 1]
    }

    addBlock(data){
        const block = Block.mineBlock(this.lastBlock(), data);
        this.chain.push(block);
        console.log('new block added')
        return block;
    }

    static isValidChain(chain){
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;     
        for (let i = 1; i<chain.length; i++){
            const block = chain[i];
            const lastBlock = chain[i - 1];
            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block.index, block.timestamp, block.lastHash, block.transactions, block.nonce, block.difficulty, block.ip)){
                return false;
            }
        }
        return true;
    }


    replaceChain(newChain){
        console.log(newChain)
        if (newChain.chain.length <= this.chain.length){
            console.log('Received chain is not longer than the new chain');
            return;
        } else if (!Blockchain.isValidChain(newChain.chain)){
            console.log('The received chain is not valid');
            return;
        }
        console.log('Replacing Blockchain with the new chain');
        this.chain = newChain.chain;
    }
}


module.exports = Blockchain;



const wallet = Wallet.getWalletByPrivateKey('3e088f4740bf7c46545849a04cdd67c2d446f0cecb5fadd48f7061948c2fec40')
const wallet2 = Wallet.getWalletByPrivateKey('5f842dd33d597e56d2720fece4924f91200e6175dc666e031040c641f7b6dab3')
const wallet3 = Wallet.getWalletByPrivateKey('449272b322eea28b60b3cb0cc859e70ef12ef1a9b5355f2cd652ee91e22324c2')





console.log(wallet2.publicKey)
console.log(wallet3.publicKey)











/*
const tx2 = Transaction.newTransaction(wallet, 'fsdfrwehghgthj00000', 5, bc, 'p2pkh')
const updateTx = tx.updateTransaction(tx2, bc)   // tx se actualiza a tx2... significa que se suman las normalOutputs y se corrige la backOutput
const tx3 = Transaction.newTransaction(wallet, 'fsdfrwehghgthj888888', 15, bc, 'p2pkh')
const updatetx2 = updateTx.updateTransaction(tx3, bc)  // tx2 se actualiza a tx3... significa que se suman las normalOutputs y se corrige la backOutput
const p = pool.updateOrAddTransaction(updatetx2, bc)   // Se introduce en la pool sin problemas ya que no existe otra de la misma address. Esta vacia []
const tx4 = Transaction.newTransaction(wallet, 'fsdfrwehghgth6666666', 3, bc, 'p2pk')  // Creamos tx4
const p2 = pool.updateOrAddTransaction(tx4, bc)
console.log(p2.poolTransactions)
const block = miner.mine()
console.log(block)
console.log(Transaction.UTXOSet(bc, wallet.publicKey))
console.log(Transaction.calculateBalance(bc, wallet.publicKey))
const tx5 = Transaction.newTransaction(wallet, 'fsdfrwehghgth7676767676', 5, bc, 'p2pkh')
const p3 = pool.updateOrAddTransaction(tx5, bc)
const block2 = miner.mine()
console.log(block2)
console.log(Transaction.calculateBalance(bc, wallet.publicKey))
*/

