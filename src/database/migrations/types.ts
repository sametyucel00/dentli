export type DatabaseMigration = {
  version: number;
  name: string;
  up: string[];
};
