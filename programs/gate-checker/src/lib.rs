use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3,
        Metadata as Metaplex,
    },
    token::{ mint_to, transfer, Mint, MintTo, Token, TokenAccount,Transfer as SplTransfer },
};

declare_id!("32MZTSRGWxEkwG63qVuFwyTbpgEZXa5SxvBCVxCZTRY1");

#[program]
mod gate_checker {

    use super::*;
    pub fn init_nfts(ctx: Context<InitToken>, metadata: InitTokenParams) -> Result<()> {
        let seeds = &["mint".as_bytes(), &[ctx.bumps.mint]];
        let signer = [&seeds[..]];

        let token_data: DataV2 = DataV2 {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        //Note: Because we used init in our mint account, we do not need to invoke the create_mint instruction from the SPL Token program. This will be handled automatically by Anchor behind the scenes.
        let metadata_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.mint.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                mint_authority: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &signer
        );

        create_metadata_accounts_v3(metadata_ctx, token_data, false, true, None)?;

        msg!("Token mint created successfully.");

        Ok(())
    }

    pub fn mint_nfts(ctx: Context<MintNFTs>, amount: u64) -> Result<()> {
        let seeds = &["mint".as_bytes(), &[ctx.bumps.mint]];
        let signer = [&seeds[..]];


        // if let Some(destination_ata_v1) = &ctx.accounts.destination_ata_v1 {
            // let result = destination_ata_v1.to_account_info();

            mint_to(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    MintTo {
                        authority: ctx.accounts.mint.to_account_info(),
                        to: ctx.accounts.destination_ata_v1.to_account_info()  ,
                        mint: ctx.accounts.mint.to_account_info(),
                    },
                    &signer
                ),
                amount
            )?;
            // Ok(())

        // }else {
        //     msg!("destination_ata_v1 is not provided or is None.");
        //     return Err(ProgramError::InvalidAccountData.into());
        // }
        // if let Some(destination_ata_v2) = &ctx.accounts.destination_ata_v2 {
        //     // let result = destination_ata_v2.to_account_info();

        //     mint_to(
        //         CpiContext::new_with_signer(
        //             ctx.accounts.token_program.to_account_info(),
        //             MintTo {
        //                 authority: ctx.accounts.mint.to_account_info(),
        //                 to: destination_ata_v2.to_account_info(),
        //                 mint: ctx.accounts.mint.to_account_info(),
        //             },
        //             &signer
        //         ),
        //         1
        //     )?;
        //     // Ok(())

        // }else {
        //     msg!("destination_ata_v2 is not provided or is None.");
        //     return Err(ProgramError::InvalidAccountData.into());
        // }
        // if let Some(destination_ata_v3) = &ctx.accounts.destination_ata_v3 {
        //     // let result = destination_ata_v3.to_account_info();

        //     mint_to(
        //         CpiContext::new_with_signer(
        //             ctx.accounts.token_program.to_account_info(),
        //             MintTo {
        //                 authority: ctx.accounts.mint.to_account_info(),
        //                 to: destination_ata_v3.to_account_info(),
        //                 mint: ctx.accounts.mint.to_account_info(),
        //             },
        //             &signer
        //         ),
        //         1
        //     )?;
        //     // Ok(())

        // }else {
        //     msg!("destination_ata_v3 is not provided or is None.");
        //     return Err(ProgramError::InvalidAccountData.into());
        // }
        // if let Some(destination_ata_v4) = &ctx.accounts.destination_ata_v4 {
        //     // let result = destination_ata_v4.to_account_info();

        //     mint_to(
        //         CpiContext::new_with_signer(
        //             ctx.accounts.token_program.to_account_info(),
        //             MintTo {
        //                 authority: ctx.accounts.mint.to_account_info(),
        //                 to: destination_ata_v4.to_account_info(),
        //                 mint: ctx.accounts.mint.to_account_info(),
        //             },
        //             &signer
        //         ),
        //         1
        //     )?;
        //     // Ok(())

        // }else {
        //     msg!("destination_ata_v4 is not provided or is None.");
        //     return Err(ProgramError::InvalidAccountData.into());
        // }
        // if let Some(destination_ata_v5) = &ctx.accounts.destination_ata_v5 {
        //     // let result = destination_ata_v5.to_account_info();

        //     mint_to(
        //         CpiContext::new_with_signer(
        //             ctx.accounts.token_program.to_account_info(),
        //             MintTo {
        //                 authority: ctx.accounts.mint.to_account_info(),
        //                 to: destination_ata_v5.to_account_info(),
        //                 mint: ctx.accounts.mint.to_account_info(),
        //             },
        //             &signer
        //         ),
        //         1
        //     )?;
        //     // Ok(())

        // }else {
        //     msg!("destination_ata_v5 is not provided or is None.");
        //     return Err(ProgramError::InvalidAccountData.into());
        // }

        // Mint the NFT to the wallet's associated token account
        // mint_to(
        //     CpiContext::new_with_signer(
        //         ctx.accounts.token_program.to_account_info(),
        //         MintTo {
        //             authority: ctx.accounts.mint.to_account_info(),
        //             to: ctx.accounts.destination_ata_v1.   ,
        //             mint: ctx.accounts.mint.to_account_info(),
        //         },
        //         &signer
        //     ),
        //     quantity
        // )?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(params: InitTokenParams)]
pub struct InitToken<'info> {
    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"mint"],
        bump,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint, //You'll notice that we set the authority to the mint account itself. This effectively gives authority to our program without having to create another PDA.
        mint::freeze_authority = mint_authority
    )]
    pub mint: Account<'info, Mint>,
     /// CHECK: This account is not initialized and is being used for signing purposes only
     pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metaplex>,
}

#[derive(Accounts)]
pub struct MintNFTs<'info> {
    #[account(
        mut,
        // payer = payer,
        seeds = [b"mint"],
        bump,
        mint::decimals = 0,
        mint::authority = mint,
        // mint::freeze_authority = None(),
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    // #[account(
    //     seeds = [b"authority"],
    //     bump,
    // )]
    /// CHECK: Associated Token Account to be created.
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub destination_ata_v1: Account<'info, TokenAccount>,
    // pub destination_ata_v1: Option<Account<'info, TokenAccount>>,
    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint,
    //     associated_token::authority = payer
    // )]
    // pub destination_ata_v2: Option<Account<'info, TokenAccount>>,
    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint,
    //     associated_token::authority = payer
    // )]
    // pub destination_ata_v3: Option<Account<'info, TokenAccount>>,
    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint,
    //     associated_token::authority = payer
    // )]
    // pub destination_ata_v4: Option<Account<'info, TokenAccount>>,
    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint,
    //     associated_token::authority = payer
    // )]
    // pub destination_ata_v5: Option<Account<'info, TokenAccount>>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct InitTokenParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}
