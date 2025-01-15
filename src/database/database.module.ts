import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('TYPEORM_HOST'),
                port: configService.get<number>('TYPEORM_PORT'),
                username: configService.get('TYPEORM_USERNAME'),
                password: configService.get('TYPEORM_PASSWORD'),
                database: configService.get('TYPEORM_DATABASE'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                migrations: [__dirname, '/../src/migrations/*{.ts,.js}'],
                synchronize: false,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { }