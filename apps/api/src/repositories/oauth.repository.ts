import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@repositories/base.repository';
import { AuthException } from '@exceptions/app/auth.exception';
import { OauthEntity } from '@entities/oauth.entity';

/**
 * Repository for managing OAuth data.
 */
@Injectable()
export class OauthRepository extends BaseRepository<OauthEntity> {
  constructor(private dataSource: DataSource) {
    super(OauthEntity, dataSource.createEntityManager());
  }

  /**
   * Stores a new OAuth user record.
   * @param user User ID
   * @returns Created OAuth entity
   */
  async store(user: number): Promise<OauthEntity> {
    try {
      const oauthUser: OauthEntity = this.create({
        user,
      });

      return await this.save(oauthUser);
    } catch (err) {
      AuthException.Unauthorized();
    }
  }

  /**
   * Verifies an OAuth token.
   * @param token OAuth token
   * @returns Found OAuth entity
   * @throws AuthException if token expired or invalid
   */
  async verifyToken(token: string): Promise<OauthEntity> {
    try {
      return await this.findOneOrFail({
        where: {
          token,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      AuthException.TokenExpired();
    }
  }
}
