
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

function generatePrimes(ir,dig) {
    var primes = [];
    var factor = Math.pow(10, dig - 1);
    var counter = 0;

    ir = ir*factor;

    while (trun != 0) {
        var trun = Math.floor(ir);

        if (isPrime(trun) === true) {
            primes[counter] = trun;
            counter++;
        }

        ir /= factor;
        var trun2 = Math.floor(ir);
        trun2 *= factor;
        ir *= factor;
        ir -= trun2;
        ir *= 10;
    }

    return primes;
}

function printPrimes() {
    var digits = document.getElementById("digits").value;

    var irrational = 0;
    var output = "";

    if (document.getElementById("sqrt2").checked) {
        irrational = Math.sqrt(2);
    }

    if (document.getElementById("pi").checked) {
        irrational = Math.PI;
    }

    if (document.getElementById("e").checked) {
        irrational = 2.718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595630738132328627943490763233829880753195251019011573834187930702154089149;
    }

    var primes = generatePrimes(irrational,digits);

    for (var i = 0; i < primes.length; i++) {
        output += primes[i];
        output += "\n";
    }

    document.getElementById("primes").innerText = output;

}

