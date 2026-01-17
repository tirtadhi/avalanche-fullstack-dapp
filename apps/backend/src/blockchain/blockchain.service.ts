import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createPublicClient, http, PublicClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { SIMPLE_STORAGE_ABI } from './simple-storage.abi';

@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;

  constructor() {
    // Alternative RPC endpoints untuk fallback
    const rpcUrls = [
      process.env.RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
      'https://avalanche-fuji-c-chain-rpc.publicnode.com',
      'https://rpc.ankr.com/avalanche_fuji',
    ];
    
    // Gunakan RPC pertama sebagai default
    const rpcUrl = rpcUrls[0];
    
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http(rpcUrl, {
        timeout: 30_000, // 30 detik timeout (diperpanjang dari 10 detik)
        retryCount: 2, // Retry 2 kali jika gagal
      }),
    });

    // GANTI dengan address hasil deploy Day 2
    // Menggunakan address dari frontend sebagai default
    this.contractAddress = (process.env.CONTRACT_ADDRESS || '0xe0Da4557fd41761BB0437218576BAc9a47cDe61E') as `0x${string}`;
  }

  // 🔹 Read latest value
  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'getValue',
      });

      // Get current block number for metadata
      const blockNumber = await this.client.getBlockNumber();

      return {
        value: value.toString(),
        blockNumber: blockNumber.toString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events with pagination support
  async getValueUpdatedEvents(
    fromBlock?: bigint,
    toBlock?: bigint,
    limit?: number,
    offset?: number,
  ) {
    try {
      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [
            {
              name: 'newValue',
              type: 'uint256',
              indexed: false,
            },
          ],
        },
        fromBlock: fromBlock || 0n, // speaker demo (jelaskan ini anti-pattern)
        toBlock: toBlock || 'latest',
      });

      // Apply pagination
      const total = events.length;
      const startIndex = offset || 0;
      const endIndex = limit ? startIndex + limit : total;
      const paginatedEvents = events.slice(startIndex, endIndex);

      return {
        data: paginatedEvents.map((event) => ({
          blockNumber: event.blockNumber?.toString(),
          value: event.args.newValue?.toString(),
          txHash: event.transactionHash,
          blockHash: event.blockHash,
        })),
        pagination: {
          total,
          limit: limit || total,
          offset: startIndex,
          hasMore: endIndex < total,
        },
      };
    } catch (error: any) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: any): never {
    const message = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || '';

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      errorCode === 'TIMEOUT'
    ) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'RPC timeout. Silakan coba beberapa saat lagi.',
        error: 'Service Unavailable',
        details: 'RPC endpoint mungkin sedang sibuk atau lambat. Coba refresh halaman atau tunggu beberapa saat.',
      });
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Tidak dapat terhubung ke blockchain RPC.',
        error: 'Service Unavailable',
        details: 'Pastikan koneksi internet Anda stabil atau coba lagi nanti.',
      });
    }

    // Contract not found atau invalid address
    if (
      message.includes('execution reverted') ||
      message.includes('contract') ||
      message.includes('invalid address')
    ) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Kontrak tidak ditemukan atau address tidak valid.',
        error: 'Internal Server Error',
        details: 'Pastikan CONTRACT_ADDRESS di .env sudah benar.',
      });
    }

    // Generic error
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Terjadi kesalahan saat membaca data blockchain.',
      error: 'Internal Server Error',
      details: error?.message || 'Unknown error',
    });
  }
}
