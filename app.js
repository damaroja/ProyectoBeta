



const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const Transaction = require('./transaction')
const Wallet = require('./wallet')
const Pool = require('./pool')
const Miner = require('./miner')





const HTTP_PORT = process.env.HTTP_PORT || 3000;


const app = express();
const bc = new Blockchain();
const pool = new Pool()

const wallet = Wallet.getWalletByPrivateKey('3e088f4740bf7c46545849a04cdd67c2d446f0cecb5fadd48f7061948c2fec40')

const miner = new Miner(pool, bc, wallet.publicKey)




app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.json(bc.chain);
})


app.get('/blocks', (req, res) => {
    res.json(bc.chain);
})


app.get('/pool', (req, res) => {
    res.json(pool.poolTransactions);
})


app.post('/newtransaction', (req, res) => {
    const amount = req.body.amount
    const type = req.body.type
    const recipient = req.body.recipient
    const transaction = Transaction.deployTransaction(wallet, recipient, amount, bc, type, pool)
    console.log('new transaction added \n' + transaction + '\n')
    console.log('broadcasted transaction...')
    res.redirect('/pool')
})



app.get('/publickey', (req, res) => {
    res.json({publicKey: wallet.publicKey});
})


app.get('/balance', (req, res) => {
    res.json(Transaction.calculateBalance(bc, wallet.publicKey));
})

app.post('/getbalance', (req, res) => {
    res.json(Transaction.calculateBalance(bc, req.body.address))
})



app.post('/mine', (req, res) => {
    const block = miner.mine()
    console.log(`New block added ${block}`)
    res.redirect('/blocks')
})



app.listen(HTTP_PORT, () => {
    console.log(`Listening HTTP request on port ${HTTP_PORT}`);
})





 




