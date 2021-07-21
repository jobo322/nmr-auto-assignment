import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {fromJCAMP} from 'nmr-parser'
import OCL from 'openchemlib/minimal';
import { xyAutoRangesPicking } from 'nmr-processing';
import { labileFilter } from './labileFilter';

let jcamp = readFileSync(join(__dirname,'../data/h1_15.jdx'), 'utf-8')
let molfile = readFileSync(join(__dirname,'../data/mol_15.mol'), 'utf-8')
let molecule = OCL.Molecule.fromMolfile(molfile);
let experimentalData = fromJCAMP(jcamp)
let experimentalSpectra = {
    'x' : experimentalData[0].dependentVariables[0].components[0].data.x,
    'y' : experimentalData[0].dependentVariables[0].components[0].data.y
}
if (experimentalSpectra.x[0] > 1) {
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
console.log('test: ', labileFilter(experimentalSpectra, molecule, ranges))


