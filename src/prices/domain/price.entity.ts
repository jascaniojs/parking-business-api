import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Building } from '../../buildings/domain/building.entity';
import { VehicleType } from '../../parking-spaces/domain/vehicle-type.enum';

@Entity('prices')
@Index(['buildingId', 'vehicleType'])
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'building_id' })
  buildingId: number;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'rate_per_hour' })
  ratePerHour: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;


  static create(buildingId: number, vehicleType: VehicleType, ratePerHour: number): Price {
    if (!buildingId) {
      throw new Error('Building ID is required');
    }

    if (!Object.values(VehicleType).includes(vehicleType)) {
      throw new Error('Invalid vehicle type');
    }

    if (ratePerHour < 0) {
      throw new Error('Rate per hour must be non-negative');
    }

    const price = new Price();
    price.buildingId = buildingId;
    price.vehicleType = vehicleType;
    price.ratePerHour = ratePerHour;

    return price;
  }
}
