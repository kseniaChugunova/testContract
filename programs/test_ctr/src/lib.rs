use anchor_lang::prelude::*;

//declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// #[program]
// pub mod test_ctr {
//     use super::*;
//     pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct Initialize {}



// use anchor_lang::prelude::*;
// use anchor_spl::token::Approve;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod test_ctr{
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let user_account = &mut ctx.accounts.user_account;

        user_account.token_a = 100;
        user_account.token_b = 100;
        Ok(())
    }

    pub fn convert(ctx: Context<Convert>, token_amount_a: u64) -> ProgramResult {

        let user_account = &mut ctx.accounts.user_account;
        let owner_account = &mut ctx.accounts.owner_account;

        let output_amount = token_amount_a * owner_account.nominator / owner_account.denominator;

        user_account.token_a -= token_amount_a;
        user_account.token_b += output_amount;
        // anchor_spl::token::approve  // солановский approve выглядит более подходящим

        // transfer(owner_account, token_amount_a) // можно ли трансферить на один и тот же акк разные токены? или для каждого создавать свой?
        // transfer(user_account, output_amount)
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
    pub user_account: Account<'info, User>,
    #[account(mut)]
    pub owner_account: Account<'info, Owner>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub owner_account: Account<'info, Owner>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user_account: Account<'info, User>,
}

#[account]
pub struct User {
    pub token_a: u64,
    pub token_b: u64
}

#[account]
pub struct Owner {
    pub nominator: u64,
    pub denominator: u64
}