import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateShortLink1737055635182 implements MigrationInterface {
  name = 'CreateShortLink1737055635182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "short_link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalUrl" character varying NOT NULL, "shortUrl" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "clickCount" integer NOT NULL DEFAULT '0', "expiresAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_3d685cf77a96efcf7fc8eb8661d" UNIQUE ("shortUrl"), CONSTRAINT "PK_7908299b513d8842d9f473a2f49" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "short_link" ADD CONSTRAINT "FK_d8a05ce5e1108be10bbb0178f48" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "short_link" DROP CONSTRAINT "FK_d8a05ce5e1108be10bbb0178f48"`,
    );
    await queryRunner.query(`DROP TABLE "short_link"`);
  }
}
