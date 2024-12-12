use anchor_lang::prelude::*;
use anchor_lang::system_program;
use base64::{engine::general_purpose::URL_SAFE, Engine as _};

pub const SECONDS_IN_DAY: i64 = 86400;
pub const SUBSCRIPTION_DURATION: i64 = 30 * SECONDS_IN_DAY;
pub const MAX_SUBSCRIPTION_AMOUNT: usize = 32;
pub const MAX_NAME_LENGTH: usize = 32;
pub const MAX_URL_LENGTH: usize = 64;


declare_id!("EvHqnZaXDeqTVSgmtFqjVEUhTchtZAiUXi8gme7juq58");


// Decode transported urls
pub fn decode_base64_url(input: &str) -> Result<Vec<u8>> {
	Ok(URL_SAFE.decode(input)
		.map_err(|_| Error::InvalidURLFormat)?)
}

// Remove expired subscriptions from a user account
// @param user_account - Mutable user account to update
// @param clock - Current timestamp
pub fn remove_unvalid_subscriptions(user_account: &mut UserAccount, clock: i64) {
	// Find a list of expired subscriptions
	let mut invalid_subscriptions = Vec::new();
	for (index, &end_time) in user_account.subscription_endtime.iter().enumerate() {
		if end_time < clock {
			invalid_subscriptions.push(index);
		}
	}

	// Remove items in reverse order to avoid shifting
	for index in invalid_subscriptions.iter().rev() {
		user_account.subscription_keys.remove(*index);
		user_account.subscription_names.remove(*index);
		user_account.subscription_links.remove(*index);
		user_account.subscription_endtime.remove(*index);
	}
}


#[program]
pub mod subservice {
    use super::*;

	// Create account for managing subscription services
	// @param name - Topic of the subscription plans
	// @param subscription_plans_prices - Support plan prices (in lamports) preferably listed in ascending order 
	// @param subscription_plans_names - Support plan names up to 32 symbols each listed in 
	// @param subscription_plans_images - Support plan images, like premium content
	pub fn create_creator_account(
		ctx: Context<CreateCreatorAccount>, 
		name: String, 
		subscription_plans_prices: Vec<u64>,
		subscription_plans_names: Vec<String>,
		subscription_plans_images: Vec<String>) -> Result<()> {

		// Validate input lengths
		require!(
			subscription_plans_prices.len() <= MAX_SUBSCRIPTION_AMOUNT,
			Error::TooManyPlans
		);
		require!(
			subscription_plans_prices.len() == subscription_plans_names.len() 
			&& subscription_plans_names.len() == subscription_plans_images.len(),
			Error::InvalidInputLength
		);
		require!(
			name.len() <= MAX_NAME_LENGTH,
			Error::NameTooLong
		);

		let creator_account = &mut ctx.accounts.creator_account;

		creator_account.creator = ctx.accounts.signer.key();
		creator_account.payto   = ctx.accounts.payto_account.key();
		creator_account.name    = name.as_bytes().to_vec();
		
		creator_account.subscription_plans_prices = subscription_plans_prices
			.iter()
			.map(|x| x.to_le_bytes().to_vec())
			.collect();

		creator_account.subscription_plans_names = subscription_plans_names
			.iter()
			.map(|x| x.as_bytes().to_vec())
			.collect();

		creator_account.subscription_plans_images = subscription_plans_images
			.into_iter()
			.map(|x| decode_base64_url(&x))
			.collect::<Result<Vec<Vec<u8>>>>()?;

		msg!("Successfully initialized!");
		msg!("Creator: {}", creator_account.creator);
		msg!("Creator Account: {}", creator_account.key());
		msg!("Topic: {}", String::from_utf8(creator_account.name.clone()).expect("Invalid topic!"));
		msg!("Subscription plans names: {:?}", creator_account.subscription_plans_names);
		msg!("Subscription plans prices: {:?}", creator_account.subscription_plans_prices);
				
		Ok(())	
	}

	// Purchase a plan for a month
	// @param sol_amount - Amount of SOL for purchase
	// @param option_index - Index of the subscription plan
    pub fn purchase_subscription(ctx: Context<PurchaseSubscription>, sol_amount: u64, option_index: u8) -> Result<()> {
		let creator_account = &ctx.accounts.creator_account;
		let user_account = &mut ctx.accounts.user_account;
		let plan_idx = option_index as usize - 1;

		// Validate inputs
		require!(
			ctx.accounts.payto_account.key() == creator_account.payto,
			Error::KeysMismatch
		);
		require!(
			plan_idx <= creator_account.subscription_plans_prices.len(),
			Error::ItemDoesNotExist
		);

		let price_bytes = creator_account.subscription_plans_prices[plan_idx].clone();
		
		let plan_price = u64::from_le_bytes(price_bytes.as_slice().try_into()
			.map_err(|_| Error::ItemDoesNotExist)?);

		// Validate amount
		require!(plan_price == sol_amount, Error::InvalidAmountOfSOL);

		// Transfer SOL
		system_program::transfer(
			CpiContext::new(
				ctx.accounts.system_program.to_account_info(),
				system_program::Transfer {
					from: ctx.accounts.signer.to_account_info(),
					to: ctx.accounts.payto_account.to_account_info(),
				},
			),
			sol_amount,
		)?;


		user_account.subscription_keys.push(creator_account.key());

		let subscription_name = creator_account.subscription_plans_names[plan_idx].clone();
		let subscription_link = creator_account.subscription_plans_images[plan_idx].clone();

		user_account.subscription_names.push(subscription_name);
		user_account.subscription_links.push(subscription_link);

		let current_time = Clock::get()?.unix_timestamp;
		user_account.subscription_endtime.push(current_time + SUBSCRIPTION_DURATION);

		msg!("Successfully added subscription level {} to the account!", option_index);
		msg!("Subscription endtime: {} days left", (user_account.subscription_endtime[user_account.subscription_endtime.len()-1] - current_time) / SECONDS_IN_DAY);

		Ok(())
	}

	// Create a new user account for managing your subscriptions
	pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
		let user_account = &mut ctx.accounts.user_account;

		user_account.owner = ctx.accounts.signer.key();

		Ok(())
	}
	
	// Log all valid subscriptions for a user
	pub fn log_user_subscriptions(ctx: Context<LogUserSubscriptions>) -> Result<()> {
		let user_account = &mut ctx.accounts.user_account;

		let current_time = Clock::get()?.unix_timestamp;
		remove_unvalid_subscriptions(user_account, Clock::get()?.unix_timestamp);

		msg!("User: {}", user_account.owner);

		for i in 0..user_account.subscription_keys.len() {
			msg!("Subscription {}. {}({}): days left {}",
				i+1,
				String::from_utf8(user_account.subscription_names[i].clone()).expect("Invalid name!"),
				user_account.subscription_keys[i],
				((user_account.subscription_endtime[i] - current_time) / SECONDS_IN_DAY)
			);
		}
		
		Ok(())
	}

	// Get link for a specific subscription
	// @param subscription_index - Index of subscription to get link for, starting from 1
	pub fn get_subscription_link(ctx: Context<GetSubscriptionLink>, subscription_index: u8) -> Result<()> {
		let user_account = &mut ctx.accounts.user_account;
		
		remove_unvalid_subscriptions(user_account, Clock::get()?.unix_timestamp);

		let subscription_link = user_account.subscription_links[subscription_index as usize - 1].clone();

		msg!("Subscription link: {}", String::from_utf8(subscription_link).expect(&Error::InvalidURLFormat.to_string()));

		Ok(())
	}
}


#[account]
pub struct CreatorAccount {
	pub creator: Pubkey,
	pub payto: Pubkey,
	pub name: Vec<u8>, 

	pub subscription_plans_prices: Vec<Vec<u8>>,
	pub subscription_plans_names: Vec<Vec<u8>>, 
	// subscribers will have access to images
	pub subscription_plans_images: Vec<Vec<u8>>, // all links preferably should be shortened
}

#[derive(Accounts)]
pub struct CreateCreatorAccount<'info> {
    #[account(
        init,
        payer = signer, 
        space = 8 
			+ 32 
			+ 32 
			+ 4 + MAX_NAME_LENGTH 
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT * (4 + MAX_NAME_LENGTH)) 
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT * (4 + 8))
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT * (4 + MAX_URL_LENGTH)) 
    )]
    pub creator_account: Account<'info, CreatorAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    
    /// CHECK: This is safe because we're only using it for payments
    #[account(mut)]
    pub payto_account: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct PurchaseSubscription<'info> {
    /// CHECK: This is safe because we're only using it for payments
    #[account(mut)]
    pub payto_account: SystemAccount<'info>,
	#[account(mut)]
    pub creator_account: Account<'info, CreatorAccount>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
	pub owner: Pubkey,
	
	// Divide everything in own lists
	pub subscription_keys: Vec<Pubkey>,
	pub subscription_links: Vec<Vec<u8>>,
	pub subscription_names: Vec<Vec<u8>>,
	pub subscription_endtime: Vec<i64>,
}

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
	#[account(
		init,
		payer=signer,
		space= 8 
			+ 32 
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT*32) 
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT * (4 + MAX_URL_LENGTH)) 
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT * (4 + MAX_NAME_LENGTH)) 
			+ 4 + (MAX_SUBSCRIPTION_AMOUNT * 8)
	)]
	pub user_account: Account<'info, UserAccount>,
	#[account(mut)]
	pub signer: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogUserSubscriptions<'info> {
	#[account(mut)]
	pub user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct GetSubscriptionLink<'info> {
	#[account(mut)]
	pub user_account: Account<'info, UserAccount>,
}

#[error_code]
pub enum Error {
	#[msg("Wrong amount of SOL!")]
	InvalidAmountOfSOL,
	#[msg("Item does not exist in this collection!")]
	ItemDoesNotExist, 
	#[msg("Pay keys mismatch!")]
	KeysMismatch,
	#[msg("Too many subscription plans!")]
	TooManyPlans,
	#[msg("Invalid input length!")]
	InvalidInputLength,
	#[msg("Name too long!")]
	NameTooLong,
	#[msg("URL too long!")]
	URLTooLong,
	#[msg("Invalid URL format!")]
	InvalidURLFormat,
} 
