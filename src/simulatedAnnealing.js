export function simulatedAnnealing(options) {
    let iterationsOutputs = [];
    let steps = []
    let temperature = options.initialT
    let initE = options.objetiveFunction(options.guess)
    let oldE = initE;
    let newE = oldE;
    let best = options.guess //initial guess values
    let i = 0;
    let j = 0;
    let accept = 0;
    let totalevaluations = 0;
    let optimum;
    while ((temperature > options.minT) && j <= options.maxRejection && newE > options.minFunctionValue) {
        i += 1
        if (i >= options.maxRun || accept >= options.maxAccept) {
            temperature = options.alpha * temperature;
            totalevaluations += 1;
            j = 1;
            accept = 1;
        }
        // function evaluation at the new locations
        let newStep = []

        // options.guess.map((x,i) => x + getRandomNumber(options.lowerBound[i],options.upperBound[i]))
        // let inRange = true;
        // let indexOut = NaN;
        for (let index = 0; index < best.length; index++) {
            newStep[index] = best[index] + ((Math.random() * 2) - 1) * (options.lowerBound[index] - options.upperBound[index])
            if (newStep[index] < options.lowerBound[index] || newStep[index] > options.upperBound[index]) {
                index -= 1
            }
        }
        steps.push(newStep[0])
        newE = options.objetiveFunction(newStep)
        //Decide to accept the new solution
        let deltaE = newE - oldE
        //Accept if improved
        if (-deltaE > options.energyNorm) {
            best = newStep;
            oldE = newE;
            accept += 1;
            j = 0

        }
        if (deltaE <= options.energyNorm && Math.exp(-deltaE / (options.k * temperature)) > Math.random()) {
            best = newStep;
            oldE = newE;
            accept += 1;
        }
        else {
            j += 1
        }
        optimum = oldE
        // break
        iterationsOutputs.push(optimum)
    }
    return { optimum, best, iterationsOutputs, steps }
}