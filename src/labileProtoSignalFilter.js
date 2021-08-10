import { baselineData } from './baselineData';
import { standardDeviation } from'./standardDeviation'
import { xFindClosestIndex} from 'ml-spectra-processing'
import max from 'ml-array-max';

export function labileProtoSignalFilter(data, ranges){
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
    let maxwidth = max(widths);
    let maxWidthSignalData = peakList[widths.indexOf(maxwidth)];
    maxWidthSignalData.index = xFindClosestIndex(data.x, maxWidthSignalData.x)
    let leftData = data.y.slice(0, maxWidthSignalData.index + 1)
    let rightData = data.y.slice(maxWidthSignalData.index, data.y.length)
    let leftindex = undefined;
    let rightindex = undefined;

    for(let j = leftData.length - 1;  j > 0; j--){
        if(leftData[j]  < (baselineMean + baselineSD)){
            leftindex = j 
            j = 0
        }
        else if(leftData[j] > (maxWidthSignalData.intensity * 2)){
            let subLeftData = leftData.slice(j) 
            let minValue = subLeftData.reduce(function(a, b) {
            return Math.min(a, b);
            });
            leftindex = (leftData.length -1) - subLeftData.indexOf(minValue)
            j = 0
        }
    }
    for(let i = 0; i < rightData.length;  i++){
        if(rightData[i] < (baselineMean +  baselineSD)){
            rightindex = maxWidthSignalData.index + i
            i = rightData.length
        }
        else if(rightData[i] > (maxWidthSignalData.intensity * 2)){
            let subRightData = rightData.slice(0, i + 1) 
            let minValue = subRightData.reduce(function(a, b) {
            return Math.min(a, b);
            });
            rightindex =  maxWidthSignalData.index + subRightData.indexOf(minValue)
            i = rightData.length
            
        }
    }
    let labileSignalData = {
        'x' : data.x.slice(leftindex, rightindex + 1),
        'y' : data.y.slice(leftindex, rightindex + 1),
        'signal' :  maxWidthSignalData, 
    }
    labileSignalData.from = labileSignalData.x[0] 
    labileSignalData.to = labileSignalData.x[labileSignalData.x.length - 1]     
    return labileSignalData
}
