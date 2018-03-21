
function isPrime (x) {
    for (var i = 2; i < Math.sqrt(x); i++) {
        if(x%i === 0) {
            return false;
        }
    }
    return true;
}

function generatePrimes(ir,dig) {
    var factor = Math.pow(10, dig - 1);

    ir = ir*factor;

    for (var i = 0; i < 20; i++) {
        var trun = Math.floor(ir);

        if (isPrime(trun) === true) {
            return trun;
        }

        ir /= factor;
        var trun2 = Math.floor(ir);
        trun2 *= factor;
        ir *= factor;
        ir -= trun2;
        ir *= 10;
    }
}

var prime = generatePrimes();

function printPrimes() {
    var digits = document.getElementById("digits").value;
    var irrational = 0;


    if (document.getElementById("sqrt2").checked) {
        irrational = Math.sqrt(2);
    }

    if (document.getElementById("pi").checked) {
        irrational = Math.PI;
    }

    if (document.getElementById("e").checked) {
        irrational = Math.E;
    }

    var p = generatePrimes(irrational,digits);
    document.getElementById("primes").innerText = p.toString();
}

