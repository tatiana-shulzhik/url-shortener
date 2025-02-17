import { ShortLink } from '../../shortener/entities/short-link.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShortLink, { nullable: false, onDelete: 'CASCADE' })
  shortLink: ShortLink;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceName?: string;

  @Column({
    name: 'os_name',
    type: 'varchar',
    nullable: true,
  })
  osName?: string;

  @Column({
    name: 'os_version',
    type: 'varchar',
    nullable: true,
  })
  osVersion?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
