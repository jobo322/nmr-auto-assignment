import max from 'ml-array-max';
export function maxWidthSignalFinder(ranges) {
    let peakList = [];
    for (let i = 0; i < ranges.length; i++) {
        for (let j = 0; j < ranges[i].signal.length; j++) {
          peakList.push(...ranges[i].signal[j].peak);
        }
      }
      let widths = peakList.map((x) => x.width);
      let maxwidth = max(widths);
      let maxWidthSignalData = peakList[widths.indexOf(maxwidth)];
      return maxWidthSignalData
}