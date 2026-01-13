const connectBtn = document.getElementById('connectBtn');
const statusEl = document.getElementById('status');
const addressEl = document.getElementById('address');
const networkEl = document.getElementById('network');
const balanceEl = document.getElementById('balance');
const studentNameEl = document.getElementById('studentName');
const studentNimEl = document.getElementById('studentNim');
const errorMessageEl = document.getElementById('errorMessage');

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = '0xa869';

// State
let currentAccount = null;
let isConnected = false;

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  console.log({ balance });
  return (balance / 1e18).toFixed(4);
}

function shortenAddress(address) {
  if (!address) return '-';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showError(message) {
  errorMessageEl.textContent = message;
  errorMessageEl.style.display = 'block';
  setTimeout(() => {
    errorMessageEl.style.display = 'none';
  }, 5000);
}

function hideError() {
  errorMessageEl.style.display = 'none';
}

async function updateBalance(address) {
  try {
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    balanceEl.textContent = formatAvaxBalance(balanceWei);
  } catch (error) {
    console.error('Error fetching balance:', error);
    balanceEl.textContent = '-';
  }
}

async function checkNetwork() {
  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    console.log({ chainId });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = '✅ Avalanche Fuji Testnet';
      networkEl.style.color = '#4cd137';
      statusEl.textContent = 'Connected ✅';
      statusEl.style.color = '#4cd137';
      return true;
    } else {
      networkEl.textContent = '❌ Wrong Network';
      networkEl.style.color = '#e84142';
      statusEl.textContent = 'Wrong Network';
      statusEl.style.color = '#fbc531';
      balanceEl.textContent = '-';
      showError('Please switch to Avalanche Fuji Testnet');
      return false;
    }
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    showError('Core Wallet tidak terdeteksi. Silakan install Core Wallet.');
    return;
  }

  console.log('window.ethereum', window.ethereum);

  try {
    hideError();
    statusEl.textContent = 'Connecting...';
    statusEl.style.color = '#ffffff';

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const address = accounts[0];
    currentAccount = address;
    isConnected = true;

    // Display shortened address
    addressEl.textContent = shortenAddress(address);
    addressEl.title = address; // Show full address on hover

    console.log({ address });

    // Check network
    const isCorrectNetwork = await checkNetwork();

    if (isCorrectNetwork) {
      // Get AVAX balance
      await updateBalance(address);
    }

    // Disable button after successful connection
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connected';
    connectBtn.style.opacity = '0.6';
    connectBtn.style.cursor = 'not-allowed';
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Connection Failed ❌';
    statusEl.style.color = '#e84142';
    isConnected = false;

    if (error.code === 4001) {
      showError('Koneksi ditolak oleh user');
    } else {
      showError('Gagal connect ke wallet: ' + error.message);
    }
  }
}

// Event Listeners
connectBtn.addEventListener('click', connectWallet);

// Listen to account changes
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    console.log('Accounts changed:', accounts);

    if (accounts.length === 0) {
      // User disconnected wallet
      statusEl.textContent = 'Not Connected';
      statusEl.style.color = '#ffffff';
      addressEl.textContent = '-';
      addressEl.title = '';
      networkEl.textContent = '-';
      balanceEl.textContent = '-';
      currentAccount = null;
      isConnected = false;

      // Re-enable button
      connectBtn.disabled = false;
      connectBtn.textContent = 'Connect Wallet';
      connectBtn.style.opacity = '1';
      connectBtn.style.cursor = 'pointer';

      showError('Wallet disconnected');
    } else {
      // Account switched
      const newAccount = accounts[0];
      currentAccount = newAccount;
      addressEl.textContent = shortenAddress(newAccount);
      addressEl.title = newAccount;

      checkNetwork().then((isCorrect) => {
        if (isCorrect) {
          updateBalance(newAccount);
        }
      });

      showError('Account switched to ' + shortenAddress(newAccount));
    }
  });

  // Listen to network changes
  window.ethereum.on('chainChanged', (chainId) => {
    console.log('Chain changed:', chainId);

    // Reload page when chain changes (recommended by MetaMask)
    window.location.reload();
  });
}
