import * as migration_20261010_125555_initial from './20261010_125555_initial';
import * as migration_20261011_143408_add_localization from './20261011_143408_add_localization';
import * as migration_20261011_162444_add_media from './20261011_162444_add_media';
import * as migration_20261011_202600_add_users_api_key from './20261011_202600_add_users_api_key';
import * as migration_20261011_213000_articles_status_review_workflow from './20261011_213000_articles_status_review_workflow';
import * as migration_20261011_213500_articles_status_default from './20261011_213500_articles_status_default';
import * as migration_20261017_120000_add_ro_locale from './20261017_120000_add_ro_locale';
import * as migration_20261017_130000_add_ai_generated from './20261017_130000_add_ai_generated';
import * as migration_20261017_140000_add_original_language from './20261017_140000_add_original_language';

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
  {
    up: migration_20261011_213500_articles_status_default.up,
    down: migration_20261011_213500_articles_status_default.down,
    name: '20261011_213500_articles_status_default',
  },
  {
    up: migration_20261017_120000_add_ro_locale.up,
    down: migration_20261017_120000_add_ro_locale.down,
    name: '20261017_120000_add_ro_locale',
  },
  {
    up: migration_20261017_130000_add_ai_generated.up,
    down: migration_20261017_130000_add_ai_generated.down,
    name: '20261017_130000_add_ai_generated',
  },
  {
    up: migration_20261017_140000_add_original_language.up,
    down: migration_20261017_140000_add_original_language.down,
    name: '20261017_140000_add_original_language',
  },
];
