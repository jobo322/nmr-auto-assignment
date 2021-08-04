import { baselineData } from './baselineData';
import { standardDeviation } from'./standardDeviation'
export function labileProtoSignalFilter(data, ranges){
    let xData = new Uint8Array(data.x);
    let yData = new Uint8Array(data.y);
    let experimentalSpectra =  {
        'x' : xData,
        'y' : yData
    //     'x' : [].slice.call(data.x),
    //     'y' : [].slice.call(data.y)
    }
    let baseline = baselineData(data, ranges).y
    let baselineMean = (baseline.reduce(function(a, b){
        return a + b;
    }, 0))/ baseline.length
    let baselineSD = standardDeviation(baseline)
    let peakList = [];
    for (let i = 0; i < ranges.length; i++) {
      for (let j = 0; j < ranges[i].signal.length; j++) {
        peakList.push(...ranges[i].signal[j].peak);
      }
    }

    let widths = peakList.map((x) => x.width);
    // // // //change this reduce for ml-array-max
    let maxwidth = widths.reduce(function (a, b) {
      return Math.max(a, b);
    });
    let maxWithSignalData = peakList[widths.indexOf(maxwidth)];
    let leftData = experimentalSpectra.y.slice(0, maxWithSignalData.index + 1)
    let rightData = data.y.slice(maxWithSignalData.index, data.y.length)
    let leftindex = undefined;
    let rightindex = undefined;
    console.log(maxWithSignalData, 'maxWithSignalData')
    // return leftData
    for(let j = leftData.length - 1;  j > 0; j--){
        if(leftData[j]  < (baselineMean + baselineSD)){
            leftindex = j 
            j = 0
        }
        else if(leftData[j] > (maxWithSignalData.intensity * 2)){
            let subLeftData = leftData.slice(j) 
            let minValue = subLeftData.reduce(function(a, b) {
            return Math.min(a, b);
            });
            leftindex = (leftData.length -1) - subLeftData.indexOf(minValue)
            j = 0
        }
    }
    // console.log('leftindex: ', leftindex)
    for(let i = 0; i < rightData.length;  i++){
        if(rightData[i] < (baselineMean +  baselineSD)){
            rightindex = maxWithSignalData.index + i
            i = rightData.length
        }
        else if(rightData[i] > (maxWithSignalData.intensity * 2)){
            let subRightData = rightData.slice(0, i + 1) 
            let minValue = subRightData.reduce(function(a, b) {
            return Math.min(a, b);
            });
            rightindex =  maxWithSignalData.index + subRightData.indexOf(minValue)
            i = rightData.length
            
        }
    // console.log('rightindex: ', rightindex)    
    
    }
    let labileSignalData = {
        'x' : data.x.slice(leftindex, rightindex + 1),
        'y' : data.y.slice(leftindex, rightindex + 1)
    }
    return labileSignalData
    // return 'OK'
}
