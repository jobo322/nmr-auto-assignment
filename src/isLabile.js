import {
    getShortestPaths,
    getGroupedDiastereotopicAtomIDs,
    getPathsInfo
  } from 'openchemlib-utils';
import { labileFilter } from './labileFilter';

export function isLabile(molecule){
    molecule.addImplicitHydrogens();
    molecule.addMissingChirality();
    let paths = getPathsInfo(molecule)
    let labileProton = false
    let heteroAtomsData = paths.filter(x => x.label != 'C' & x.label != 'H').filter(x => x.allHydrogens > 0)
    if (heteroAtomsData.length > 0) {
      labileProton = true
    }

  return labileProton
}
