export function gausianfunction(x,parameters){
    let y = []
    for (let i = 0; i < x.length; i++){
        y[i] = (1 / (parameters[0] * Math.pow(2*Math.PI,0.5))) * (Math.exp((-0.5)*(Math.pow(x[i] - parameters[1], 2)) / Math.pow(parameters[0],2)))
    }
    return y
}