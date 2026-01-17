import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('value')
  @ApiOperation({
    summary: 'Membaca nilai terbaru dari smart contract',
    description: 'Mengembalikan nilai terbaru yang tersimpan di SimpleStorage contract beserta metadata block number dan timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil membaca nilai dari contract',
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', example: '42' },
        blockNumber: { type: 'string', example: '12345678' },
        updatedAt: { type: 'string', example: '2026-01-17T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'RPC timeout atau network error',
  })
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  @Get('events')
  @ApiOperation({
    summary: 'Mengambil event ValueUpdated dari smart contract',
    description: 'Mengembalikan daftar event ValueUpdated dengan support pagination. Event diurutkan dari yang terbaru.',
  })
  @ApiQuery({
    name: 'fromBlock',
    required: false,
    type: String,
    description: 'Block number mulai (default: 0)',
    example: '0',
  })
  @ApiQuery({
    name: 'toBlock',
    required: false,
    type: String,
    description: 'Block number akhir (default: latest)',
    example: 'latest',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Jumlah event per halaman',
    example: '10',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: String,
    description: 'Offset untuk pagination',
    example: '0',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil event',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              blockNumber: { type: 'string', example: '12345678' },
              value: { type: 'string', example: '42' },
              txHash: { type: 'string', example: '0x...' },
              blockHash: { type: 'string', example: '0x...' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50 },
            limit: { type: 'number', example: 10 },
            offset: { type: 'number', example: 0 },
            hasMore: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'RPC timeout atau network error',
  })
  async getEvents(
    @Query('fromBlock') fromBlock?: string,
    @Query('toBlock') toBlock?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const fromBlockBigInt = fromBlock ? BigInt(fromBlock) : undefined;
    const toBlockBigInt = toBlock ? BigInt(toBlock) : undefined;
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    const offsetNumber = offset ? parseInt(offset, 10) : undefined;

    return this.blockchainService.getValueUpdatedEvents(
      fromBlockBigInt,
      toBlockBigInt,
      limitNumber,
      offsetNumber,
    );
  }
}
