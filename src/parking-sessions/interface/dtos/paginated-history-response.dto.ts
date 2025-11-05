import { ApiProperty } from '@nestjs/swagger';
import { HistoryResponseDto } from './history-response.dto';

class PaginationMetadata {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 8 })
  totalPages: number;
}

export class PaginatedHistoryResponseDto {
  @ApiProperty({ type: [HistoryResponseDto] })
  data: HistoryResponseDto[];

  @ApiProperty({ type: PaginationMetadata })
  pagination: PaginationMetadata;
}
