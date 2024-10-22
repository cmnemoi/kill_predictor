document.addEventListener('DOMContentLoaded', () => {
    const predictButton = document.getElementById('predictButton');
    predictButton.addEventListener('click', calculate);
});

function calculate() {
    const n = parseInt(document.getElementById('paNumber').value);
    const hp = parseInt(document.getElementById('hp').value);
    const shooterPa = parseInt(document.getElementById('shooterPa').value);

    let p = setP(0.60); // success rate
    let baseDamages = setDamages(1.65); // base damage (bare hands), modified by skills

    const { damages, chargesUsed } = calculateWeaponDamage(baseDamages, n, shooterPa);

    const adjustedN = n - chargesUsed;
    const eZ = calculateExpectedHits(adjustedN, p);
    const eD = Math.floor(eZ * damages);

    const neededAttempts = Math.ceil(hp / damages);
    const pZ_neededAttempts = calculateProbabilityOfKill(adjustedN, p, neededAttempts);

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

function getP(m, a) {
    // an is the probability of succeeding the n-th hit, taking into account previous failures/successes
    // an is defined by the sequence an+1 = an(m + a - m * an), according to probability rules (probability tree)
    // m: multiplier of the probability of success of a hit following a failure (25%, 30% if persistent)
    // a: probability of succeeding a hit if the previous one was successful (60% base, 72% expert, etc.)

    let an = a;
    for (let i = 0; i <= 1000; i++) {
        an = an * (m + a - m * an);
    }
    // We calculate the limit of an to determine the probability of succeeding a hit when the number of hits is large
    // (concretely, an converges around the 8/9th hit for a = 0.60)

    return an;
}

function setP(p) {
    // if skills giving a bonus/malus to success are chosen, we modify the success rate
    if (document.getElementById('expert').checked) {
        p *= 1.20; // +20% success
        p = getP(1.25, p); // getP returns the success of the skill taking into account the increase following failures
    }
    if (document.getElementById('elusive').checked) {
        p *= 0.75; // -25% success
        p = getP(1.25, p);
    }

    if (document.getElementById('creative').checked) {
        p = 2 * p / (1 + p); // creative increases the success rate of a repeated action until no more PA is recovered
        p = getP(1.25, p);
    }
    if (document.getElementById('persistent').checked) {
        p = getP(1.30, p); // persistent increases the success of a failed action by 30% instead of 25
    }

    p = getP(1.25, p);
    return p;
}

function setDamages(damages) {
    // Combat skills and weapons: we modify the possible damages
    if (document.getElementById('solid').checked) {
        damages = 2.65;
    } else if (document.getElementById('wrestler').checked) {
        damages = 3.65;
    } else if (document.getElementById('knife').checked) {
        damages = 2.25;
    }

    if (document.getElementById('armor').checked) {
        damages -= 1;
    }
    if (document.getElementById('roughneck').checked) {
        damages -= 1;
    }
    if (document.getElementById('berserker').checked) {
        damages -= 1;
    }

    return damages;
}

function calculateWeaponDamage(baseDamage, n, shooterPa) {
    let damages = baseDamage;
    let chargesUsed = 0;

    if (document.getElementById('blaster').checked) {
        const blasterCharges = parseInt(document.getElementById('blasterCharges').value);
        chargesUsed += blasterCharges;
        const result = Math.min(shooterPa, blasterCharges);
        damages = damages * (n + result - blasterCharges) / (n + result) + 2.7 * blasterCharges / (n + result);
    }

    if (document.getElementById('lizaroJungle').checked) {
        const lizaroCharges = parseInt(document.getElementById('lizaroCharges').value);
        chargesUsed += lizaroCharges;
        const var2 = Math.min(shooterPa, lizaroCharges);
        damages = damages * (n + var2 - lizaroCharges) / (n + var2) + 3.65 * lizaroCharges / (n + var2);
    }

    if (document.getElementById('grenadesNumber').value > 0) {
        const grenades = parseInt(document.getElementById('grenadesNumber').value);
        chargesUsed += grenades;
        damages = damages * (n - grenades) / n + 5 * grenades / n;
    }

    if (document.getElementById('natamy').checked) {
        const natamyCharges = parseInt(document.getElementById('natamyCharges').value);
        chargesUsed += natamyCharges;
        const var2 = Math.min(shooterPa, natamyCharges);
        const mushDamage = document.getElementById('mush').checked ? 8 : 2.65;
        damages = damages * (n + var2 - natamyCharges) / (n + var2) + mushDamage * natamyCharges / (n + var2);
    }

    if (document.getElementById('rocketLauncher').checked) {
        const rocketLauncherCharges = parseInt(document.getElementById('rocketLauncherCharges').value);
        chargesUsed += rocketLauncherCharges;
        const var2 = Math.min(shooterPa, rocketLauncherCharges);
        damages = damages * (n + var2 - rocketLauncherCharges) / (n + var2) + 4.5 * rocketLauncherCharges / (n + var2);
    }

    if (document.getElementById('machineGun').checked) {
        const machineGunCharges = parseInt(document.getElementById('machineGunCharges').value);
        chargesUsed += machineGunCharges;
        const result = Math.min(shooterPa, machineGunCharges);
        damages = damages * (n + result - machineGunCharges) / (n + result) + 2.7 * machineGunCharges / (n + result);
    }

    return { damages, chargesUsed };
}
