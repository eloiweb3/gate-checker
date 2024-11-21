import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("gate_checker", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.GateChecker as Program;

  it("Initializes an NFT", async () => {
    // Generate a new keypair for the signer
    const signer = anchor.web3.Keypair.generate();

    // Airdrop SOL to the signer to pay for transactions
    const signature = await provider.connection.requestAirdrop(
      signer.publicKey,
      1_000_000_000 // 1 SOL
    );
    await provider.connection.confirmTransaction(signature, "confirmed");

    // Define PDA and accounts
    const mint = anchor.web3.Keypair.generate();
    const associatedTokenAddress = await anchor.utils.token.associatedAddress({
      mint: mint.publicKey,
      owner: signer.publicKey,
    });

    // Call the init_nft instruction
    await program.methods
      .initNft()
      .accounts({
        signer: signer.publicKey,
        mint: mint.publicKey,
        associatedTokenAccount: associatedTokenAddress,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([signer, mint])
      .rpc();

    // Fetch the associated token account to verify it was created
    const tokenAccount = await provider.connection.getAccountInfo(
      associatedTokenAddress
    );

    // Assertions
    assert.ok(tokenAccount !== null, "Associated Token Account was not created");
    assert.equal(
      tokenAccount.owner.toBase58(),
      anchor.utils.token.TOKEN_PROGRAM_ID.toBase58(),
      "Incorrect owner for associated token account"
    );
  });
});
