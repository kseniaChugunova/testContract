import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { TestCtr } from '../target/types/test_ctr';

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

  it("It runs the constructor", async () => {
    
      await program.rpc.initialize({
        accounts: {
          userAccount: newAccount.publicKey,
        }
      });

    let userAccount = await program.account.user.fetch(newAccount.publicKey);
    assert.ok(userAccount.tokenA.toNumber() === 100);
    assert.ok(userAccount.tokenB.toNumber() === 100);
  });

  it("Updates the owner", async () => {
    await program.rpc.update({
        accounts: {
          ownerAccount: newOwnerAccount.publicKey,
        }
      }, 10,
        20,
);

    let ownerAccount = await program.account.owner.fetch(newOwnerAccount.publicKey);
    assert.ok(ownerAccount.nominator.toNumber() === 10);
    assert.ok(ownerAccount.denominator.toNumber() === 20);
  });

  it("Converts", async () => {
    await program.rpc.convert({
        accounts: {
          userAccount: newAccount.publicKey,
          ownerAccount: newOwnerAccount.publicKey,
        },
        token_amount_a: 50,
      });

    let ownerAccount = await program.account.owner.fetch(newOwnerAccount.publicKey);
    assert.ok(userAccount.tokenA.toNumber() === 50);
    assert.ok(userAccount.tokenB.toNumber() === 120);
  });
});