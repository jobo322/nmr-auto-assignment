export function rescale(ranges, nH){
    let cloneRanges = JSON.parse(JSON.stringify(ranges));
    let totalArea = (ranges.map(a => a.integral).reduce(function(a, b){
        return a + b;
    }, 0));
    for(let i = 0; i < ranges.length; i++){
        cloneRanges[i].integral *= nH / totalArea
    }
    return cloneRanges
}