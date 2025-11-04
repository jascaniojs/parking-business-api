import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Building } from '../../buildings/domain/building.entity';
import { VehicleType } from './vehicle-type.enum';
import { ParkingSession } from '../../parking-sessions/domain/parking-session.entity';

@Entity('parking_spaces')
export class ParkingSpace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'building_id' })
  buildingId: number;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ type: 'integer' })
  floor: number;

  @Column({ type: 'integer' })
  number: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
    enumName: 'vehicle_type_enum',
    nullable: true,
  })
  allowedVehicleType: VehicleType | null;

  @Column({ name: 'is_for_residents', default: false })
  isForResidents: boolean;

  @Column({ name: 'current_session_id', nullable: true })
  currentSessionId: string | null;

  @OneToOne(() => ParkingSession, { nullable: true })
  @JoinColumn({ name: 'current_session_id' })
  currentSession: ParkingSession | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  isAvailable(): boolean {
    return this.currentSessionId === null;
  }

  occupy(sessionId: string): void {
    if (!this.isAvailable()) {
      throw new Error(`Parking space ${this.getSpaceCode()} is already occupied`);
    }
    this.currentSessionId = sessionId;
  }

  release(): void {
    this.currentSessionId = null;
  }
  getSpaceCode(): string {
    return `Floor ${this.floor} - Space ${this.number}`;
  }


  static create(
    buildingId: number,
    floor: number,
    number: number,
    allowedVehicleType: VehicleType | null,
    isForResidents: boolean = false,
  ): ParkingSpace {
    if (!buildingId) {
      throw new Error('Building ID is required');
    }

    if (!Number.isInteger(floor) || floor < 1) {
      throw new Error('Floor must be at least 1');
    }

    if (!Number.isInteger(number) || number < 1) {
      throw new Error('Space number must be at least 1');
    }

    if (allowedVehicleType !== null && !Object.values(VehicleType).includes(allowedVehicleType)) {
      throw new Error('Invalid vehicle type');
    }

    const space = new ParkingSpace();
    space.buildingId = buildingId;
    space.floor = floor;
    space.number = number;
    space.allowedVehicleType = allowedVehicleType;
    space.isForResidents = isForResidents;
    space.currentSessionId = null;

    return space;
  }
}
