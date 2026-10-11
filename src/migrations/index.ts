import * as migration_20261010_125555_initial from './20261010_125555_initial';
import * as migration_20261011_143408_add_localization from './20261011_143408_add_localization';
import * as migration_20261011_162444_add_media from './20261011_162444_add_media';

export const migrations = [
  {
    up: migration_20261010_125555_initial.up,
    down: migration_20261010_125555_initial.down,
    name: '20261010_125555_initial',
  },
  {
    up: migration_20261011_143408_add_localization.up,
    down: migration_20261011_143408_add_localization.down,
    name: '20261011_143408_add_localization',
  },
  {
    up: migration_20261011_162444_add_media.up,
    down: migration_20261011_162444_add_media.down,
    name: '20261011_162444_add_media',
  },
];
