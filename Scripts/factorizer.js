function isPrime (x) {
    if (x === 0) {
        return false;
    }

    for (var i = 2; i < Math.sqrt(x); i++) {
        if(x%i === 0) {
            return false;
        }
    }
    return true;
}

function factorize(x) {
    if(isPrime(x)){
        return String(x) + "."
    }

    for(var i = 2; i < Math.sqrt(x); i++) {
        if(isPrime(i) === 1 && x%i === 0) {
            return String(i) + ", " + factorize(x/i)
        }
    }
    return "";
}

function printFactorization(input) {
    document.getElementById("prime-factors").innerText = String(factorize(Number(document.getElementById("digits").innerText)));
}