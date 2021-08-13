import { getErrorFunction } from './getErrorFunction';
import { initialDataGenerator } from './initialDataGenerator';
import { standardDeviation } from './standardDeviation';
import { gaussian } from './gaussian';
import { gaussianBounds } from './gaussianBounds';
import { simulatedAnnealing } from './simulatedAnnealing';
import { labileData } from './labileData';
import {xNoiseSanPlot} from 'ml-spectra-processing';
import {max} from 'ml-array-max';
import {min} from 'ml-array-min';

export function labileFilter(data, molecule, ranges) {
  molecule.addImplicitHydrogens();
  let labileProton = labileData(molecule).hasLabile;

  let noise = xNoiseSanPlot(data)
  console.log('noise: ', noise)

  let nH =
    molecule.getMolecularFormula().formula.replace(/.*H([0-9]+).*/, '$1') * 1;
  let labileProtonNumber = labileData(molecule).nbAllLabiles;

  let peakList = [];
  for (let i = 0; i < ranges.length; i++) {
    for (let j = 0; j < ranges[i].signal.length; j++) {
      peakList.push(...ranges[i].signal[j].peak);
    }
  }
  let widths = peakList.map((x) => x.width);
  let maxwidth = max(widths)
  let maxWidthPeakData = peakList[widths.indexOf(maxwidth)];
  let maxWidthPeak = {
    x: maxWidthPeakData.x,
    y: maxWidthPeakData.y,
  };

  let labileProtonRange = ranges.filter(
    (a) => a.from <= maxWidthPeak.x && a.to > maxWidthPeak.x,
  );

  if (labileProtonRange.length === 0) {
    labileProtonRange[0] = {
      info: {
        from: maxWidthPeakData.x - maxWidthPeakData.width,
        to: maxWidthPeakData.x + maxWidthPeakData.width,
      },
    };
  }

  let subXSpectra = data.x.filter(
    (x) => x > labileProtonRange[0].from && x < labileProtonRange[0].to,
  );
  let subYspectra = data.y.slice(
    data.x.indexOf(subXSpectra[0]),
    data.x.indexOf(subXSpectra[subXSpectra.length - 1]) + 1,
  );
  let subSpectra = {
    x: subXSpectra,
    y: subYspectra,
  };

  let subYMax = max(subSpectra.y);
  let initialParameters = initialDataGenerator(subSpectra.x, subSpectra.y);
  let boundsPlot = { data: [] };
  // @TODO use peak-shape-generator or spectrum-generator
  let lowerBoundData = gaussian(initialParameters.lowerBound, subSpectra.x);
  let upperBoundData = gaussian(initialParameters.upperBound, subSpectra.x);
  let guessData = gaussian(initialParameters.guess, subSpectra.x);
  let boundsData = [lowerBoundData, upperBoundData, guessData];
  for (let i = 0; i < boundsData.length; i++) {
    boundsPlot.data[i] = {
      x: subSpectra.x,
      y: boundsData[i],
      style: { lineColor: 'rgb(230,0,0)', lineWidth: 1, lineStyle: 1 },
    };
  }
  let errorFunction = getErrorFunction(gaussian, subSpectra);
  let fitOptions = {
    initialT: 1.0,
    objetiveFunction: errorFunction,
    minT: 1e-10,
    minFunctionValue: -1e10,
    maxRejection: 2500,
    maxRun: 2000,
    maxAccept: 15,
    k: 1,
    alpha: 0.95,
    energyNorm: 1e-8,
    guess: initialParameters.guess,
    lowerBound: initialParameters.lowerBound,
    upperBound: initialParameters.upperBound,
  };

  // @TODO: import function
  let fitArray = [];
  for (let i = 0; i < 100; i++) {
    fitArray[i] = simulatedAnnealing(fitOptions);
  }
  let optimumArray = fitArray.map((x) => x.optimum);
  let optimumSD = standardDeviation(optimumArray);

  let optimum = min(optimumArray);

  //@TODO: check if index exist
  let fit = fitArray[optimumArray.indexOf(optimum)];
  if (fit.optimum > 3) {
    labileProtonRange[0] = {
      info: {
        from: maxWidthPeakData.x - maxWidthPeakData.width,
        to: maxWidthPeakData.x + maxWidthPeakData.width,
      },
    };
  }
  let fitData = {
    x: subSpectra.x,
    y: gaussian(fit.best, subSpectra.x),
  };

  let realWidth = Math.abs(
    subXSpectra[subXSpectra.length - 1] - subXSpectra[0],
  );
  let bounds = {
    x: [subXSpectra[0], subXSpectra[subXSpectra.length - 1]],
    y: [0.5, 0.5],
  };

  let maxIntensity = subSpectra.y.reduce(function (a, b) {
    return Math.max(a, b);
  });
  //@TODO: check this function
  let boundsTest = gaussianBounds(subSpectra.x, subSpectra.y);
  let maxIntensityIndex = subSpectra.y.indexOf(maxIntensity);
  let subXMax = subSpectra.x.reduce(function (a, b) {
    return Math.max(a, b);
  });
  let subXMin = subSpectra.x.reduce(function (a, b) {
    return Math.min(a, b);
  });

  let nonLabileProtonNumber = nH - labileProtonNumber;
  let labileProtonTotalArea = 0;
  let nonLabileProtonTotalArea = 0;
  for (let i = 0; i < ranges.length; i++) {
    if (ranges[i] != labileProtonRange[0]) {
      ranges[i].labile = false;
      nonLabileProtonTotalArea += ranges[i].integral;
    } else {
      labileProtonTotalArea += ranges[i].integral;
      ranges[i].labile = true;
    }
  }
  for (let i = 0; i < ranges.length; i++) {
    if (ranges[i].labile) {
      ranges[i].integral *= labileProtonNumber / labileProtonTotalArea;
    } else {
      ranges[i].integral *= nonLabileProtonNumber / nonLabileProtonTotalArea;
    }
  }

  return ranges;
}
