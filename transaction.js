


const ChainUtil = require('./chainutil');
const TxIn = require('./txin');
const TxOut = require('./txout')
const Script = require('./script')
const SPU = require('./spu')


function mergeOutputs(outputSet){
    var result = []
    outputSet.forEach(el => {
        var item = result.find(el1 => {
            return el1.address === el.address
        })
        if (item!==undefined) {
                    item.amount += el.amount;
                } else {
                    result.push(el);
                   
                }
    })
    return result
}



class Transaction{
    constructor(version, testnet){
        this.id = ChainUtil.id();
        this.version = version;
        this.inputs = [];
        this.outputs = [];
        this.testnet = testnet;
    }

    toString(){
        return `Transaction ---
            Version         :${this.version}
            Inputs          :${this.inputs.toString()}
            Outputs         :${this.outputs.toString()}
            Testnet         :${this.testnet}`
    }


    static UTXOSet(blockchain, address){
        // No hace falta verificar los argumentos ya que se delega a funciones superiores
        let unSpendOutputSet
        let spendOutputSet
        const outputsAddress = TxOut.outputsOfAddress(blockchain, address, 'all')
        if (!(outputsAddress && outputsAddress.length > 0)) {
            unSpendOutputSet = []     // Buscamos todas las outputs de la address en la blockchain
            return unSpendOutputSet.flat(3)   // Si no hay ninguna output, devolvemos array vacio []
        }
        const totalInputs = TxIn.inputsOfAddress(blockchain, address)
        if (!(totalInputs && totalInputs.length > 0)) {
            unSpendOutputSet = outputsAddress     // Buscamos todas las inputs de la address en la blockchain
            return unSpendOutputSet.flat(3)   // Si no hay ninguna input, devolvemos todas las outputs ya que no estan referenciadas y por ello son no gastadas
        }
        spendOutputSet = []
        totalInputs.map(input => {
            outputsAddress.map(output => {
                if (input.id === ChainUtil.hash(JSON.stringify(output))){
                    spendOutputSet.push(output)
                }
            })
        })   
        unSpendOutputSet = outputsAddress.filter(output => !spendOutputSet.includes(output));
        return unSpendOutputSet.flat(3)
    }

    static calculateBalance(blockchain, publicKey){
        // No hace falta verificar los argumentos ya que se delega a funciones superiores
        let balance = 0
        const utxoSet = Transaction.UTXOSet(blockchain, publicKey)
        if (!(utxoSet && utxoSet.length > 0)) {
            return balance
        }
        if ((typeof utxoSet === 'undefined') || (utxoSet === [])){
            return balance
        }
        try {                      
            utxoSet.map(output => {
                balance+= output.amount
        })} catch (error){
                console.log('Error calculating balance (calculateBalance). Error: 402')
                return
        }     
        return balance
    }

    static newTransaction(senderWallet, recipient, amount, blockchain, typeTransaction){
        if ((typeTransaction !== 'p2pk') && (typeTransaction !== 'p2pkh')){
            throw new Error('Unknown typetransaction (newTransaction). Error: 103')
        }
        const address = senderWallet.publicKey
        // Necesitamos poner una autenticacion para el recipient ( Error: 104)
        const balance = Number(Transaction.calculateBalance(blockchain, address))
        if (balance === 0){
            throw new Error('The transaction cannot be started. Balance = 0 (newTransaction). Error: 210')
        }
        if (balance < 0){
            throw new Error('there has been an error with calculating the balance (newTransaction). Error: 211')
        }
        if (balance < Number(amount)){
            throw new Error('Amount exceeds balance (newTransaction). Error: 212')
        }
        if (Number(amount <= 0)){
            throw new Error('It was not possible to add this transaction. Reverting changes (newTransaction). Error: 213')
        }
        const version = 1
        const testnet = false
        const utxo = Transaction.UTXOSet(blockchain, address)
        const inputsSet = utxo.map(output => {
            const id = ChainUtil.hash(JSON.stringify(output))
            const timestamp = Date.now()
            const type = output.scriptPubKey.typeScript   // Le ponemos el tipo de script de la salida si no no va a coincidir la verificacion
            const sc = new Script(type)
            const rewardInput = false
            return new TxIn(id, sc.scriptSig(senderWallet, id), timestamp, rewardInput)
        })
        const locktime = 5
        const sc2 = new Script(typeTransaction)
        const typeTxOut = 'normal'
        const timestamp = Date.now()
        const output = new TxOut(timestamp, amount, sc2.scriptPubKey(recipient, address), typeTxOut, locktime, recipient)
        const transference = Number(balance) - Number(amount)
        const transaction = new Transaction(version, testnet)
        if (transference > 0){
            const backSc = new Script(typeTransaction)
            const typeTxOut = 'return'
            const backOutput = new TxOut(timestamp, transference, backSc.scriptPubKey(address, address), typeTxOut, locktime, recipient)                       
            TxOut.addOutputToTransaction(backOutput, transaction) 
            TxOut.addOutputToTransaction(output, transaction)
        } else if (transference === 0) {
            TxOut.addOutputToTransaction(output, transaction)
        } else {
            throw new Error('Error calculating transference. (newTransaction). Error 600')
        }
        inputsSet.map(input => {
            TxIn.addInputToTransaction(input, transaction)
        })            
        return transaction
    }

    updateTransaction(newTransaction, blockchain){
        let transaccion
        if (!(newTransaction instanceof Transaction)){           
            throw new Error('Wrong data instead of transaction object (updateTransaction)')
        }
        const version = 1
        const testnet = false
        const inputs = this.inputs.filter(input => {
            return input.rewardInput === false
        })
        const address = inputs[0].scriptSig.address // hallamos la direccion del emisor

        let oldAmount = 0
        this.outputs.filter(output => {
            return (output.typeTxOut !== 'return')
        }).map(output => {
            return oldAmount+= output.amount
        }).flat(2)   // calculamos el total de las outputs de la vieja transaccion

        let newAmount = 0
        newTransaction.outputs.filter(output => {
            return (output.typeTxOut !== 'return')
        }).map(output => {
            return newAmount+= output.amount
        }).flat(2)   // calculamos el total de las outputs de la nueva transaccion

        const balance = Transaction.calculateBalance(blockchain, address)   // Aqui calculamos el balance que tenemos a nivel de Blockchain
        if (newAmount < 0){
            throw new Error('It was not possible to add this transaction. Reverting changes (updateTransaction) Error 100')
        }
        if (oldAmount < 0){
            throw new Error('It was not possible to add this transaction. Reverting changes (updateTransaction) Error 101')
        } 
        if (balance < (oldAmount + newAmount)){
            console.log(balance + ' ' + oldAmount + ' ' + newAmount)
            throw new Error('It was not possible to add this transaction. Reverting changes (updateTransaction) Error 102')
        } 
        try {
            const oldOutputsWithoutBackOutput = this.outputs.filter(output => {
                return ((output.typeTxOut !== 'return') && (output.typeTxOut !== 'reward'))         
            })
            const newOutputsWithoutBackOutput = newTransaction.outputs.filter(output => {
                return ((output.typeTxOut !== 'return') && (output.typeTxOut !== 'reward'))           
            })   // sacamos todas las outputs de la transaccion excepto las reward y las return


            let amountOldOutputsWithoutBackOutput = 0
            oldOutputsWithoutBackOutput.map(output => {
                amountOldOutputsWithoutBackOutput+= output.amount
            })   // calculamos su suma
            let amountNewOutputsWithoutBackOutput = 0
            newOutputsWithoutBackOutput.map(output => {
                amountNewOutputsWithoutBackOutput+= output.amount
            })
            if (amountNewOutputsWithoutBackOutput <= 0 || amountOldOutputsWithoutBackOutput <= 0){
                throw new Error('It was not possible to add this transaction. Reverting changes (updateTransaction) Error 107')
            }
            const backAmount = balance - (amountNewOutputsWithoutBackOutput + amountOldOutputsWithoutBackOutput)
            const sc = new Script(newOutputsWithoutBackOutput[0].scriptPubKey.typeScript)
            const typeTxOut = 'return'
            const locktime = 5
            const timestamp = Date.now()
            let backOutput
            let totalOutputs
            if (backAmount === 0){
                totalOutputs = newOutputsWithoutBackOutput.concat(oldOutputsWithoutBackOutput)
            } else {
                backOutput = new TxOut(timestamp, backAmount, sc.scriptPubKey(address, address), typeTxOut, locktime, address)
                totalOutputs = newOutputsWithoutBackOutput.concat(oldOutputsWithoutBackOutput).concat(backOutput)
            } 
            transaccion = new Transaction(version, testnet)
            newTransaction.inputs.map(input => {
                TxIn.addInputToTransaction(input, transaccion)
            })
            const newTotalOutputs = mergeOutputs(totalOutputs)
            newTotalOutputs.map(output => {
                TxOut.addOutputToTransaction(output, transaccion)
            })
        } catch (error){
            console.log('Error trying updating the transaction. Reversing changes...')
    }  
        console.log(transaccion.toString())
        return transaccion
    }

    authenticateTransaction(publicKey, blockchain){
        let auth = false
        const txSet = TxOut.outputsOfAddress(blockchain, publicKey, 'all')
        this.inputs.map(input => {
            txSet.map(output => {               
                let hash = ChainUtil.hash(JSON.stringify(output))
                if (hash === input.id){                   
                    let spk = output.scriptPubKey.script
                    let ss = input.scriptSig.script
                    const bytecode = ss.concat(spk)
                    let spu = new SPU(bytecode)                   
                    spu.evaluate(hash)                   
                    if (spu.topStack() === 0){
                    auth = true
                    spu.viewStack()
                } else {
                    return false                      
                } 
                }
            })
        })
        return auth     
    }

    static deployTransaction(wallet, recipient, amount, blockchain, typeTransaction, poolTransaction){
        if (amount <= 0){
            throw new Error('amount must to be more than zero')
        }
        if ((typeTransaction !== 'p2pk') && (typeTransaction !== 'p2pkh')){
            throw new Error('Unknown typetransaction (newTransaction). Error: 103')
        }
        const transaction = Transaction.newTransaction(wallet, recipient, amount, blockchain, typeTransaction)
        poolTransaction.updateOrAddTransaction(transaction, blockchain)
        return transaction   
    }

    static coinbaseTransaction(address, length, timestamp = new Date(0).getMilliseconds()){
        const reward = Transaction.reward(length)
        const locktime = 100   // El tipo de transaccion para la coinbaseTransaction es P2PK y el locktime es de 100 para evitar que se gaste rapido
        const sc = new Script()
        const rewardInput = true
        const input = new TxIn('0'.repeat(64), sc.coinbaseScriptSig(address), timestamp, rewardInput);  // La wallet del sistema es unica
        input.id = '00000000-0000-0000-0000-000000000000'
        const sc2 = new Script('p2pk')
        const typeOutput = 'reward'
        const output = new TxOut(timestamp, reward, sc2.scriptPubKey(address, '0'.repeat(130)), typeOutput, locktime) 
        output.id = '00000000-0000-0000-0000-000000000000'  
        const version = 1
        const testnet = false
        const transaction = new this(version, testnet) 
        TxOut.addOutputToTransaction(output, transaction)
        TxIn.addInputToTransaction(input, transaction)
        return transaction
    }
   
    static reward(size){
        if(isNaN(size)){
            throw new Error('Wrong data instead of number argument')
        }
        if (size < 0){
            throw new Error('Wrong argument')
        }
        if (size <= 100000){
            return 50
        }
        else if ((size > 100000) && (size < 1000000)){
            return 25
        }
        else if ((size >= 1000000) && (size < 10000000)){
            return 12.5
        }
        else if ((size >= 10000000) && (size < 100000000)){
            return 6.25
        }
        else if ((size >= 100000000) && (size < 1000000000)){
            return 3.125
        }
        else {
            return 1
        }

    }

    static transactionList(blockchain){
        const transactions = blockchain.chain.map(block => block.transactions)
        return transactions.flat(2)
    }
    
    static feedTransaction(transaccion, percent){
        // tenemos que sacar las outputs normales, no las return ni las reward ni las feed
    }

    static cloneTransaction(transaccion, version, testnet){
        return Object.assign(new Transaction(version, testnet), transaccion)
    }


}

module.exports = Transaction


