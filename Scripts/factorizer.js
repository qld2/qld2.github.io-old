function isPrime (x) {
    if (x === 0) {
        return false;
    }

    for (var i = 2; i <= Math.sqrt(x); i++) {
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

    for(var i = 2; i <= Math.sqrt(x); i++) {
        if(isPrime(i) === true && x%i === 0) {
            return String(i) + ", " + factorize(x/i)
        }
    }
    return "";
}

function printFactorization() {
    document.getElementById("prime-factors-header").innerText = "Prime Factors:";
    document.getElementById("prime-factors").innerText = String(factorize(Number(document.getElementById("digits").value)));
}