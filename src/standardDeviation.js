export function standardDeviation(arrayData){
    let main = (arrayData.reduce(function(a, b){
        return a + b;
    }, 0))/arrayData.length
    let diffSquareData = arrayData.map(x => Math.pow(x-main,2))   
    let diffSum = diffSquareData.reduce(function(a, b){
        return a + b;
    }, 0)
    let standardDeviation = Math.pow((diffSum/arrayData.length), 0.5)
    return standardDeviation
}
