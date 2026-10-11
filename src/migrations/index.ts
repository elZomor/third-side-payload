import * as migration_20261010_125555_initial from './20261010_125555_initial';
import * as migration_20261011_143408_add_localization from './20261011_143408_add_localization';
import * as migration_20261011_162444_add_media from './20261011_162444_add_media';
import * as migration_20261011_202600_add_users_api_key from './20261011_202600_add_users_api_key';
import * as migration_20261011_213000_articles_status_review_workflow from './20261011_213000_articles_status_review_workflow';

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
  {
    up: migration_20261011_202600_add_users_api_key.up,
    down: migration_20261011_202600_add_users_api_key.down,
    name: '20261011_202600_add_users_api_key',
  },
  {
    up: migration_20261011_213000_articles_status_review_workflow.up,
    down: migration_20261011_213000_articles_status_review_workflow.down,
    name: '20261011_213000_articles_status_review_workflow',
  },
];
