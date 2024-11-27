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
  createInitializeMint2Instruction,
  createMintToInstruction,
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
    name: 'NuKIO token',
    symbol: 'NUKIO',
    uri: 'https://5vfxc4tr6xoy23qefqbj4qx2adzkzapneebanhcalf7myvn5gzja.arweave.net/7UtxcnH13Y1uBCwCnkL6APKsge0hAgacQFl-zFW9NlI',
    decimals: 9
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
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID
    };

    const txHash = await program.methods.initToken(metadata).accounts(context).rpc();

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
      destinationAta: destination,
      payer,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID
    };

    const txHash = await program.methods.mintTokens(new BN(mintAmount * 10 ** metadata.decimals)).accounts(context).rpc(); // Mint 5 tokens
    await program.provider.connection.confirmTransaction(txHash); // Confirm the transaction
    log(txHash);

    // const postBalance = (await program.provider.connection.getTokenAccountBalance(destination))
    //   .value.uiAmount;

    // assert.equal(
    //   initialBalance + mintAmount,
    //   postBalance,
    //   'Post balance should be equal initial plus mint aamount'
    // );
  });
});
