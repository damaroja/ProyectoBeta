

//   Genesis address private3 keys 
//************************************************** 
// <Key priv: 3e088f4740bf7c46545849a04cdd67c2d446f0cecb5fadd48f7061948c2fec40 pub: <EC Point x: 3fe10914ab5d16f092dcb10c668f897f572c3be5fb7361cc8050ce5ab65da8ee y: eb51433aa9ba7741e5c3c1a134e4cea4df00dab3fe7fb253867b69224390efd6> >

//************************************************** 

//  Other private keys
//   5f842dd33d597e56d2720fece4924f91200e6175dc666e031040c641f7b6dab3
//   449272b322eea28b60b3cb0cc859e70ef12ef1a9b5355f2cd652ee91e22324c2
//   only for testing purposes

const ChainUtil = require('./chainutil')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Wallet{
    constructor(wallet){
        this.balance = 0;
        this.keyPair = wallet || ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex')
    }

    toString(){
        return `Wallet - 
            PublicKey:${this.keyPair.getPublic().encode('hex')}
            balance  :${this.balance}`
    }

    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }


    static exportPrivateInMnemonic(privatekeyHex){
        let dict = []
        let setWords = ["sol","siéntate","dan","humano","divertido","sexo","vuelto","peligro","mesa","jimmy","siguiente","hablo","disculpa","decirme","joe","caja","negocios","misión","silencio","sale","llegado","estaría","regreso","media","estan","propio","charlie","oro","enseguida","linda","prometo","esposo","norte","hubo","juro","muerta","interesante","pensaba","busca","terminar","tendré","completamente","cita","siete","cumpleaños","abogado","alrededor","cerebro","porqué","llave","santo","hermoso","necesario","edificio","irnos","aun","tendremos","vayas","doy","trae","salió","ley","ahi","verdadero","pelea","banco","terrible","calma","cena","daré","gobierno","comprar","creen","sargento","destino","bob","existe","hacía","novio","sala","través","regalo","iglesia","decía","cualquiera","excelente","esperen","deseo","alma","diablo","deje","cuántos","espada","estábamos","carne","maravilloso","vidas","sucedió","oí","peligroso","dirección","libertad","jesús","ocurrió","veré","sueños","pudiera","detective","sorpresa","tuya","pies","club","terminado","infierno","creía","luna","salvar","carta","estés","cielos","teniente","encuentra","david","veamos","quise","escúchame","necesitan","ambos","decisión","roma","enemigo","hicimos","éi","dulce","pruebas","querías","abuelo","totalmente","mirando","vayan","carrera","vuelo","ante","bienvenido","harás","encontramos","encontrado","contacto","posición","saberlo","planeta","humanos","coronel","junto","diría","ésa","base","oír","suelo","pelear","ayudarte","pistola","frío","comandante","partes","llega","verás","sur","iremos","rato","mar","espacio","asesinato","ventana","prisa","tienda","cámara","puedas","según","broma","reunión","despierta","sacar","tí","segunda","papel","locura","departamento","horrible","enfermo","pregunto","cárcel","órdenes","intento","isla","salida","llamó","volveré","usa","gato","paul","hagan","dejes","duele","vengan","crimen","esperaba","causa","bar","seré","ocho","temprano","río","relación","drogas","luces","bromeando","ojalá","hablamos","trabaja","irse","libros","radio","mary","ray","bill","vienes","quedan","excepto","brazo","tome","rojo","conocido","universidad","investigación","batalla","reglas","cargo","hogar","ninguno","dieron","vuelva","sabías","respeto","estación","corte","paciente","encuentro","energía","dejado","baile","fbi","abuela","caliente","vieja","viendo","veremos","rayos","simple","bailar","papa","triste","zona","serás","guardia","canción","salud","escuchar","parar","mike","estarás","cenar","max","soldados","caballo","serán","estaremos","interesa","volar","principio","nivel","cálmate","conocer","finalmente","alegro","debajo","podrían","bosque","bonita","bolsa","pone","taxi","ocupado","amable","ryan","acaso","detente","imbécil","san","equivocado","viva","puso","obra","consejo","público","ayúdame","animales","azul","apuesto","prisión","mirar","inteligente","metros","fantástico","próximo","jugando","ojo","salga","vea","llaman","entrada","duda","cerveza","unidos","matado","princesa","perdí","entender","santa","quedar","miles","llamaré","compañero","pensado","espalda","dejé","bomba","alex","cartas","apenas","leer","hermanos","darme","papi","mantener","suyo","rico","verla","lee","bobby","sigues","toca","olvídalo","acción","hayas","dioses","mando","dejaré","llegue","formas","uh","henry","cierra","damas","puente","memoria","regresa","muévanse","parecía","vestido","llaves","tv","camión","acabar","robot","llevó","montón","estuviste","máquina","puertas","podamos","muere","trago","mayoría","reina","lleno","inglés","don","soldado","estrella","escuche","valor","pido","delante","código","héroe","fe","capaz","verme","beber","velocidad","darte","llevas","partido","estuviera","tony","lex","dia","opinión","irte","cocina","abrir","perros","tambien","sepa","pareces","escribir","golpe","tenia","alta","estados","tocar","vuelvo","habían","ganas","hacerte","dejo","volvió","ejemplo","robert"]
        const set = ['0','1','2','3','4','5','6','7','8','9','a','b','c', 'd', 'e', 'f']
        set.forEach(i => set.forEach(j => {
            let num = parseInt(String(i) + String(j), 16)
            dict.push({
                key: String(i) + String(j),
                value: setWords[num]
            })
            }))
        let mnemonics = []
        for (let i = 0; i < 64; i+=2){
            let index = privatekeyHex.slice(i, i+2)
            mnemonics.push(dict[String(parseInt(index, 16))].value)
        }
        return mnemonics
        }

    static recoverWalletByMnemonic(arrayMnemonic){
            if (arrayMnemonic.length !== 32){
                throw new Error('Mnemonics are not correct')
            }
            try {
                let dict = []
                let set = ['0','1','2','3','4','5','6','7','8','9','a','b','c', 'd', 'e', 'f']
                let setWords = ["sol","siéntate","dan","humano","divertido","sexo","vuelto","peligro","mesa","jimmy","siguiente","hablo","disculpa","decirme","joe","caja","negocios","misión","silencio","sale","llegado","estaría","regreso","media","estan","propio","charlie","oro","enseguida","linda","prometo","esposo","norte","hubo","juro","muerta","interesante","pensaba","busca","terminar","tendré","completamente","cita","siete","cumpleaños","abogado","alrededor","cerebro","porqué","llave","santo","hermoso","necesario","edificio","irnos","aun","tendremos","vayas","doy","trae","salió","ley","ahi","verdadero","pelea","banco","terrible","calma","cena","daré","gobierno","comprar","creen","sargento","destino","bob","existe","hacía","novio","sala","través","regalo","iglesia","decía","cualquiera","excelente","esperen","deseo","alma","diablo","deje","cuántos","espada","estábamos","carne","maravilloso","vidas","sucedió","oí","peligroso","dirección","libertad","jesús","ocurrió","veré","sueños","pudiera","detective","sorpresa","tuya","pies","club","terminado","infierno","creía","luna","salvar","carta","estés","cielos","teniente","encuentra","david","veamos","quise","escúchame","necesitan","ambos","decisión","roma","enemigo","hicimos","éi","dulce","pruebas","querías","abuelo","totalmente","mirando","vayan","carrera","vuelo","ante","bienvenido","harás","encontramos","encontrado","contacto","posición","saberlo","planeta","humanos","coronel","junto","diría","ésa","base","oír","suelo","pelear","ayudarte","pistola","frío","comandante","partes","llega","verás","sur","iremos","rato","mar","espacio","asesinato","ventana","prisa","tienda","cámara","puedas","según","broma","reunión","despierta","sacar","tí","segunda","papel","locura","departamento","horrible","enfermo","pregunto","cárcel","órdenes","intento","isla","salida","llamó","volveré","usa","gato","paul","hagan","dejes","duele","vengan","crimen","esperaba","causa","bar","seré","ocho","temprano","río","relación","drogas","luces","bromeando","ojalá","hablamos","trabaja","irse","libros","radio","mary","ray","bill","vienes","quedan","excepto","brazo","tome","rojo","conocido","universidad","investigación","batalla","reglas","cargo","hogar","ninguno","dieron","vuelva","sabías","respeto","estación","corte","paciente","encuentro","energía","dejado","baile","fbi","abuela","caliente","vieja","viendo","veremos","rayos","simple","bailar","papa","triste","zona","serás","guardia","canción","salud","escuchar","parar","mike","estarás","cenar","max","soldados","caballo","serán","estaremos","interesa","volar","principio","nivel","cálmate","conocer","finalmente","alegro","debajo","podrían","bosque","bonita","bolsa","pone","taxi","ocupado","amable","ryan","acaso","detente","imbécil","san","equivocado","viva","puso","obra","consejo","público","ayúdame","animales","azul","apuesto","prisión","mirar","inteligente","metros","fantástico","próximo","jugando","ojo","salga","vea","llaman","entrada","duda","cerveza","unidos","matado","princesa","perdí","entender","santa","quedar","miles","llamaré","compañero","pensado","espalda","dejé","bomba","alex","cartas","apenas","leer","hermanos","darme","papi","mantener","suyo","rico","verla","lee","bobby","sigues","toca","olvídalo","acción","hayas","dioses","mando","dejaré","llegue","formas","uh","henry","cierra","damas","puente","memoria","regresa","muévanse","parecía","vestido","llaves","tv","camión","acabar","robot","llevó","montón","estuviste","máquina","puertas","podamos","muere","trago","mayoría","reina","lleno","inglés","don","soldado","estrella","escuche","valor","pido","delante","código","héroe","fe","capaz","verme","beber","velocidad","darte","llevas","partido","estuviera","tony","lex","dia","opinión","irte","cocina","abrir","perros","tambien","sepa","pareces","escribir","golpe","tenia","alta","estados","tocar","vuelvo","habían","ganas","hacerte","dejo","volvió","ejemplo","robert"]
                set.forEach(i => set.forEach(j => {
                    let num = parseInt(String(i) + String(j), 16)
                    dict.push({
                        key: String(i) + String(j),
                        value: setWords[num]
                    })
                    }))
                const privateKeyInDecimal = []
                arrayMnemonic.forEach(word => {
                    try {
                        privateKeyInDecimal.push(Object.keys(dict).find(key => dict[key].value === String(word)))
                    } catch (error){
                        console.log('failed trying find word in dictionary')
                    }
                })
                let privateKey = []
                privateKeyInDecimal.forEach(number => {
                privateKey.push(Number(number).toString(16))
            })
                privateKey.forEach((number, index) => {
                    if (number.length < 2){
                        number = '0' + number
                        privateKey.splice(index, 1, number)
                    }
                })
                return privateKey.join('')
        } catch (error){
                console.log(`Error trying parsing mnemonics:
                             More information: ${error}`) 
            }
        } 
        
    static getWalletByPrivateKey(key){
        return new Wallet(ec.keyFromPrivate(key))

        // get private  getPrivate().encode('hex')
        // get public   getPublic().encode('hex')
    }
}


module.exports = Wallet;























