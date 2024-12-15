import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const provider = clusterApiUrl('testnet');
const connection = new Connection(provider, 'confirmed');

export async function getBalance(address: string) {
  const publicKey = new PublicKey(address);
  return await connection.getBalance(publicKey) / LAMPORTS_PER_SOL; ///1
}