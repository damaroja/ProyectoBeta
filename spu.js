
const Stack = require('./stack');
const OPS_CODE = require('./opscode');


class SPU {
    constructor(bytecode){
        this.dataStack = new Stack();
        //this.processStack = new Stack();
        this.instructionPointer = 0;
        this.bytecode = bytecode;  // El bytecode 
        this.OPS_CODE = OPS_CODE
    }

    evaluate(z){
        // Comprueba que no este vacio el bytecode
        if (this.bytecode.length < 1){
            return false
        }
        var c = '', mark = false;
        while (this.instructionPointer < this.bytecode.length){
            var opcode = this.bytecode[this.instructionPointer];
            console.log('-------------------------------------------------------------------------------------------------------')
            console.log(`Runnig Opcode ${opcode}`)
            console.log('-------------------------------------------------------------------------------------------------------')
            this.instructionPointer++;            
            for (const code in this.OPS_CODE){
                if ((code === opcode) && (typeof(opcode) === 'string')){
                   if (opcode === 'OP_CHECK_SIGNATURE'){
                    this.OPS_CODE[opcode](this.dataStack, z)
                    mark = true
                    c = code
                   } else {
                    this.OPS_CODE[opcode](this.dataStack)
                    mark = true
                    c = code
                   }
                } 
            }
            if (mark){
                if ((c === opcode) && (typeof(opcode) === 'string')){
                    mark = false
                    c = ''
                }
            }
            else if ((Number.isInteger(opcode)) || (typeof(opcode) === 'string')){
                this.dataStack.push(opcode);
            } else {
                console.log(opcode)
                console.log('Error in runtime. No legal opcode or input')
                return false
            }
        }
    }

    viewStack(){
        var data = '--Stack--\n'
        this.dataStack.stack.forEach(item => {
            data += '--' + item
            data += '--\n'
        })
        console.log(data)
        return data    
    }

    topStack(){
        return this.dataStack.stack[0]
    }





                
}


module.exports = SPU;






