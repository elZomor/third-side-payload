import * as migration_20261010_125555_initial from './20261010_125555_initial';

export const migrations = [
  {
    up: migration_20261010_125555_initial.up,
    down: migration_20261010_125555_initial.down,
    name: '20261010_125555_initial'
  },
];
