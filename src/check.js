
//let molfile = DataObject.resurrect(sample.general.ocl.molfile);
//let experimentalData =  sample.spectra.nmr[0].spectrum;

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {fromJCAMP} from 'nmr-parser'
import { gsd } from 'ml-gsd';
import OCL from 'openchemlib/minimal';
import { labileFilter } from './labileFilter';


let jcamp = readFileSync(join(__dirname,'../data/h1_15.jdx'), 'utf-8')
let molfile = readFileSync(join(__dirname,'../data/mol_15.mol'), 'utf-8')
let experimentalData = fromJCAMP(jcamp)
let experimentalSpectra = {
    'x' : experimentalData[0].dependentVariables[0].components[0].data.x,
    'y' : experimentalData[0].dependentVariables[0].components[0].data.y
}
if (experimentalSpectra.x[0] > 1) {
    experimentalSpectra.x.reverse();
    experimentalSpectra.y.reverse();
  }

let peaksOptions = {
    thresholdFactor: 1,
    minMaxRatio: 0.01,
    broadRatio: 0.00025,
    smoothY: true,
    widthFactor: 4,
    realTop: true,
    functionName: 'lorentzian',
    broadWidth: 0.25,
    sgOptions: { windowSize: 9, polynomial: 3 }
  }

  let peaks = gsd(experimentalSpectra, peaksOptions)
console.log('test: ', labileFilter(experimentalSpectra, molfile, peaks))


