import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {fromJCAMP} from 'nmr-parser'
import OCL from 'openchemlib/minimal';
import { xyAutoRangesPicking } from 'nmr-processing';
import { labileProtoSignalFilter } from './labileProtoSignalFilter';
import { rangesFilter } from './rangesFilter'
import { labileData } from './labileData'

// import {xNoiseSanPlot} from 'ml-spectra-processing';

let jcamp = readFileSync(join(__dirname,'../data/h1_15.jdx'), 'utf-8')
let molfile = readFileSync(join(__dirname,'../data/mol_15.mol'), 'utf-8')

let molecule = OCL.Molecule.fromMolfile(molfile);
let experimentalData = fromJCAMP(jcamp)
// experimentalData.setMinMax(0, 1);
let experimentalSpectra = {
    'x' : experimentalData[0].dependentVariables[0].components[0].data.x,
    'y' : experimentalData[0].dependentVariables[0].components[0].data.y
}

if (experimentalSpectra.x[0] > experimentalSpectra.x[experimentalSpectra.x.length - 1]) {
    experimentalSpectra.x.reverse();
    experimentalSpectra.y.reverse();
  }
let nH =
    molecule.getMolecularFormula().formula.replace(/.*H([0-9]+).*/, '$1') * 1;

let rangeOptions = {
    ranges: {
      nH: nH,
      realTop: false,
      thresholdFactor: 0.8,
      keepPeaks: true,
      optimize: true,
      integralType: 'sum',
      compile: true,
      frequencyCluster: 20,
    },
  };

  let ranges = xyAutoRangesPicking(experimentalSpectra, rangeOptions);
  console.log('ranges, ', ranges[0].signal[0])
// console.log('test: ', labileFilter(experimentalSpectra, molecule, ranges))
// console.log('test: ', labileProtoSignalFilter(experimentalSpectra, ranges))
// let test = labileProtoSignalFilter(experimentalSpectra, ranges);
console.log('information: ', rangesFilter(experimentalSpectra, molecule, ranges))




