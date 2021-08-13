import {standardDeviation} from './standardDeviation'
export function initialDataGenerator(x,y){
    let subXMax =  x.reduce(function(a, b) {
    return Math.max(a, b);
    });
    let subXMin =  x.reduce(function(a, b) {
    return Math.min(a, b);
    });
    let subYMax =  y.reduce(function(a, b) {
    return Math.max(a, b);
    });
    let xSD = standardDeviation(x);
    let ySD = standardDeviation(y);
    let indexOfMax = y.indexOf(subYMax)
    let guess = [subYMax, x[indexOfMax], (subXMax - subXMin) / 3];
    let lowerBound = [subYMax - 2 * ySD,  x[indexOfMax] - 3 * xSD, (subXMax - subXMin) / 200];
    let upperBound = [subYMax + 2 * ySD,   x[indexOfMax] + 3 * xSD, (subXMax - subXMin)]
    return {guess, lowerBound, upperBound}
} 