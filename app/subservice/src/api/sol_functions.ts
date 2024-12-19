import { Connection, clusterApiUrl, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CreateCreatorDto } from './dto/create-creator.dto';

const provider = clusterApiUrl('testnet');
const connection = new Connection(provider, 'confirmed');

export async function getBalance(address: string) {
  const publicKey = new PublicKey(address);
  return await connection.getBalance(publicKey) / LAMPORTS_PER_SOL;
}

export async function createCreatorAccount(createCreatorDto: CreateCreatorDto) {
  // pull owner and payto from postgres
  const owner = new PublicKey("postgres:key")["owner"];
  const payto = new PublicKey("postgres:key")["payto"];
  const name = createCreatorDto.name;

  const plan_names = []
  const plan_prices = []
  const plan_urls = []

  for (const plan of createCreatorDto.subscriptions) {
    plan_names.push(plan.name);
    plan_prices.push(plan.price);
    plan_urls.push(plan.img_url);
  }
  0

}