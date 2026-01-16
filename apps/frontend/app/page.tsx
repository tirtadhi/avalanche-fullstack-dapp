'use client';

import { useState, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

const CONTRACT_ADDRESS = '0xe0Da4557fd41761BB0437218576BAc9a47cDe61E';

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default function Page() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  const { data: balance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
    },
  });

  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    query: {
      enabled: isConnected,
    },
  });

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      setInputValue('');
    }
  }, [isConfirmed, refetch]);

  const handleSetValue = async () => {
    if (!inputValue || !isConnected) return;

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'setValue',
        args: [BigInt(inputValue)],
      });
    } catch (error) {
      console.error('Error writing contract:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#60a5fa',
            }}
          >
            ❄️
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              Avalanche dApp
            </h1>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#9ca3af',
                opacity: 0.8,
              }}
            >
              Day 3 – Frontend dengan Next.js + Reown
            </p>
          </div>
        </div>

        {/* Connect Wallet Button */}
        {!isConnected && (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '12px',
              margin: '16px 0',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#e84142',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: isConnecting ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isConnecting)
                e.currentTarget.style.backgroundColor = '#c23334';
            }}
            onMouseOut={(e) => {
              if (!isConnecting)
                e.currentTarget.style.backgroundColor = '#e84142';
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}

        {/* Wallet Status Section */}
        {isConnected && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '16px',
            }}
          >
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: '#ffffff' }}>Status:</strong>{' '}
              <span style={{ color: '#4cd137' }}>Connected ✅</span>
            </p>

            <p style={{ margin: '8px 0', color: '#ffffff' }}>
              <strong>Wallet Address:</strong>
            </p>
            <p
              style={{
                margin: '8px 0',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#e5e7eb',
              }}
            >
              {address}
            </p>

            {chain && (
              <p style={{ margin: '8px 0' }}>
                <strong style={{ color: '#ffffff' }}>Network:</strong>{' '}
                <span
                  style={{ color: chain.id === 43113 ? '#4cd137' : '#fbc531' }}
                >
                  {chain.name} {chain.id === 43113 ? '✅' : '⚠️'}
                </span>
              </p>
            )}

            {balance && (
              <p style={{ margin: '8px 0' }}>
                <strong style={{ color: '#ffffff' }}>Balance:</strong>{' '}
                <span style={{ color: '#ffffff' }}>
                  {parseFloat(balance.formatted).toFixed(4)} AVAX
                </span>
              </p>
            )}

            <button
              onClick={() => disconnect()}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #e84142',
                borderRadius: '6px',
                color: '#e84142',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e84142';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#e84142';
              }}
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Read Contract Section */}
        {isConnected && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '16px',
            }}
          >
            <p style={{ margin: '8px 0', color: '#ffffff' }}>
              <strong>Contract Value (Read):</strong>
            </p>
            {isReading ? (
              <p style={{ margin: '8px 0', color: '#ffffff' }}>Loading...</p>
            ) : value !== undefined ? (
              <p
                style={{
                  margin: '8px 0',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                }}
              >
                {value.toString()}
              </p>
            ) : (
              <p style={{ margin: '8px 0', color: '#9ca3af' }}>
                No value available
              </p>
            )}
            <button
              onClick={() => refetch()}
              disabled={isReading}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                cursor: isReading ? 'not-allowed' : 'pointer',
                opacity: isReading ? 0.5 : 1,
              }}
            >
              🔄 Refresh Value
            </button>
          </div>
        )}

        {/* Write Contract Section */}
        {isConnected && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '16px',
            }}
          >
            <p style={{ margin: '8px 0', color: '#ffffff' }}>
              <strong>Update Contract Value:</strong>
            </p>
            <input
              type="number"
              placeholder="New value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                margin: '8px 0',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleSetValue}
              disabled={isWriting || isConfirming || !inputValue}
              style={{
                width: '100%',
                padding: '12px',
                margin: '8px 0',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor:
                  isWriting || isConfirming || !inputValue
                    ? 'not-allowed'
                    : 'pointer',
                opacity: isWriting || isConfirming || !inputValue ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                if (!isWriting && !isConfirming && inputValue) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }
              }}
              onMouseOut={(e) => {
                if (!isWriting && !isConfirming && inputValue) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
            >
              {isWriting
                ? 'Confirm in wallet...'
                : isConfirming
                ? 'Confirming transaction...'
                : 'Set Value'}
            </button>

            {/* Transaction Status */}
            {hash && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p
                  style={{
                    margin: '4px 0',
                    fontSize: '12px',
                    color: '#9ca3af',
                  }}
                >
                  <strong>Transaction Hash:</strong>
                </p>
                <p
                  style={{
                    margin: '4px 0',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    color: '#93c5fd',
                  }}
                >
                  {hash}
                </p>
                {isConfirming && (
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      color: '#fbbf24',
                      fontSize: '13px',
                    }}
                  >
                    ⏳ Waiting for confirmation...
                  </p>
                )}
                {isConfirmed && (
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      color: '#4cd137',
                      fontSize: '13px',
                    }}
                  >
                    ✅ Transaction confirmed!
                  </p>
                )}
                {(txError || writeError) && (
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      color: '#e84142',
                      fontSize: '13px',
                    }}
                  >
                    ❌ Error:{' '}
                    {(txError || writeError)?.message || 'Transaction failed'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p
          style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          TIRTA ADHI SAMSARA - 221011402154 <br /> Smart contract = single
          source of truth.
        </p>
      </div>
    </div>
  );
}
