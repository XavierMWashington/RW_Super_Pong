
const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9'];

function makeID(codeLength){
    const randArray = new Array(codeLength);
    for(i = 0; i < codeLength; i++){
        randomNum = Math.floor(Math.random() * alphabet.length);
        randArray[i] = alphabet[randomNum].toUpperCase();
    }

    return randArray;
}

module.exports = {
    makeID
}