
const ChainUtil = require('./chainutil')


class Script{
    constructor(type = 'p2pkh'){
        this.script = []
        this.typeScript = type
        this.address
    }

    toString(){
        return `${this.typeScript}
                ${this.script}             `
    }

    scriptPubKey(recipient, senderAddress){
        this.clear()
        if(this.typeScript === 'p2pk'){
            this.script.push(recipient)
            this.script.push('OP_CHECK_SIGNATURE')                  
        } else if (this.typeScript === 'p2pkh'){
            this.script.push('OP_DUP')
            this.script.push('OP_TRIPLE_HASH256')
            this.script.push(ChainUtil.hash(ChainUtil.hash(ChainUtil.hash(recipient))))
            this.script.push('OP_EQUALVERIFY')
            this.script.push('OP_CHECK_SIGNATURE')
        } else {
            throw new Error('Unknown transaction type')
        }
        this.address = senderAddress
        return this      
    }

    scriptSig(wallet, dataHash){
        this.clear()
        if(this.typeScript === 'p2pk'){
        this.script.push(JSON.stringify(wallet.sign(dataHash)))                  
        } else if (this.typeScript === 'p2pkh'){
            this.script.push(JSON.stringify(wallet.sign(dataHash)))
            this.script.push(JSON.stringify(wallet.publicKey))
        } else {
            throw new Error('Unknown transaction type')
        } 
        this.address = wallet.publicKey
        return this      
    }

    coinbaseScriptSig(address){
        this.clear()
        this.address = address    //test this method
        this.script = []
        this.typeScript = 'p2pk'
        return this
    }

    clear(){
        if(this.script !== []){
            this.script = []
            return
        }
    }
}

module.exports = Script




