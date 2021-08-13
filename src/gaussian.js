export function gaussian(parameters, x) {
    let y = [];
    for (let i = 0; i < x.length; i++){
    y[i] = parameters[0] * (Math.exp(-1 *Math.pow(x[i] - parameters[1], 2) / (2 * Math.pow(parameters[2], 2) )))
        
    }
    return y
}