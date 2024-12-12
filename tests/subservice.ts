import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Subservice } from "../target/types/subservice";
import { Buffer } from 'buffer';
import assert from 'assert';

describe("subservice", () => {
  	const provider = anchor.AnchorProvider.env();
  	anchor.setProvider(provider);

 	const program = anchor.workspace.Subservice as Program<Subservice>;
	
	const subscriptionPlans = [
		anchor.web3.LAMPORTS_PER_SOL * 0.00001,
		anchor.web3.LAMPORTS_PER_SOL * 0.001,
		anchor.web3.LAMPORTS_PER_SOL * 0.1,
	]
	const TO_AIRDROP = 1;

	const creatorAccount = new anchor.web3.Keypair(); 
  	const paytoAccount = new anchor.web3.Keypair();
	const userAccount  = new anchor.web3.Keypair();


	function encodeURL(url: string): string {
		return Buffer.from(url).toString('base64');
	}
	
	function logTransaction(txSignature: String) {
		console.log("Your transaction is successful!")
		console.log(`URL: https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`)
	}


	before(async () => {
		const airdrop = await provider.connection.requestAirdrop(
			paytoAccount.publicKey, anchor.web3.LAMPORTS_PER_SOL * TO_AIRDROP);
		
		logTransaction(airdrop);
	});


	it("Create Creator Account", async () => {  	
    	const tx = await program.methods
    		.createCreatorAccount(
    			"Youtube channel",
    			[
    				new anchor.BN(subscriptionPlans[0]), 
    				new anchor.BN(subscriptionPlans[1]),
    				new anchor.BN(subscriptionPlans[2]),
   				],
    			["Mini", "Midi", "Maxi"],
    			[
    				encodeURL("https://shorturl.at/zdKIh"),
    				encodeURL("https://shorturl.at/rqphF"),
    				encodeURL("https://shorturl.at/qtnKo"),
    			],
    		)
    		.accounts({
    			signer: provider.wallet.publicKey,
    			paytoAccount: paytoAccount.publicKey,
				creatorAccount: creatorAccount.publicKey,
    		})
    		.signers([creatorAccount])
    		.rpc();
    		
    	logTransaction(tx);
  	});

	it("Create User Account", async () => {
		const tx = await program.methods
			.createUserAccount()
			.accounts({
				signer: provider.wallet.publicKey,
				userAccount: userAccount.publicKey,
			})
			.signers([userAccount])
			.rpc();

		logTransaction(tx);
	});

	it("Purchase subscription", async () => {
		const choice = 3;
		const solAmount = subscriptionPlans[choice-1];
	
		const tx = await program.methods
			.purchaseSubscription(
				new anchor.BN(solAmount),
				choice
			)
			.accounts({
				paytoAccount: paytoAccount.publicKey,
				creatorAccount: creatorAccount.publicKey,
				userAccount: userAccount.publicKey,
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// check if money was really transfered to creator's withdraw account
		const paytoBalance = await provider.connection.getBalance(paytoAccount.publicKey);
		assert.strictEqual(
			paytoBalance, 
			anchor.web3.LAMPORTS_PER_SOL * TO_AIRDROP + solAmount
		 );
			
		logTransaction(tx);
	});

	it("Purchase another subscription", async () => {
		const choice = 2;
		const solAmount = subscriptionPlans[choice-1];
	
		const tx = await program.methods
			.purchaseSubscription(
				new anchor.BN(solAmount),
				choice
			)
			.accounts({
				paytoAccount: paytoAccount.publicKey,
				creatorAccount: creatorAccount.publicKey,
				userAccount: userAccount.publicKey,
				signer: provider.wallet.publicKey,
			})
			.rpc();

		// check if money was really transfered to creator's withdraw account
		const paytoBalance = await provider.connection.getBalance(paytoAccount.publicKey);
		assert.strictEqual(
			paytoBalance, 
			subscriptionPlans[choice] + solAmount + TO_AIRDROP * anchor.web3.LAMPORTS_PER_SOL 
		 );
			
		logTransaction(tx);
	});

	it("List user account subscriptions", async () => {
		const tx = await program.methods
			.logUserSubscriptions()
			.accounts({
				userAccount: userAccount.publicKey,
			})
			.rpc();

		logTransaction(tx);
	});

	it("Get user account subscription's link", async () => {
		const choice = 1;
		const tx = await program.methods
			.getSubscriptionLink(choice)
			.accounts({
				userAccount: userAccount.publicKey,
			})
			.rpc();

		logTransaction(tx);
	});

	it("Get another user account subscription's link", async () => {
		const choice = 2;
		const tx = await program.methods
			.getSubscriptionLink(choice)
			.accounts({
				userAccount: userAccount.publicKey,
			})
			.rpc();

		logTransaction(tx);
	});
});

