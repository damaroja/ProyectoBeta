

const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');




function hash(data){
    return SHA256(JSON.stringify(data)).toString();
}



function verifySignature(publicKey, signature, data){
    return ec.keyFromPublic(publicKey, 'hex').verify(data, signature);
}

function isNumber(element){
    if (typeof(element) === 'number'){
        return true
    }
    return false
}

function isString(element){
    if (typeof(element) === 'string'){
        return true
    }
    return false
}

const OPS_CODE  = {
    'OP_ADD': function OP_ADD(dataStack){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop();
            const op2 = dataStack.pop();
            if (!(isString(op1) || (isNumber(op1)))){
                throw new Error('Data type not allowed')
            }
            if (!(isString(op2) || (isNumber(op2)))){
                throw new Error('Data type not allowed')
            }
            dataStack.push(op1 + op2); 
            return true 
        }
        return false 
    },
    'OP_SUBS': function OP_SUBS(dataStack){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop();
            const op2 = dataStack.pop();
            if (!(isNumber(op1))){
                throw new Error('Data type not allowed')
            }
            if (!(isNumber(op2))){
                throw new Error('Data type not allowed')
            }
            dataStack.push(op1 - op2); 
            return true 
        }
        return false
    },
    'OP_MUL': function OP_MUL(dataStack){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop();
            const op2 = dataStack.pop();
            if (!(isString(op2) || (isNumber(op2)))){
                throw new Error('Data type not allowed')
            }
            if (!(isNumber(op1))){
                throw new Error('Data type not allowed')
            }
            if (typeof(op2) === 'string'){
               dataStack.push(op2.repeat(op1)); 
               return true 
            } else {
                dataStack.push(op2 * op1);
                return true
            }           
        }
        return false
    },
    'OP_DIV': function OP_DIV(dataStack){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop();
            const op2 = dataStack.pop();
            if (!(isNumber(op1))){
                throw new Error('Data type not allowed')
            }
            if (!(isNumber(op2))){
                throw new Error('Data type not allowed')
            }
            dataStack.push(op1 / op2); 
            return true 
        }
        return false
    },
    'OP_PRINT_TOP': function OP_PRINT_TOP(dataStack){
        if (dataStack.size() >= 1){
            console.log('*'.repeat(12))
            console.log('|    ' + dataStack.top() + '    |')
            console.log('*'.repeat(12))
            console.log('|           |')
            return true
        } 
        return false
    },
    'OP_PRINT_2LEVELS': function OP_PRINT_2LEVELS(dataStack){
        if (dataStack.size() >= 1){
            console.log('*'.repeat(12))
            console.log('|    ' + dataStack.top() + '    |')
            console.log('*'.repeat(12))
            console.log('|    ' + dataStack.top() + '    |')
            return true
        } 
        return false
    },
    'OP_PRINT_STACK': function OP_PRINT_STACK(dataStack){
        for (let i = 0; i <= dataStack.size() -1; i++){
            console.log('*'.repeat(24))
            console.log('|    ' + dataStack.stack[i] + '    |')
        }
    },
    'OP_TRIPLE_HASH256': function OP_TRIPLE_HASH256(dataStack){
        if (dataStack.size() >= 1){
           const data = dataStack.pop()
           const dataHash = hash(hash(hash(data)))
           dataStack.push(dataHash);          
           return true 
        } else {
            return false
        }      
    },
    'OP_HASH256': function OP_HASH256(dataStack){
        if (dataStack.size() >= 1){
            const op = dataStack.pop()
            dataStack.push(hash(op));
            return true
        }
        return false
    },
    'OP_CHECK_SIGNATURE': function OP_CHECK_SIGNATURE(dataStack, z){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop()   // address
            const op2 =  JSON.parse(dataStack.pop()) // signature
            const check = verifySignature(op1, op2, z)
            if (check) {
                dataStack.push(0)
                return true
             }
        }
        dataStack.push(1)
        console.log('Invalid Signature!')
        return false
    },
    'OP_DUP': function OP_DUP(dataStack){
        if (dataStack.size() >=1){
            dataStack.push(dataStack.top())
            return true
        }
        return false
    },
    'OP_SWAP': function OP_SWAP(dataStack){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop()
            const op2 = dataStack.pop()
            dataStack.push(op1)
            dataStack.push(op2)
            return true
        }
        return false
    },
    'OP_EQUALVERIFY': function OP_EQUALVERIFY(dataStack){
        if (dataStack.size() >= 2){
            const op1 = dataStack.pop()
            const op2 = dataStack.pop()
            if (op1 === op2){
                return true
            } else {
                return false
            }
        }
        return false
    }

}

module.exports = OPS_CODE;
