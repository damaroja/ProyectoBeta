

const Transaction = require('./transaction')
const TxOut = require('./txout')
const ChainUtil = require('./chainutil')
const TxIn = require('./txin')
const Wallet = require('./wallet')
const Blockchain = require('./blockchain')


Object.defineProperty(Array.prototype, 'flat', {     // This function flat the array argument
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});


/*
Esta clase sirve para almacenar todas las transacciones que realizamos y que nos llegan por la red. 
Para empezar, debemos de comprobar:
    1- Que la transaccion que llega sea una transaccion (updateOrAddTransaction)
    2- Que sea una transaccion valida (se comprueba que la firma de la input sea correcta por cada output a gastar) (authenticateTransaction)
    3- Se comprueba que no existe una transaccion realizada con la misma wallet (es decir, se comprueba que no haya dos transacciones con el mismo emisor)
        (existingTransactionInPool)
    4- Si existe una transaccion con el mismo emisor, se actualiza con los datos de la nueva transaccion (updateTransaction)
    5- Si no existe, se añade al pool de transacciones (UpdateOrAddTransaction)


*/
class Pool{
    constructor(){
        this.poolTransactions = []
    }

    toString(){
        return this.poolTransactions.toString()
    }

    static addressOfTransaction(transaction){
      // No hace falta verificar los argumentos ya que se delega a funciones superiores
      // Necesitamos sacar el address de la transaccion para propositos de busqueda en el pool
        const inputs = transaction.inputs.filter(input => {
            return input.rewardInput === false
        })    // buscamos las inputs de la transaccion que no sean de reward
        return inputs[0].scriptSig.address     // buscamos la address de la primera. Todas son iguales respecto a rewardInput   
    }

    static existingTransactionInPool(poolTransactions, transaction){  // Aqui miramos si existe otra transacction nuestra
        // retorna el indice de la transaccion en el pool si existe
        // Si no existe retorna -1

        // poolTransactions  como argumento entra comp array ----> pool.poolTransaction
        const address = Pool.addressOfTransaction(transaction)
        if (!address){
            throw new Error('No address found (existingTransactionInPool). Error: ')
        }
        let indexTransactions = -1
        if (!(poolTransactions && poolTransactions.length > 0)) {
            return indexTransactions
        } else {
            poolTransactions.map((tx, index) => {
                tx.inputs.map(input => {
                    if (input.scriptSig.address === address){                       
                        indexTransactions = index 
                        return indexTransactions                       
                    }
                })
            })
        } 
        return indexTransactions        
    }

    
    updateOrAddTransaction(transaction, blockchain){  // Si existe una transaccion nuestra, se actualiza, si no, se añade como nueva
        let address = Pool.addressOfTransaction(transaction)    // Extraemos la direccion que inicia la transaccion
        if (!address){
            throw new Error('Address not found. (UpdateOrAddTransaction). Error: 500')
        }
        let tx = Transaction.cloneTransaction(transaction, 1, false)
        if (!(tx.authenticateTransaction(address, blockchain))){    // Se verifica que sea correcta
            throw new Error('wrong transaction (authenticateTransaction)')
        }
        const index = Pool.existingTransactionInPool(this.poolTransactions, transaction)    //  Verificamos que exista ya una transaccion iniciada por la misma direccion
        if (index === -1){
            this.poolTransactions.push(transaction)
            console.log(`Added the transaction to the transaction pool`)   // Si no la hay, se añade
            return transaction
        } else {
            const oldTransaction = this.poolTransactions[index]    // Si existe, se actualiza
            const newTransaction = oldTransaction.updateTransaction(transaction, blockchain)
            this.poolTransactions.splice(index, 1)
            this.poolTransactions.push(newTransaction)
            console.log(`Update the transaction to the transaction pool`)
            return newTransaction
        }
    }

    clearPool(){
        this.poolTransactions = []
    }



}

module.exports = Pool



