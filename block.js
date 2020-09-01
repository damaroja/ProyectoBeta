


const ChainUtil = require('./chainutil')
const { MerkleTree } = require('merkletreejs')
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { MINE_RATE } = require('./config')  // milisegundos de media para el proceso de minado
const Transaction = require('./transaction')

class Block{
    constructor(index, timestamp, lastHash, hash, transactions, nonce, difficulty, minerAddress){
        this.index = index
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;      
        this.transactions = transactions
        this.merkleTree = Block.merkleTree(transactions)
        this.merkleRoot = this.merkleTree.getRoot().toString('hex')
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.minerAddress = minerAddress
    }

    toString(){
        return `Block ---
            ----------------------------------------------------------------
            Index            :${this.index}                         BetaBlockchain v5.0
            ----------------------------------------------------------------
            Timestamp        :${this.timestamp}
            ----------------------------------------------------------------
            Last hash        :${this.lastHash}
            ----------------------------------------------------------------
            Hash             :${this.hash}
            ----------------------------------------------------------------
            MerkleRoot       :${this.merkleTree.getRoot().toString('hex')}
            ----------------------------------------------------------------
            Transactions     :${this.transactions.toString()}
            ----------------------------------------------------------------
            Nonce            :${this.nonce}
            ----------------------------------------------------------------
            Difficulty       :${this.difficulty}
            ----------------------------------------------------------------
            Miner Address    :${this.minerAddress}`
    }


    hash(){
        return ChainUtil.hash(JSON.stringify(this.toString()))
    }

    static genesis(){
        const index = 0
        const timestamp = '0'.repeat(13)
        const lastHash = '0'.repeat(64);     
        const nonce = 0
        const difficulty = 1
        const blockchainLength = 0
        const address = '043fe10914ab5d16f092dcb10c668f897f572c3be5fb7361cc8050ce5ab65da8eeeb51433aa9ba7741e5c3c1a134e4cea4df00dab3fe7fb253867b69224390efd6'
        const transaction = Transaction.coinbaseTransaction(address, blockchainLength)
        transaction.id = '00000000-0000-0000-0000-000000000000'
        const hash = Block.blockHash(index, timestamp, lastHash, transaction, nonce, difficulty)   
        return new this(index, timestamp, lastHash, hash, [transaction], nonce, difficulty, '0.0.0.0/24');
    }

    static blockHash(index, timestamp, lastHash, transactions, nonce, difficulty, ip){
        return ChainUtil.hash(`${index}${timestamp}${lastHash}${transactions}${nonce}${difficulty}${ip}`);
    } 

    static mineBlock(lastBlock, transactions){
        let hash, timestamp; 
        const lastHash = lastBlock.hash;
        const index = lastBlock.index + 1
        let difficulty = lastBlock.difficulty;
        let nonce = 0;
        const ip =  Block.httpGet('https://api.ipify.org')
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.blockHash(index, timestamp, lastHash, transactions, nonce, difficulty, ip); 
            //console.log(hash);
        } while(hash.substring(0, 0) !== '0'.repeat(0));
        //  } while(hash.substring(0, difficulty) !== '0'.repeat(difficulty)); 
        return new this(index, timestamp, lastHash, hash, transactions, nonce, difficulty, ip);
    }

    static adjustDifficulty(lastBlock, currentTime){
        let difficulty = lastBlock.difficulty;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty - 1 : difficulty + 1;
        return difficulty;
    }

    static merkleTree(transactions){
        const leaves = transactions.map(transaction => ChainUtil.hash(transaction))
        return new MerkleTree(leaves, ChainUtil.hash)
    }

    static httpGet(Url){
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", Url, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }
}


module.exports = Block;


