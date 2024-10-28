import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './abi/contract';
import Confetti from 'react-confetti';

function App() {
  const [txStatus, setTxStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [completeId, setCompleteId] = useState('');
  const [releasedAmount, setReleasedAmount] = useState(null);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const getProvider = async () => {
    const urls = [
      process.env.REACT_APP_RPC_URL,
      process.env.REACT_APP_BACKUP_RPC_URL,
      'https://polygon-amoy.blockpi.network/v1/rpc/public',
      'https://rpc-amoy.polygon.technology'
    ];

    for (const url of urls) {
      try {
        const provider = new ethers.JsonRpcProvider(url);
        await provider.getBlockNumber();
        console.log('Connected to RPC:', url);
        return provider;
      } catch (error) {
        console.warn(`Failed to connect to ${url}:`, error.message);
        continue;
      }
    }
    throw new Error('All RPC endpoints failed');
  };

  const clearAllData = () => {
    setTxStatus('');
    setTxHash('');
    setBookingId(null);
    setReleasedAmount(null);
    setCompleteId('');
  };

  const handleBookToken = async () => {
    try {
      setTxStatus('Initiating transaction...');
      setTxHash('');
      setBookingId(null);
      setReleasedAmount(null);
      
      const provider = await getProvider();
      const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

      setTxStatus('Sending transaction...');
      
      const tx = await contract.bookToken(
        "0x8Cb342cE3d66b5450FE43734cd361702Aa506DD9",
        "0x8Cb342cE3d66b5450FE43734cd361702Aa506DD9",
        "1000"
      );

      setTxStatus('Transaction sent! Waiting for confirmation...');
      setTxHash(tx.hash);
      
      const receipt = await tx.wait();
      const returnedBookingId = receipt.logs[0].args.bookingId;
      setBookingId(returnedBookingId.toString());
      
      setTxStatus('Transaction confirmed! Booking successful!');
      triggerConfetti();

      setTimeout(clearAllData, 30000);

    } catch (error) {
      console.error('Detailed Error:', error);
      setTxStatus(`Error: ${error.message}`);
      setTimeout(clearAllData, 30000);
    }
  };

  const handleComplete = async () => {
    if (!completeId) {
      setTxStatus('Please enter a booking ID');
      setTimeout(clearAllData, 30000);
      return;
    }

    try {
      setTxStatus('Initiating release transaction...');
      setTxHash('');
      setReleasedAmount(null);
      
      const provider = await getProvider();
      const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

      setTxStatus('Sending release transaction...');
      
      const tx = await contract.releaseToken(completeId);
      setTxHash(tx.hash);
      
      const receipt = await tx.wait();
      const returnedAmount = receipt.logs[0].args.amount;
      setReleasedAmount(returnedAmount.toString());
      
      setTxStatus('Release transaction confirmed!');
      triggerConfetti();

      setTimeout(clearAllData, 30000);

    } catch (error) {
      console.error('Detailed Error:', error);
      setTxStatus(`Error: ${error.message}`);
      setTimeout(clearAllData, 30000);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a4a3c 0%, #2d6b58 50%, #1a4a3c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      overflowY: 'auto',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: 'inset 0 0 100px rgba(255, 255, 255, 0.1)'
    }}>
      <img 
        src="https://property.bakuun.com/img/logo_big.png" 
        alt="Logo" 
        style={{
          maxWidth: '180px',
          marginBottom: '30px',
          marginTop: '20px'
        }}
      />
      
      <div style={{
        background: 'linear-gradient(135deg, #FFD700, #4169E1)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '50px',
        textAlign: 'center',
        maxWidth: '600px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <p style={{
          color: 'white',
          fontSize: '17px',
          fontWeight: '500',
          margin: 0,
          lineHeight: '1.5',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
        }}>
          We are facilitating all the transactions on your behalf, you get immutable, hackproof transaction recordkeeping in exchange.
        </p>
      </div>

      {showConfetti && <Confetti 
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
      />}
      
      <button 
        onClick={handleBookToken}
        style={{
          padding: '16px 45px',
          fontSize: '18px',
          borderRadius: '30px',
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.3s ease',
          fontWeight: '600',
          letterSpacing: '0.5px',
          marginBottom: '30px',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
          }
        }}>
        Book
      </button>

      <div style={{ 
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <input
          type="number"
          value={completeId}
          onChange={(e) => setCompleteId(e.target.value)}
          placeholder="Enter Booking ID"
          style={{
            padding: '14px 20px',
            borderRadius: '25px',
            border: '2px solid #4f46e5',
            backgroundColor: '#2a2a2a',
            color: 'white',
            fontSize: '16px',
            width: '180px',
            outline: 'none',
            transition: 'all 0.3s ease',
            ':focus': {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)'
            }
          }}
        />
        <button 
          onClick={handleComplete}
          style={{
            padding: '16px 45px',
            fontSize: '18px',
            borderRadius: '30px',
            border: 'none',
            background: 'linear-gradient(135deg, #34d399, #059669)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(52, 211, 153, 0.3)',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            letterSpacing: '0.5px',
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(52, 211, 153, 0.4)',
            }
          }}>
          Complete
        </button>
      </div>
      
      {txStatus && (
        <div style={{
          marginTop: '20px',
          padding: '15px 25px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontSize: '16px',
          lineHeight: '1.5',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          {txStatus}
        </div>
      )}

      {bookingId && (
        <div style={{
          marginTop: '20px',
          padding: '15px 25px',
          borderRadius: '12px',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          color: 'white',
          fontSize: '16px',
          lineHeight: '1.5',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.1)'
        }}>
          You have successfully made a booking, your booking ID is: {bookingId}
        </div>
      )}

      {releasedAmount && (
        <div style={{
          marginTop: '20px',
          padding: '15px 25px',
          borderRadius: '12px',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          color: 'white',
          fontSize: '16px',
          lineHeight: '1.5',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(52, 211, 153, 0.1)'
        }}>
          Released Amount: {releasedAmount} tokens
        </div>
      )}

      {txHash && (
        <div style={{
          marginTop: '20px',
          padding: '15px 25px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontSize: '16px',
          lineHeight: '1.5',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <a 
            href={`https://amoy.technology/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#6366f1',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease',
              ':hover': {
                color: '#4f46e5'
              }
            }}
          >
            View transaction on Amoy Explorer
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
