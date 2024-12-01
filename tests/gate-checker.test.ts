import { publicKey } from '@metaplex-foundation/umi';
import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';

import { GateChecker } from '../target/types/gate_checker';
import { token } from '@coral-xyz/anchor/dist/cjs/utils';
import { assert } from 'chai';

describe('NFT_mint', () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const program = anchor.workspace.GateChecker as Program<GateChecker>;

  const METADATA_SEED = 'metadata'; // Seed for the metadata account
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const MINT_SEED = 'mint';
  const payer = program.provider.publicKey;

  const metadata = {
    name: 'DUMESICA2 token',
    symbol: 'DUMESICA2',
    uri: 'https://5vfxc4tr6xoy23qefqbj4qx2adzkzapneebanhcalf7myvn5gzja.arweave.net/7UtxcnH13Y1uBCwCnkL6APKsge0hAgacQFl-zFW9NlI',
    decimals: 0
  }; // Metadata for the NFT

  const mintAmount = 5;

  const [mint] = PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_SEED, 'utf-8')], // Seed for the mint account
    program.programId
  );

  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [Buffer.from(METADATA_SEED, 'utf-8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };
  const mintAuthority = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('authority')],
    program.programId
  )[0];
  it('Initialize Token', async () => {
    const info = await program.provider.connection.getAccountInfo(mint);
    if (info) {
      return;
    }
    console.log('Mint not found. Initializing...');

    const context = {
      metadata: metadataAddress,
      mint,
      payer,
      mintAuthority,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID
    };

    const txHash = await program.methods.initNfts(metadata).accounts(context).rpc();

    await program.provider.connection.confirmTransaction(txHash); // Confirm the transaction
    log(txHash);
    const newInfo = await program.provider.connection.getAccountInfo(mint);
    assert(newInfo, 'Mint should be initialized');
  });

  it('Mint token', async () => {
    const destination = await anchor.utils.token.associatedAddress({
      owner: payer,
      mint: mint
    });

    let initialBalance: number;

    try {
      const balance = await program.provider.connection.getTokenAccountBalance(destination);
      initialBalance = balance.value.uiAmount;
    } catch (error) {
      //Token account not yet initialized, then has 0 balance
      initialBalance = 0;
    }

    const context = {
      mint,
      destinationAtaV1: destination,
      payer,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID
    };

    const txHash = await program.methods.mintNfts(new BN(5)).accounts(context).rpc(); // Mint 5 tokens
    await program.provider.connection.confirmTransaction(txHash); // Confirm the transaction
    log(txHash);

    const postBalance = (await program.provider.connection.getTokenAccountBalance(destination))
      .value.uiAmount;

    assert.equal(
      initialBalance + mintAmount,
      postBalance,
      'Post balance should be equal initial plus mint amount'
    );
  });

  it('Transfer token', async () => {
    const key = anchor.AnchorProvider.env().wallet.publicKey;
    // Generate a random keypair that will represent our token

    // const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    let associatedTokenAccount = await getAssociatedTokenAddress(mint, key);
    // Get anchor's wallet's public key
    const myWallet = anchor.AnchorProvider.env().wallet.publicKey;
    // Wallet that will receive the token
    const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    // The ATA for a token on the to wallet (but might not exist yet)
    const toATA = await getAssociatedTokenAddress(mint, toWallet.publicKey);
    // Fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        myWallet,
        toATA,
        toWallet.publicKey,
        mint
      )
    );

        console.log('MINTMINMINTINMINT' );
    // Sends and create the transaction
     const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, []);

     console.log('resresresresresresresresres', res);

    // Executes our transfer smart contract
     const txHash =  await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount,
        fromAuthority: myWallet,
        to: toATA
      })
      .rpc();

      console.log('txHash', txHash);

      //await program.provider.connection.confirmTransaction(txHash); // Confirm the transaction

    // Get minted token amount on the ATA for our anchor wallet
    const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount))
      .value

      console.log('minted', minted);

      //log(txHash);
    // assert.equal(minted, 5);
  });
});
