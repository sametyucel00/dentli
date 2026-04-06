import { Profile } from '@/src/domain/models';
import { BaseRepository } from '@/src/repositories/base-repository';
import { databaseService } from '@/src/services/database-service';

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_language: Profile['preferredLanguage'];
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    preferredLanguage: row.preferred_language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ProfileRepository extends BaseRepository {
  async list() {
    const rows = await this.database.getAll<ProfileRow>(
      `SELECT * FROM profiles ORDER BY created_at ASC;`,
    );

    return rows.map(mapProfile);
  }

  async getById(id: string) {
    const row = await this.database.getFirst<ProfileRow>(
      `SELECT * FROM profiles WHERE id = ? LIMIT 1;`,
      [id],
    );

    return row ? mapProfile(row) : null;
  }

  async create(profile: Profile) {
    await this.database.run(
      `INSERT INTO profiles (id, first_name, last_name, preferred_language, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        profile.id,
        profile.firstName,
        profile.lastName,
        profile.preferredLanguage,
        profile.createdAt,
        profile.updatedAt,
      ],
    );
  }

  async deleteById(id: string) {
    await this.database.run(`DELETE FROM profiles WHERE id = ?;`, [id]);
  }

  async updatePreferredLanguage(id: string, preferredLanguage: Profile['preferredLanguage']) {
    await this.database.run(
      `UPDATE profiles SET preferred_language = ?, updated_at = datetime('now') WHERE id = ?;`,
      [preferredLanguage, id],
    );
  }
}

export const profileRepository = new ProfileRepository(databaseService);
