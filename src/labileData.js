import {
  getGroupedDiastereotopicAtomIDs,
  getShortestPaths,
} from 'openchemlib-utils';

export function labileData(molecule) {
  const diaIDs = getGroupedDiastereotopicAtomIDs(molecule);
  const connections = getShortestPaths(molecule, {
    toLabel: 'H',
    maxLength: 1,
  });

  let nbAllLabiles = 0;
  let nbDiffLabiles = 0;

  for (const diaID of diaIDs) {
    diaID.isLabile = isItLabile(diaID, molecule, connections);
    if (diaID.isLabile) {
      nbAllLabiles += diaID.atoms.length;
      nbDiffLabiles++;
    }
  }

  return {
    hasLabile: nbAllLabiles > 0,
    nbDiffLabiles,
    nbAllLabiles,
    diaIDs,
    connections,
  };
}

function isItLabile(diaId, molecule, connections) {
  if (diaId.atomLabel !== 'H') return false;

  let connectedTo = connections[diaId.atoms[0]];
  let path = connectedTo.find((p) => p && p.length > 1);
  let atomLabel = molecule.getAtomLabel(path[1]);

  switch (atomLabel) {
    case 'N':
    case 'O':
    case 'Cl':
    case 'S':
      return true;
    default:
      return false;
  }
}
