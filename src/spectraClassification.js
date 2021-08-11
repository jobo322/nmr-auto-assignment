import { groupAromaticRanges } from './groupAromaticRanges'
import { getAtomsInfo } from 'openchemlib-utils';
import { getDiastereotopicAtomIDsAndH } from 'openchemlib-utils'
import { maxWidthSignalFinder } from './maxWidthSignalFinder'
import { rescale } from './rescale'
import { labileData} from './labileData'
export function spectraClassification(molecule, ranges){
    molecule.addImplicitHydrogens();
    let atomsInfo = getAtomsInfo(molecule);
    let nonLabileData = atomsInfo.filter(a => a.label === 'C' );
    let aromaticHydrogens = nonLabileData.filter(x => (x.isAromatic & x.allHydrogens > 0)).map(x => x.allHydrogens);
    if(aromaticHydrogens.length > 0){
    aromaticHydrogens = [aromaticHydrogens.reduce((a, b) => a + b, 0)];
    }
    let aliphaticHydrogens = nonLabileData.filter(x => (x.isAromatic === false & x.allHydrogens > 0 )).map(x => x.allHydrogens);
    let expectedIntegralValues = aromaticHydrogens.concat(aliphaticHydrogens);
    let nH =
    molecule.getMolecularFormula().formula.replace(/.*H([0-9]+).*/, '$1') * 1; 
    let labileProtonNumber = labileData(molecule).nbAllLabiles;
    let nonLabileProtonNumber = nH - labileProtonNumber; 
    let realIntegralValues = rescale(ranges, nonLabileProtonNumber).map( a => Math.round(a.integral))
    console.log('expectedIntegralValues', expectedIntegralValues) 
    console.log('realIntegralValues: ', realIntegralValues);
    return ranges
}

