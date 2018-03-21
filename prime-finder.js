var irrational = 3.1415298678246713834738927410924;
var digits = 3;
var factor = Math.pow(10, digits - 1);

//document.getElementById("output").addEventListener('click', printPrimes);
function isPrime (x) {
    for (var i = 2; i < Math.sqrt(x); i++) {
        if(x%i === 0) {
            return false;
        }
    }
    return true;
}

function generatePrimes() {
    irrational = irrational*factor;

    for (var i = 0; i < 20; i++) {
        var trun = Math.floor(irrational);

        if (isPrime(trun) === true) {
            return trun;
        }

        irrational /= factor;
        var trun2 = Math.floor(irrational);
        trun2 *= factor;
        irrational *= factor;
        irrational -= trun2;
        irrational *= 10;
    }
}
var prime = generatePrimes();

function printPrimes() {

    document.getElementById("primes").innerText = "5";
}

