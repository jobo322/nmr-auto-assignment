export function baselineData(data, ranges){
    let spectra = Object.assign({}, data);
    let fromData = ranges.map(a => a.from).sort(function(a, b) {
    return a - b;
    });
    let toData = ranges.map(a => a.to).sort(function(a, b) {
    return a - b;
    });
    let baseline = {
        'x' : [],
        'y' : []
    }
    let indexData = []
    for(let i = 0; i < ranges.length; i++){
            let tmpIndexFrom = spectra.x.filter(a => a < fromData[i])
            tmpIndexFrom = spectra.x.indexOf(tmpIndexFrom[tmpIndexFrom.length-1])
            let tmpIndexTo = spectra.x.filter(a => a < toData[i])
            tmpIndexTo = spectra.x.indexOf(tmpIndexTo[tmpIndexTo.length-1])
                    indexData.push({
                'from': tmpIndexFrom,
                'to': tmpIndexTo
            })
        }

        for(let i = 0; i < (indexData.length + 1); i++){
        if(i === 0){
            let tmpBaselineX = spectra.x.slice(0, indexData[i].from)
            let tmpBaselineY = spectra.y.slice(0, indexData[i].from)
            baseline.x.push(tmpBaselineX)
            baseline.y.push(tmpBaselineY)
            
        }
        else if(i === indexData.length){
            let tmpBaselineX = spectra.x.slice(indexData[i - 1].to, spectra.x.length - 1)
            let tmpBaselineY = spectra.y.slice(indexData[i - 1].to, spectra.y.length - 1)
            baseline.x.push(tmpBaselineX)
            baseline.y.push(tmpBaselineY)
        }
        else if (i > 0 && i < indexData.length){
            let tmpBaselineX = spectra.x.slice(indexData[i - 1].to, indexData[i].from)
            let tmpBaselineY = spectra.y.slice(indexData[i - 1].to, indexData[i].from)
            baseline.x.push(tmpBaselineX)
            baseline.y.push(tmpBaselineY)
            
        }

    
    }

    let baselineData = {
        'x': [],
        'y': []
    }
    for (let i = 0; i < baseline.y.length; i++){
        let tmpDataX = Object.values(baseline.x[i])
        let tmpDataY = Object.values(baseline.y[i])
        baselineData.x = baselineData.x.concat(tmpDataX)
        baselineData.y = baselineData.y.concat(tmpDataY)

    }
    baselineData.x = Object.values(baselineData.x)
    baselineData.y = Object.values(baselineData.y)
    return baselineData
}
