import {
    getShortestPaths,
    getGroupedDiastereotopicAtomIDs,
    getPathsInfo
  } from 'openchemlib-utils';
import { labileFilter } from './labileFilter';

export function labileData(molecule){
    molecule.addImplicitHydrogens();
    molecule.addMissingChirality();
    let paths = getPathsInfo(molecule)
    let labileData = {
      labileProton: false,
      labileProtonNumber: 0 ,
      heteroatomsList : [null]
    }
    let heteroAtomsData = paths.filter(x => x.label != 'C' & x.label != 'H').filter(x => x.allHydrogens > 0)
    if (heteroAtomsData.length > 0) {
      labileData.labileProton = true;
      labileData.labileProtonNumber = (heteroAtomsData.map(x => x.allHydrogens).reduce(function(a, b){
        return a + b;
    }, 0)),
    labileData.heteroatomsList = heteroAtomsData.map(x => x.label);
    }
    
  return labileData
}
