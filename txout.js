
const ChainUtil = require('./chainutil')



/*
Hay cuatro tipos de outputs 
    1- normal (se envia valor a otra direccion)
    2- reward (coinbase)
    3- return (vuelta de una transaccion)
    4- feed (feed de las transacciones)
*/ 

class TxOut{
    constructor(timestamp, amount, scriptPubKey, type, locktime, address){
        this.timestamp = timestamp
        this.id = ChainUtil.id()
        this.amount = amount;
        this.scriptPubKey = scriptPubKey;   
        this.locktime = locktime
        this.address = address
        this.typeTxOut = type    
    }



    toString(){
        return `Output ---
             Timestamp       :${this.timestamp}
             Id              :${this.id}
             Amount          :${this.amount}
             ScriptPubKey    :${this.scriptPubKey.script}
             Locktime        :${this.locktime}
             Address         :${this.address}
             Return Output   :${this.typeTxOut}
             `
    }

    static addOutputToTransaction(output, transaction){
        transaction.outputs.push(output)
        return transaction
    }


    static totalOutputs(blockchain){
        let outputs = blockchain.chain.map(block => block.transactions)
                                        .flat(1)
                                        .map(transaction => transaction.outputs)
                                        .flat(1)
        return outputs
    }


    static outputsOfAddress(blockchain, publicKey, type = 'p2pk'){
        let outputsP2PK, outputsP2PKH
        const hash = ChainUtil.hash(ChainUtil.hash(ChainUtil.hash(publicKey)))
        const transactions = blockchain.chain.map(block => {
            return block.transactions
        } )
        const totalOutputs = TxOut.outputsList(transactions.flat(2))
        if (type === 'p2pk'){
            outputsP2PK = totalOutputs.filter(output => {
                return ((output.scriptPubKey.typeScript === 'p2pk') && (output.scriptPubKey.script[0] === publicKey))
            })
            return outputsP2PK
        }
        else if (type === 'p2pkh'){
            outputsP2PKH = totalOutputs.filter(output => {
                return ((output.scriptPubKey.typeScript === 'p2pkh') && (output.scriptPubKey.script[2] === hash))
            })
            return outputsP2PKH
        }
        else if (type === 'all'){
            outputsP2PK = totalOutputs.filter(output => {
                return ((output.scriptPubKey.typeScript === 'p2pk') && (output.scriptPubKey.script[0] === publicKey))
            })
            outputsP2PKH = totalOutputs.filter(output => {
                return ((output.scriptPubKey.typeScript === 'p2pkh') && (output.scriptPubKey.script[2] === hash))
            })
            return outputsP2PK.concat(outputsP2PKH).flat(1)
        }
         else {
            throw new Error('unknown output type')
        }       
    }

    static outputsList(transactions){
        const outputs = transactions.map(tx => tx.outputs)
        return outputs.flat(2)
    }




}

module.exports = TxOut;



