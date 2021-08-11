export function groupAromaticRanges(ranges){
    let aromaticRange = ranges.filter( x => (x.from > 6.0 & x.to < 8.0))
    return joinRanges(aromaticRange)
}
function joinRanges(ranges){
 
    let fromData = ranges.map(a => a.from).sort(function(a, b) {
        return a - b;
        });;
    let toData = ranges.map(a => a.to).sort(function(a, b) {
        return a - b;
        });
    let newRange = {
        from : fromData[0],
        to: toData[toData.length - 1],
        integral : ranges.map(a => a.integral).reduce((a, b) => a + b, 0),
        signal : ranges.map(a => a.signal)[0]
    } 
    return newRange
}