




const Block = require('../block')
const Transaction = require('../transaction')


describe('Test Block Class', () => {
    it('Test Genesis method and blockHash method', () => {
        const block = Block.genesis()
        expect(block.index).toEqual(0)
        expect(block.timestamp).toEqual('0'.repeat(13))
        expect(block.lastHash).toEqual('0'.repeat(64))
        expect(block.nonce).toEqual(0)
        expect(block.difficulty).toEqual(1)
        const blockchainLength = 0      
        const address = '043fe10914ab5d16f092dcb10c668f897f572c3be5fb7361cc8050ce5ab65da8eeeb51433aa9ba7741e5c3c1a134e4cea4df00dab3fe7fb253867b69224390efd6'
        const transaction = Transaction.coinbaseTransaction(address, blockchainLength)
        transaction.id = '00000000-0000-0000-0000-000000000000'
        const hash = Block.blockHash(0, '0'.repeat(13), '0'.repeat(64), transaction, 0, 1)
        expect(block.hash).toEqual(hash)
        expect(block.transactions).toEqual([transaction])
    })
    it('Test mineBlock method', () => {
        const block = Block.genesis()
        const newBlock = Block.mineBlock(block, [])
        expect(newBlock.index).toEqual(1)
        expect(typeof newBlock.timestamp).toEqual('number')
        expect(newBlock.lastHash).toEqual(block.hash)
    })
    
})