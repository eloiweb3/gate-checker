use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

// declare_id!("DjEiZonFEZpw4M33ZCpMWnrshPwEJ5ZNmuV8FWQiVWdg");
declare_id!("4bFa2t9VRRj9XtDhrFEDbgvEirREdFCqtYb6pYcjXkki");

#[program]
pub mod gate_checker {
    use super::*;

  pub fn init_nft(ctx: Context<InitNFT>) -> Result<()> {
        // create mint account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        );

        mint_to(cpi_context, 1)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitNFT<'info> {
    #[account(mut, signer)]
    /// CHECK: <comment explaining why are we blindly trusting this account>.
    pub signer: AccountInfo<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
    )]
    pub mint: Account<'info, Mint>,
      #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}
