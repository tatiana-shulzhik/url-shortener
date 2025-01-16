import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDevice1737061042859 implements MigrationInterface {
  name = 'CreateDevice1737061042859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceType" character varying(50), "deviceName" character varying(100), "os_name" character varying, "os_version" character varying, "ipAddress" character varying(45), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shortLinkId" uuid NOT NULL, CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "device" ADD CONSTRAINT "FK_13495ee4796d2863005b1a72de4" FOREIGN KEY ("shortLinkId") REFERENCES "short_link"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device" DROP CONSTRAINT "FK_13495ee4796d2863005b1a72de4"`,
    );
    await queryRunner.query(`DROP TABLE "device"`);
  }
}
