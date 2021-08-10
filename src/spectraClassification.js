import { groupAromaticRanges } from './groupAromaticRanges'
import { getAtomsInfo } from 'openchemlib-utils';
export function spectraClassification(molecule, ranges){

    let atomsInfo = getAtomsInfo(molecule) 
    let aromaticHydrogens = atomsInfo.filter(x => (x.isAromatic & x.allHydrogens > 0)).map(x => x.allHydrogens);
    if(aromaticHydrogens.length > 0){
    aromaticHydrogens = [aromaticHydrogens.reduce((a, b) => a + b, 0)];
    }
    let aliphaticHydrogens = atomsInfo.filter(x => (x.isAromatic === false & x.allHydrogens > 0 )).map(x => x.allHydrogens);
    let expectedIntegralValues = aromaticHydrogens.concat(aliphaticHydrogens);
    // in progress
    return expectedIntegralValues
}

