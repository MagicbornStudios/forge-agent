import * as migration_20260212_043323_initial_studio_schema from './20260212_043323_initial_studio_schema';

export const migrations = [
  {
    up: migration_20260212_043323_initial_studio_schema.up,
    down: migration_20260212_043323_initial_studio_schema.down,
    name: '20260212_043323_initial_studio_schema'
  },
];
