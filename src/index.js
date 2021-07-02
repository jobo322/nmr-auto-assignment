import { readFileSync } from 'fs';
import { join } from 'path';

import {
  getShortestPaths,
  getGroupedDiastereotopicAtomIDs,
} from 'openchemlib-utils';
import OCL from 'openchemlib/minimal';
//read the json files in data folder, it contains the ranges before and after the labile proton filtering

let before = 
  readFileSync(join(__dirname, '../data/rangesBefore.JSON'), 'ascii');

// let after = JSON.parse(
//   readFileSync(join(__dirname, '../data/rangesAfter.JSON'), 'utf-8'),
// );
console.log(JSON.parse(before))


// for (let input of before) {
//     let { molfile, ranges } = input;
//     let molecule = OCL.Molecule.fromMolfile(molfile);

//     molecule.addImplicitHydrogens();
//     molecule.addMissingChirality();
//     checkIntegration(molecule, ranges);
//     break;
// }
// now, it is need to ensure the correct scalling of integration data in ranges with respect to all prontos and not labile protons respectively.
// it expect that each element in before and after has a molfile and ranges properties. Also the lenght of before and after are equal.

function checkIntegration(molecule, ranges) {
  
  let nH =
    molecule.getMolecularFormula().formula.replace(/.*H([0-9]+).*/, '$1') * 1;
    console.log('nH', nH)
  let nbNotLabileH = nH;
  if (ignoreLabiles) {
    const diaIDs = getGroupedDiastereotopicAtomIDs(molecule);
    const connections = getShortestPaths(molecule, {
      toLabel: 'H',
      maxLength: 1,
    });

    for (const diaID of diaIDs) {
      const isLabile = isItLabile(diaId, molecule, connections);
      if (isLabile) nbNotLabileH -= diaID.atoms.length;
    }
  }
  let sum = ranges.reduce((acum, range) => acum + range.integral, 0);
  console.log('suma ', sum)
  for (let i = 0; i < ranges.length; i++) {
    ranges[i].integral *= nH / nbNotLabileH;
  }
}

function isItLabile(diaId, molecule, connections) {
  if (diaId.atomLabel !== 'H') return false;

  let connectedTo = connections[diaId.atoms[0]];
  let path = connectedTo.find((p) => p && p.length > 1);
  let atomLabel = molecule.getAtomLabel(path[0]);

  switch (atomLabel) {
    case 'N':
    case 'O':
    case 'Cl':
      return true;
    default:
      return false;
  }
}
