import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParkingSpace } from '../../parking-spaces/domain/parking-space.entity';
import { VehicleType } from '../../parking-spaces/domain/vehicle-type.enum';

@Entity('parking_sessions')
export class ParkingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parking_space_id' })
  parkingSpaceId: number;

  @ManyToOne(() => ParkingSpace, { nullable: false })
  @JoinColumn({ name: 'parking_space_id' })
  parkingSpace: ParkingSpace;

  @Column({
    type: 'enum',
    enum: VehicleType,
    enumName: 'vehicle_type_enum',
  })
  vehicleType: VehicleType;

  @Column({ name: 'is_resident', default: false })
  isResident: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'rate_per_hour' })
  ratePerHour: number;

  @Column({ type: 'timestamp', name: 'check_in_at' })
  checkInAt: Date;

  @Column({ type: 'timestamp', name: 'check_out_at', nullable: true })
  checkOutAt: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'calculated_charge', nullable: true })
  calculatedCharge: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;


  isActive(): boolean {
    return this.checkOutAt === null;
  }

  checkOut(): void {
    if (!this.isActive()) {
      throw new Error('Cannot check out: session is not active');
    }

    this.checkOutAt = new Date();
    this.calculatedCharge = this.calculateCharge();
  }

  getDurationInHours(): number {
    const endTime = this.checkOutAt || new Date();
    const durationMs = endTime.getTime() - this.checkInAt.getTime();
    return durationMs / (1000 * 60 * 60); //(millisecons * minutes * hours)
  }

  calculateCharge(): number {
    if (this.isResident) {
      return 0;
    }

    const hours = this.getDurationInHours();
    const totalAmount = hours * this.ratePerHour;

    return Math.round(totalAmount * 100) / 100;
  }


  static create(
    parkingSpaceId: number,
    vehicleType: VehicleType,
    isResident: boolean,
    ratePerHour: number,
  ): ParkingSession {
    if (!parkingSpaceId) {
      throw new Error('Parking space ID is required');
    }

    if (!Object.values(VehicleType).includes(vehicleType)) {
      throw new Error('Invalid vehicle type');
    }

    if (ratePerHour < 0) {
      throw new Error('Rate per hour must be non-negative');
    }

    const session = new ParkingSession();
    session.parkingSpaceId = parkingSpaceId;
    session.vehicleType = vehicleType;
    session.isResident = isResident;
    session.ratePerHour = ratePerHour;
    session.checkInAt = new Date();
    session.checkOutAt = null;
    session.calculatedCharge = null;

    return session;
  }
}
