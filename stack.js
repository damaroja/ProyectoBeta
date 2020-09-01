class Stack{
    constructor(){
        this.stack = []
    }

    push(element){
        try {
          this.stack.unshift(element);
            return this.stack  
        } catch (error){
            return 'the element could not be inserted into the stack. ERROR:  ' + error
        }
        
    }
    pop(){
        try {
            return this.stack.shift()  
          } catch (error){
                return 'the element could not be extract from the stack. ERROR:  ' + error
          }
    }


    size(){
        if ((this.stack.length === 'undefined') || (this.stack.length < 0)){
            throw new Error('stack size could not be extracted')
        }
        return this.stack.length
    }

    print(){
        try {
            console.log(this.stack)
          } catch (error){
              return 'stack could not be printed. Error: ' + error
          }
        
    }

    top(){
        if (this.stack.length < 0){
            throw new Error('unable to extract item from top of stack')
        }
        return this.stack[0]
    }

    clear(){
        try {
            this.stack = []
          } catch (error){
              return 'stack could not be clear. Error: ' + error
          }
    }

}

module.exports = Stack;




