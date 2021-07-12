
//let molfile = DataObject.resurrect(sample.general.ocl.molfile);
//let experimentalData =  sample.spectra.nmr[0].spectrum;

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
// import {fromJcamp} from 
import OCL from 'openchemlib/minimal';
import { labileFilter } from './labileFilter';


let jcamp = readFileSync(join(__dirname,'../data/h1_9.jdx'), 'utf-8')
let molfile = readFileSync(join(__dirname,'../data/mol_9.mol'), 'utf-8')



console.log(labileFilter(jcamp, molfile))


