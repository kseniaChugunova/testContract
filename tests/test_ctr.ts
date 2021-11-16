import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { TestCtr } from '../target/types/test_ctr';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
const assert = require("assert");
const anchor = require("@project-serum/anchor");
const program = anchor.workspace.TestCtr as Program<TestCtr>;


  //const program = anchor.workspace.Basic2
describe('test_ctr', () => {
  const provider = anchor.Provider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  //const program = anchor.workspace.Basic;

  const newAccount = anchor.web3.Keypair.generate();
  const newOwnerAccount = anchor.web3.Keypair.generate();
  const newVaultAccount = anchor.web3.Keypair.generate();

  // it("It runs the constructor", async () => {
    
  //     await program.rpc.initialize({
  //       accounts: {
  //         userAccount: newAccount.publicKey,
  //       },
  //        instructions: [
  //         await program.account.user.createInstruction(newAccount),
  //       ],
  //       signers: [newAccount],
  //     });

  //   let uA = await program.account.user.fetch(newAccount.publicKey);
  //   assert.ok(uA.tokenA.toNumber() === 100);
  //   assert.ok(uA.tokenB.toNumber() === 100);
  // });

  it("Updates the owner", async () => {
    const nominator = new anchor.BN(10);
    const denominator = new anchor.BN(20);
    await program.rpc.update(
        nominator,
        denominator,
        {
        accounts: {
          ownerAccount: newOwnerAccount.publicKey,
        },

        instructions: [
          await program.account.owner.createInstruction(newOwnerAccount),
        ],
        signers: [newOwnerAccount],
    }
);

    let ownerAccount = await program.account.owner.fetch(newOwnerAccount.publicKey);
    assert.ok(ownerAccount.nominator.toNumber() === 10);
    assert.ok(ownerAccount.denominator.toNumber() === 20);
  });

  it("Converts", async () => {

    const user_token_amount_a = new anchor.BN(50);
    const user_token_amount_b = new anchor.BN(50);
    const vault_token_amount_a = new anchor.BN(50);
    const vault_token_amount_b = new anchor.BN(50);
    const token_amount_a_to_convert = new anchor.BN(5);

    const mintAuthority = anchor.web3.Keypair.generate();

    const mintA = await Token.createMint(
          provider.connection,
          newAccount,
          mintAuthority.publicKey,
          null,
          0,
          TOKEN_PROGRAM_ID
        );
        const mintB = await Token.createMint(
          provider.connection,
          newAccount,
          mintAuthority.publicKey,
          null,
          0,
          TOKEN_PROGRAM_ID
        );

    const userTokenA = await mintA.createAssociatedTokenAccount(newAccount.publicKey);
    const userTokenB = await mintB.createAssociatedTokenAccount(newAccount.publicKey);

    const vaultTokenA = await mintA.createAssociatedTokenAccount(newVaultAccount.publicKey);
    const vaultTokenB = await mintB.createAssociatedTokenAccount(newVaultAccount.publicKey);

    await mintA.mintTo(
          userTokenA,
          mintAuthority.publicKey,
          [mintAuthority],
          user_token_amount_a,
        );

    await mintB.mintTo(
          userTokenB,
          mintAuthority.publicKey,
          [mintAuthority],
          user_token_amount_b,
        );
    await mintA.mintTo(
          vaultTokenA,
          mintAuthority.publicKey,
          [mintAuthority],
          vault_token_amount_a,
        );

    await mintB.mintTo(
          vaultTokenB,
          mintAuthority.publicKey,
          [mintAuthority],
          vault_token_amount_b,
        );


    const accountsForConvert = {
            authority: newAccount.publicKey, 
            tokenProgram: TOKEN_PROGRAM_ID,
            userTokenAWallet: userTokenA,
            userTokenAWallet: userTokenA,
            vaultTokenA: vaultTokenA,
            vaultTokenB: vaultTokenB,
            ownerAccount: newOwnerAccount.publicKey,
          };

    // let ownerAccount = await program.account.owner.fetch(newOwnerAccount.publicKey);
    // let userAccount = await program.account.user.fetch(newAccount.publicKey);
    // console.log("{}", userAccount.tokenA);
    // console.log("{}", userAccount.tokenB);
    console.log("{}", newAccount.publicKey);
    await program.rpc.convert(
      token_amount_a_to_convert,
      {
        accounts: accountsForConvert,
         signers: [
                  newAccount,
                  newVaultAccount,
              ],
              // instructions: [
              //     await program.account.pool.createInstruction(pool),
              // ],
      });

    // let userAccount1 = await program.account.user.fetch(newAccount.publicKey);
    // assert.ok(userAccount1.tokenA.toNumber() === 50);
    // assert.ok(userAccount1.tokenB.toNumber() === 125);
  });
});
