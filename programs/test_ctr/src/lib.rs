use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Transfer,
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod test_ctr{
    use super::*;

    pub fn convert(ctx: Context<Convert>, token_amount_a: u64) -> ProgramResult {

        let owner_account = &mut ctx.accounts.owner_account;

        let output_amount_b = token_amount_a * owner_account.nominator / owner_account.denominator;

        let cpi_data = Transfer {
            from: ctx.accounts.user_token_a_wallet.to_account_info(),
            to: ctx.accounts.vault_token_a.to_account_info(),
            authority: ctx.accounts.authority.clone(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.clone(), cpi_data), token_amount_a)?;
            
        let cpi_data = Transfer {
            from: ctx.accounts.vault_token_b.to_account_info(),
            to: ctx.accounts.user_token_a_wallet.to_account_info(),
            authority: ctx.accounts.authority.clone(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.clone(), cpi_data), output_amount_b)?;
         
        // user_account.token_a -= token_amount_a;
        // user_account.token_b += output_amount;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, nominator: u64, denominator: u64) -> ProgramResult {

        let owner = &mut ctx.accounts.owner_account;

        owner.denominator = denominator;
        owner.nominator = nominator;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Convert<'info> {
    #[account(mut)]
    pub user_token_a_wallet: AccountInfo<'info>,
    #[account(mut)]
    pub user_token_b_wallet: AccountInfo<'info>,
    #[account(mut)]
    pub vault_token_a: AccountInfo<'info>,
    #[account(mut)]
    pub vault_token_b: AccountInfo<'info>,
    #[account(mut)]
    pub owner_account: ProgramAccount<'info, Owner>,
    #[account(mut)]
    pub token_program: AccountInfo<'info>,
    #[account(mut)]
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(zero)]
    pub owner_account: ProgramAccount<'info, Owner>,
}

#[account]
pub struct Owner {
    pub nominator: u64,
    pub denominator: u64
}
