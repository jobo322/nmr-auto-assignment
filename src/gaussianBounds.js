export function gaussianBounds(x,y){
    let max = y.reduce(function(a, b) {
    return Math.max(a, b);
    });
    let maxIndex = y.indexOf(max)
    let left = y.slice(0, maxIndex)
    let rigth = y.slice(maxIndex)
    let leftMin = y.reduce(function(a, b) {
    return Math.min(a, b);
    });
    let rigthMin = y.reduce(function(a, b) {
    return Math.min(a, b);
    });
    let leftMinIndex = y.indexOf(leftMin);
    let rigthMinIndex = y.indexOf(rigthMin);
    let middleHighLeftIndex = Math.floor((maxIndex - leftMinIndex) / 2)
    let middleHighRigthIndex = Math.floor(maxIndex + (rigthMinIndex - maxIndex) / 2)
    let widthMiddleHigh = Math.abs(x[middleHighLeftIndex] - x[middleHighRigthIndex])
    
    let guess = [x[maxIndex],widthMiddleHigh]
    let upperBound = []
    
    return {guess}
}