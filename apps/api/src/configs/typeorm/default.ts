import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SeederOptions } from 'typeorm-extension';

@Injectable()
class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions & SeederOptions {
    const isTesting = this.configService.get<string>('mode') === 'test';
    const isDevelopment = this.configService.get<string>('mode') === 'develop';

    const autoMigrate = this.configService.get<boolean>('database.autoMigrate') === true;

    let defaultOptions: TypeOrmModuleOptions & SeederOptions = {
      type: this.configService.get<string>('database.type') as 'postgres',
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      username: this.configService.get<string>('database.username'),
      password: this.configService.get<string>('database.password'),
      database: this.configService.get<string>('database.name'),
      entities: [__dirname + '/../../entities/*.entity{.ts,.js}'],
      migrations: autoMigrate ? [__dirname + '/../../db/migrations/*{.ts,.js}'] : [],
      migrationsTableName: 'migrations',
      migrationsRun: autoMigrate,
      synchronize: false,
      dropSchema: this.configService.get<boolean>('database.dropSchema'),
      factories: ['src/db/seeds/factories/**/*{.ts,.js}'],
      logging: isDevelopment && this.configService.get<boolean>('database.debug'),

      ssl: this.configService.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
    };

    if (isTesting) {
      defaultOptions = {
        ...defaultOptions,
        database: this.configService.get<string>('database.name'),
        synchronize: true,
        dropSchema: true,
      };
    }

    return defaultOptions;
  }
}
export default TypeOrmConfigService;
