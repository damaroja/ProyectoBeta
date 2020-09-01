



class TxIn{
    constructor(id, scriptSig, timestamp, rewardInput = false){
        this.timestamp = timestamp      
        this.id = id;  //reference to a prev output transaction
        this.scriptSig = scriptSig; 
        this.rewardInput = rewardInput 
    }

    toString(){
        return `Input ---
             Timestamp       :${this.timestamp}
             Index           :${this.id}
             ScriptSig       :${this.scriptSig.toString()}
             RewardInput     :${this.rewardInput}`
    }

    static addInputToTransaction(input, transaction){
            transaction.inputs.push(input)
            return input            
    }


    static totalInputs(blockchain){
        const inputs = blockchain.chain.map(block => block.transactions)
                                    .flat(1)
                                    .map(transaction => transaction.inputs)
                                    .flat(1)
        return inputs
    }


    static inputsOfAddress(blockchain, publicKey){
        let inputs = blockchain.chain.map(block => block.transactions)
                                .flat(1)
                                .map(transaction => transaction.inputs)
                                .flat(1)
                                .filter(input => {
                                    return (input.scriptSig.address === publicKey)
                                })
        let inputsNoReward = inputs.filter(input => input.rewardInput === false)
        return inputsNoReward  // Return an array of input objects
    }   // Return an array of input objects

}

module.exports = TxIn;