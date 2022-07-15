use anchor_lang::prelude::*;

declare_id!("FA51D5fh1VhruC5ZhG2MVvRjfS233QnSD5yEPCbYFd3U");

#[program]
pub mod solana_ping {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += 1;
        Ok(())
    }
}

// tx instructions
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 16)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// tx instructions
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

// An account that is passed to tx instruction
#[account]
pub struct BaseAccount {
    pub count: u64,
}
