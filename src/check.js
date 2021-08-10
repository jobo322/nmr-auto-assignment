import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {fromJCAMP} from 'nmr-parser'
import OCL from 'openchemlib/minimal';
import { xyAutoRangesPicking } from 'nmr-processing';
import { labileProtoSignalFilter } from './labileProtoSignalFilter';
import { rangesFilter } from './rangesFilter'
import { labileData } from './labileData'
import { groupAromaticRanges } from './groupAromaticRanges'
import { getDiastereotopicAtomIDs } from 'openchemlib-utils'
import { getGroupedDiastereotopicAtomIDs } from 'openchemlib-utils'
import { getDiastereotopicAtomIDsAndH } from 'openchemlib-utils'
import { getAtomsInfo } from 'openchemlib-utils'

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
let atomsID = getDiastereotopicAtomIDs(molecule);
let groupAtomsIDs = getGroupedDiastereotopicAtomIDs(molecule);
let atomsIDsH = getDiastereotopicAtomIDsAndH(molecule);
let atomsInfo = getAtomsInfo(molecule) 
let aromaticHydrogens = atomsInfo.filter(x => (x.isAromatic & x.allHydrogens > 0)).map(x => x.allHydrogens);
if(aromaticHydrogens.length > 0){
  aromaticHydrogens = [aromaticHydrogens.reduce((a, b) => a + b, 0)];
}
let aliphaticHydrogens = atomsInfo.filter(x => (x.isAromatic === false & x.allHydrogens > 0 )).map(x => x.allHydrogens);
let expectedIntegralValues = aromaticHydrogens.concat(aliphaticHydrogens)
console.log('test: ', rangesFilter(experimentalSpectra, molecule, ranges));
