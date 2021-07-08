import OCL from 'openchemlib/minimal';
import { options } from 'superagent';

function labileRange(experimentalData, molfile) {
  let molecule = OCL.Molecule.fromMolfile(molfile);
  molecule.addImplicitHydrogens();
  let newMolfile = molecule.toMolfile();
  API.createData('newMolfile', newMolfile);
  // let prediction = await predictor.spinus(molfile, {group: true})
  let machineFrequency = experimentalData.observeFrequencyX();
  let spectraProperties = {
    frequency: machineFrequency, //MHz
    from: 0, //PPM
    to: 12, //PPM
    lineWidth: 1.0, //Hz
    nbPoints: 18 * 1024,
    maxClusterSize: 8,
    output: 'xy',
  };
  // let predictedData = SD.NMR.fromSignals(prediction, spectraProperties);
  // predictedData.setMinMax(0,1);
  // let predictedSpectra= {
  //         "x" : predictedData.getXData(),
  //         "y" : predictedData.getYData(),
  // };
  let conections = molecule.getAllPaths({ toLabel: 'H', maxLength: 1 });
  let labileProtonData = conections.filter((x) => x.fromLabel !== 'C');
  let heteroatomsList = labileProtonData.map((x) => x.fromLabel);
  heteroatomsList = [...new Set(heteroatomsList)];
  let labileProton = false;
  if (labileProtonData.length > 0) {
    labileProton = true;
  }
  let labileProtonType = [];
  let labileProtonNumber = 0;
  for (let i = 0; i < labileProtonData.length; i++) {
    labileProtonType[i] = labileProtonData[i].fromLabel + 'H';
    if (labileProtonData[i].toAtoms.length > 1) {
      labileProtonType[i] =
        labileProtonType[i] + labileProtonData[i].toAtoms.length;
    }
    labileProtonNumber =
      labileProtonNumber + labileProtonData[i].toAtoms.length;
  }
  experimentalData.setMinMax(0, 1);
  let experimentalSpectra = {
    x: experimentalData.getXData(),
    y: experimentalData.getYData(),
  };
  if (experimentalSpectra.x[0] > 1) {
    experimentalSpectra.x.reverse();
    experimentalSpectra.y.reverse();
  }
  let solvent = DataObject.resurrect(sample.spectra.nmr[0].solvent);
  let solventShift = experimentalData.getResidual(solvent)[0].shift;
  let filename = DataObject.resurrect(sample.filename);
  filename = filename.replace('h1', '');
  filename = filename.replace(/[^0-9]/g, '');

  //@todo: this options as default options
  // peaksOptions = Object.assign({}, defaultOptions, options);
  // const {
  //   thresholdFactor = 1,
  //   minMaxRatio = 0.01,
  //   broadRatio = 0.00025, 
  // } = options;
  let peaksOptions = {
    thresholdFactor: 1,
    minMaxRatio: 0.01,
    broadRatio: 0.00025,
    smoothY: true,
    widthFactor: 4,
    realTop: true,
    functionName: 'lorentzian',
    broadWidth: 0.25,
    sgOptions: { windowSize: 9, polynomial: 3 },
  };

  let peakListData = GSD.gsd(
    experimentalSpectra.x,
    experimentalSpectra.y,
    peaksOptions,
  );
  let widths = peakListData.map((x) => x.width);

  //change this reduce for ml-array-max
  let maxwidth = widths.reduce(function (a, b) {
    return Math.max(a, b);
  });

  //use ml-array-standard-deviation
  let widthSD = standardDeviation(widths);

  let maxWidthPeakData = peakListData[widths.indexOf(maxwidth)];
  let maxWidthPeak = {
    x: [maxWidthPeakData.x],
    y: [maxWidthPeakData.y],
  };

//   let peakList = {
//     x: peakListData.map((x) => x.x),
//     y: peakListData.map((x) => x.y),
//   };
  // API.createData('peakList', peakList)

  let nH = sample.general.ocl.nH;

  //@TODO: use nmr-processing for ranges picking
  let ranges = experimentalData.getRanges({
    nH: nH,
    realTop: false,
    thresholdFactor: 0.8,
    keepPeaks: true,
    optimize: true,
    integralType: 'sum',
    compile: true,
    frequencyCluster: 20,
  });

  // for(let i = 0; i < ranges.length; i++){
  //     totalArea = totalArea + integralValues[i]
  // }

  // for (let j = ranges.length - 1; j >= 0; j--) {
  //     ranges[j].integral *= nH / totalArea;
  // }
  // ranges.forEach((range, index)=> {
  //                 range.signalID = "1H_" + index;
  //             });

  experimentalSpectra.x = experimentalSpectra.x;
//   API.createData('experimentalSpectra', experimentalSpectra);
//   API.createData('maxWidthPeak', maxWidthPeak);
//   API.createData('molfile', molfile);
  let labileProtonRange = ranges.filter(
    (x) => x.from <= maxWidthPeak.x && x.to > maxWidthPeak.x,
  );
  if (labileProtonRange.length === 0) {
    labileProtonRange[0] = {
      info: {
        from: maxWidthPeakData.x - maxWidthPeakData.width,
        to: maxWidthPeakData.x + maxWidthPeakData.width,
      },
    };
  }
  let subXSpectra = experimentalSpectra.x.filter(
    (x) => x > labileProtonRange[0].from && x < labileProtonRange[0].to,
  );
  let subYspectra = experimentalSpectra.y.slice(
    experimentalSpectra.x.indexOf(subXSpectra[0]),
    experimentalSpectra.x.indexOf(subXSpectra[subXSpectra.length - 1]) + 1,
  );
  let subSpectra = {
    x: subXSpectra,
    y: subYspectra,
  };

//   API.createData('subSpectra', subSpectra);
// use ml-array-max instead of reduce
  let subYMax = subSpectra.y.reduce(function (a, b) {
    return Math.max(a, b);
  });
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
  //@TODO: import function
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

  // let subXMin =  x.reduce(function(a, b) {
  // return Math.min(a, b);
  // });
  //@TODO: import function
  let fitArray = [];
  for (let i = 0; i < 100; i++) {
    fitArray[i] = simulatedAnnealing(fitOptions);
  }
  let optimumArray = fitArray.map((x) => x.optimum);
//   API.createData('optimumArray', optimumArray);
  let optimumSD = standardDeviation(optimumArray);
//   console.log(optimumSD, 'optimumSD');
//@TODO: use ml-array-min
  let optimum = optimumArray.reduce(function (a, b) {
    return Math.min(a, b);
  });

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

//   API.createData('fitData', fitData);
  subXSpectra = experimentalSpectra.x.filter(
    (x) => x > labileProtonRange[0].from && x < labileProtonRange[0].to,
  );
  subYspectra = experimentalSpectra.y.slice(
    experimentalSpectra.x.indexOf(subXSpectra[0]),
    experimentalSpectra.x.indexOf(subXSpectra[subXSpectra.length - 1]) + 1,
  );
  subSpectra.x = subXSpectra;
  subSpectra.y = subYspectra;
  let realWidth = Math.abs(
    subXSpectra[subXSpectra.length - 1] - subXSpectra[0],
  );
  let bounds = {
    x: [subXSpectra[0], subXSpectra[subXSpectra.length - 1]],
    y: [0.5, 0.5],
  };
//   API.createData('bounds', bounds);
//   API.createData('subSpectra', subSpectra);
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

  let nonLabileProtonNUmber = nH - labileProtonNumber;

  // let labileProtonRange = ranges.filter( x => (x.from <= maxWidthPeak.x && x.to > maxWidthPeak.x))
  //ranges, 'before'
  // for(let i = 0; i < ranges.length; i++){

  // }
  ranges = ranges.filter((x) => x != labileProtonRange[0]);
  let integralValues = ranges.map((x) => x.integral);
  // let totalArea = 0;
  let totalArea = integralValues.reduce(function (a, b) {
    return a + b;
  }, 0);
  //ranges, 'after'
  for (let j = ranges.length - 1; j >= 0; j--) {
    ranges[j].integral *= nonLabileProtonNUmber / totalArea;
  }

//   let annotations = nmrGUI.annotations1D(ranges);

  return ranges;
}
