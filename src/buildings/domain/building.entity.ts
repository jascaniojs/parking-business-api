import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 140 })
  name: string;

  @Column({ type: 'varchar', length: 140 })
  address: string;

  @Column({ name: 'total_floors', type: 'integer' })
  totalFloors: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  static create(name: string, address: string, totalFloors: number): Building {
    if (!name || name.length === 0) {
      throw new Error('Building name is required');
    }

    if (!Number.isInteger(totalFloors) || totalFloors < 1) {
      throw new Error('Building must have at least 1 floor');
    }

    if (!address || address.length === 0) {
      throw new Error('Address is required');
    }

    const building = new Building();
    building.name = name;
    building.address = address;
    building.totalFloors = totalFloors;

    return building;
  }
}
