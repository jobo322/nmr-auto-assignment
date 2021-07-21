import { labileData } from "../labileData";
import OCL from 'openchemlib/minimal';
import { getDiastereotopicAtomIDsAndH, getGroupedDiastereotopicAtomIDs } from "openchemlib-utils";

const smiles = 'C=1(C(=CC(=CC=1CS)CO)N)';
const smiles2 = 'NC(S)N';

describe('labile data function', () => {
    it('check a molecule with three different labiles', () => {
        let molecule = OCL.Molecule.fromSmiles(smiles);
        molecule.addImplicitHydrogens();
        molecule.addMissingChirality();
        let result = labileData(molecule);
        expect(result.nbAllLabiles).toStrictEqual(4);
        expect(result.nbDiffLabiles).toStrictEqual(3);
    });
    it('check a molecule with grouped labiles diaID', () => {
        let molecule = OCL.Molecule.fromSmiles(smiles2);
        molecule.addImplicitHydrogens();
        molecule.addMissingChirality();
        let result = labileData(molecule);
        expect(result.nbAllLabiles).toStrictEqual(5);
        expect(result.nbDiffLabiles).toStrictEqual(2);
    });
});
