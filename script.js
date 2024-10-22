document.addEventListener('DOMContentLoaded', () => {
    const predictButton = document.getElementById('predictButton');
    predictButton.addEventListener('click', calculate);
});

function calculate() {
    const n = parseInt(document.getElementById('paNumber').value);
    const hp = parseInt(document.getElementById('hp').value);
    const shooterPa = parseInt(document.getElementById('shooterPa').value);

    const p = 0.60; // base success rate (bare hands)
    let damages = 1.65; // base damage (bare hands)

    const eZ = calculateExpectedHits(n, p);
    const eD = Math.floor(eZ * damages);

    const neededAttempts = Math.ceil(hp / damages);
    const pZ_neededAttempts = calculateProbabilityOfKill(n, p, neededAttempts);

    displayResult(eZ, eD, pZ_neededAttempts);
}

function calculateExpectedHits(n, p) {
    return Math.floor(n * p);
}

function calculateProbabilityOfKill(n, p, neededAttempts) {
    let probability = 0;
    for (let k = neededAttempts; k <= n; k++) {
        probability += binomialProbability(n, k, p);
    }
    return probability;
}

function binomialProbability(n, k, p) {
    return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function combination(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function displayResult(eZ, eD, pZ_neededAttempts) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p>You can expect to succeed in ${eZ} hits and inflict ${eD} damage points on average!</p>
        <p>You have a ${(pZ_neededAttempts * 100).toFixed(2)}% chance of killing your target!</p>
    `;
}
