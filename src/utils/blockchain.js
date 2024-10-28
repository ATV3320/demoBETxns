import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../abi/contract';

// Create provider and wallet from environment variables
const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_RPC_URL, {
    chainId: 501,
    name: 'Columbus'
});

// Create wallet from private key
const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

export const deposit = async (amount) => {
    try {
        // Create and send transaction
        const tx = await wallet.sendTransaction({
            to: CONTRACT_ADDRESS,
            value: ethers.parseEther(amount),
            gasLimit: 100000, // Adjust as needed
        });
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);
        return true;
    } catch (error) {
        console.error('Deposit error:', error);
        return false;
    }
};

export const withdraw = async (amount) => {
    try {
        // Call contract's withdraw function
        const tx = await contract.withdraw(ethers.parseEther(amount));
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);
        return true;
    } catch (error) {
        console.error('Withdraw error:', error);
        return false;
    }
};

// Helper function to get wallet balance
export const getBalance = async () => {
    try {
        const balance = await wallet.getBalance();
        return ethers.formatEther(balance);
    } catch (error) {
        console.error('Balance check error:', error);
        return '0';
    }
};
