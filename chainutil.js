
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1')
const uuidv1 = require('uuidv1')



class ChainUtil{   
    static genKeyPair(){
        return ec.genKeyPair();
    }

    static id(){
        return uuidv1()
    }

    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, data){
        return ec.keyFromPublic(publicKey, 'hex').verify(data, signature);
    }
}


module.exports = ChainUtil;