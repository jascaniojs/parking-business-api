import { ApiProperty } from '@nestjs/swagger';
import { ParkingSession } from '../../domain/parking-session.entity';

export class HistoryResponseDto {
  @ApiProperty({ example: 45 })
  parkingSpaceId: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  checkedInAt: Date;

  @ApiProperty({ example: '2024-01-15T13:00:00Z' })
  checkedOutAt: Date;

  @ApiProperty({ example: '02h 30m' })
  sessionLength: string;

  @ApiProperty({ example: 5.0 })
  ratePerHour: number;

  @ApiProperty({ example: 12.5 })
  totalCharge: number;

  static fromEntity(session: ParkingSession): HistoryResponseDto {
    if (!session.checkOutAt) {
      throw new Error('Cannot create history response from active session');
    }

    const dto = new HistoryResponseDto();
    dto.parkingSpaceId = session.parkingSpaceId;
    dto.checkedInAt = session.checkInAt;
    dto.checkedOutAt = session.checkOutAt;
    dto.sessionLength = this.formatSessionLength(session.getDurationInHours());
    dto.ratePerHour = Number(session.ratePerHour);
    dto.totalCharge = Number(session.calculatedCharge);

    return dto;
  }

  private static formatSessionLength(hours: number): string {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    const hoursStr = h.toString().padStart(2, '0');
    const minutesStr = m.toString().padStart(2, '0');

    return `${hoursStr}h ${minutesStr}m`;
  }
}
