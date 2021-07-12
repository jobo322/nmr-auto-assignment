import OCL from 'openchemlib/minimal';
import { gsd } from 'ml-gsd';
import {fromJcamp} from 'common-spectrum';
import { fromJCAMP } from 'nmr-parser'
import {xyAutoPeaksPicking} from 'nmr-processing'
import { getErrorFunction } from './getErrorFunction';
import { initialDataGenerator } from './initialDataGenerator';
import { gaussian } from './gaussian';
import { gaussianBounds } from './gaussianBounds';
import { simulatedAnnealing } from './simulatedAnnealing';
import {isLabile} from './isLabile';


export function labileFilter(jcamp, molfile, options = {}) {

  let peaksOptions = Object.assign({}, {
    thresholdFactor: 1,
    minMaxRatio: 0.01,
    broadRatio: 0.00025,
    smoothY: true,
    widthFactor: 4,
    realTop: true,
    functionName: 'lorentzian',
    broadWidth: 0.25,
    sgOptions: { windowSize: 9, polynomial: 3 },
  }, options);

  let molecule = OCL.Molecule.fromMolfile(molfile);
  molecule.addImplicitHydrogens();
  let experimentalData = fromJCAMP(jcamp);
  let machineFrequency = experimentalData[0].info. originFrequency;
  let spectraProperties = {
    frequency: machineFrequency, //MHz
    from: 0, //PPM
    to: 12, //PPM
    lineWidth: 1.0, //Hz
    nbPoints: 18 * 1024,
    maxClusterSize: 8,
    output: 'xy',
  };
  
  let labileProton = isLabile(molecule);
  let experimentalSpectraData = fromJcamp(jcamp)


  // experimentalData.setMinMax(0, 1);
  let experimentalSpectra = {
    x: experimentalSpectraData.spectra[0].variables.x.data,
    y: experimentalSpectraData.spectra[0].variables.y.data,
  };
  if (experimentalSpectra.x[0] > 1) {
    experimentalSpectra.x.reverse();
    experimentalSpectra.y.reverse();
  }

  // let solvent = DataObject.resurrect(sample.spectra.nmr[0].solvent);
  // let solventShift = experimentalData.getResidual(solvent)[0].shift;
  // let filename = DataObject.resurrect(sample.filename);
  // filename = filename.replace('h1', '');
  // filename = filename.replace(/[^0-9]/g, '');

  let peakListData = gsd(
    experimentalSpectra,
    peaksOptions
  );
  let widths = peakListData.map((x) => x.width);
    console.log('widths', widths)
  // // //change this reduce for ml-array-max
  let maxwidth = widths.reduce(function (a, b) {
    return Math.max(a, b);
  });
  console.log('maxwidth', maxwidth)
  let maxWidthPeakData = peakListData[widths.indexOf(maxwidth)];
  console.log('maxWidthPeakData', maxWidthPeakData)
  let maxWidthPeak = {
    x: maxWidthPeakData.x,
    y: maxWidthPeakData.y,
  };

  let nH =
  molecule.getMolecularFormula().formula.replace(/.*H([0-9]+).*/, '$1') * 1;


  // // //@TODO: use nmr-processing for ranges picking

  let ranges = xyAutoPeaksPicking(experimentalSpectra, peaksOptions)

  let labileProtonRange = ranges.filter(
    (a) => a.left.x <= maxWidthPeak.x && a.right.x > maxWidthPeak.x,
  );
  console.log('labileProtonRange', labileProtonRange)
  // if (labileProtonRange.length === 0) {
  //   labileProtonRange[0] = {
  //     info: {
  //       from: maxWidthPeakData.x - maxWidthPeakData.width,
  //       to: maxWidthPeakData.x + maxWidthPeakData.width,
  //     },
  //   };
  // }
  // let subXSpectra = experimentalSpectra.x.filter(
  //   (x) => x > labileProtonRange[0].from && x < labileProtonRange[0].to,
  // );
  // let subYspectra = experimentalSpectra.y.slice(
  //   experimentalSpectra.x.indexOf(subXSpectra[0]),
  //   experimentalSpectra.x.indexOf(subXSpectra[subXSpectra.length - 1]) + 1,
  // );
  // let subSpectra = {
  //   x: subXSpectra,
  //   y: subYspectra,
  // };

  // // // use ml-array-max instead of reduce
  // let subYMax = subSpectra.y.reduce(function (a, b) {
  //   return Math.max(a, b);
  // });
  // let initialParameters = initialDataGenerator(subSpectra.x, subSpectra.y);
  // let boundsPlot = { data: [] };
  // // @TODO use peak-shape-generator or spectrum-generator
  // let lowerBoundData = gaussian(initialParameters.lowerBound, subSpectra.x);
  // let upperBoundData = gaussian(initialParameters.upperBound, subSpectra.x);
  // let guessData = gaussian(initialParameters.guess, subSpectra.x);
  // let boundsData = [lowerBoundData, upperBoundData, guessData];
  // for (let i = 0; i < boundsData.length; i++) {
  //   boundsPlot.data[i] = {
  //     x: subSpectra.x,
  //     y: boundsData[i],
  //     style: { lineColor: 'rgb(230,0,0)', lineWidth: 1, lineStyle: 1 },
  //   };
  // }
  // //@TODO: import function
  // let errorFunction = getErrorFunction(gaussian, subSpectra);
  // let fitOptions = {
  //   initialT: 1.0,
  //   objetiveFunction: errorFunction,
  //   minT: 1e-10,
  //   minFunctionValue: -1e10,
  //   maxRejection: 2500,
  //   maxRun: 2000,
  //   maxAccept: 15,
  //   k: 1,
  //   alpha: 0.95,
  //   energyNorm: 1e-8,
  //   guess: initialParameters.guess,
  //   lowerBound: initialParameters.lowerBound,
  //   upperBound: initialParameters.upperBound,
  // };

  // // let subXMin =  x.reduce(function(a, b) {
  // // return Math.min(a, b);
  // // });
  // //@TODO: import function
  // let fitArray = [];
  // for (let i = 0; i < 100; i++) {
  //   fitArray[i] = simulatedAnnealing(fitOptions);
  // }
  // let optimumArray = fitArray.map((x) => x.optimum);
  // let optimumSD = standardDeviation(optimumArray);
  // //   console.log(optimumSD, 'optimumSD');
  // //@TODO: use ml-array-min
  // let optimum = optimumArray.reduce(function (a, b) {
  //   return Math.min(a, b);
  // });

  // //@TODO: check if index exist
  // let fit = fitArray[optimumArray.indexOf(optimum)];
  // if (fit.optimum > 3) {
  //   labileProtonRange[0] = {
  //     info: {
  //       from: maxWidthPeakData.x - maxWidthPeakData.width,
  //       to: maxWidthPeakData.x + maxWidthPeakData.width,
  //     },
  //   };
  // }
  // let fitData = {
  //   x: subSpectra.x,
  //   y: gaussian(fit.best, subSpectra.x),
  // };

  // subXSpectra = experimentalSpectra.x.filter(
  //   (x) => x > labileProtonRange[0].from && x < labileProtonRange[0].to,
  // );
  // subYspectra = experimentalSpectra.y.slice(
  //   experimentalSpectra.x.indexOf(subXSpectra[0]),
  //   experimentalSpectra.x.indexOf(subXSpectra[subXSpectra.length - 1]) + 1,
  // );
  // subSpectra.x = subXSpectra;
  // subSpectra.y = subYspectra;
  // let realWidth = Math.abs(
  //   subXSpectra[subXSpectra.length - 1] - subXSpectra[0],
  // );
  // let bounds = {
  //   x: [subXSpectra[0], subXSpectra[subXSpectra.length - 1]],
  //   y: [0.5, 0.5],
  // };

  // let maxIntensity = subSpectra.y.reduce(function (a, b) {
  //   return Math.max(a, b);
  // });
  // //@TODO: check this function 
  // let boundsTest = gaussianBounds(subSpectra.x, subSpectra.y);
  // let maxIntensityIndex = subSpectra.y.indexOf(maxIntensity);
  // let subXMax = subSpectra.x.reduce(function (a, b) {
  //   return Math.max(a, b);
  // });
  // let subXMin = subSpectra.x.reduce(function (a, b) {
  //   return Math.min(a, b);
  // });

  // let nonLabileProtonNUmber = nH - labileProtonNumber;

  // // let labileProtonRange = ranges.filter( x => (x.from <= maxWidthPeak.x && x.to > maxWidthPeak.x))
  // //ranges, 'before'
  // // for(let i = 0; i < ranges.length; i++){

  // // }
  // ranges = ranges.filter((x) => x != labileProtonRange[0]);
  // let integralValues = ranges.map((x) => x.integral);
  // // let totalArea = 0;
  // let totalArea = integralValues.reduce(function (a, b) {
  //   return a + b;
  // }, 0);
  // //ranges, 'after'
  // for (let j = ranges.length - 1; j >= 0; j--) {
  //   ranges[j].integral *= nonLabileProtonNUmber / totalArea;
  // }

  return 'OK';

}


