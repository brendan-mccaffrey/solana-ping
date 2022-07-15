import * as anchor from "@project-serum/anchor";
// import { Program } from "@project-serum/anchor";
import assert = require("assert");
import { createFreezeAccountInstruction } from "@solana/spl-token";
import { SolanaPing } from "../target/types/solana_ping";
import { SystemProgram } from "@solana/web3.js";

describe("solana-ping", () => {
    // Configure the client to use the local cluster.

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.SolanaPing; // as Program<SolanaPing>;

    let _baseAccount;

    it("Creates a counter:", async () => {

        // create account
        let baseAccount = await anchor.web3.Keypair.generate();

        console.log("Geneerated keypair with pubkey: ", baseAccount.publicKey.toString())

        // initialize account
        const tx = await program.rpc.initialize({
            accounts: {
                baseAccount: baseAccount.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            },
            signers: [baseAccount],
        });

        console.log("TX Result: ", tx)

        // Fetch account and check value of count
        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log("Count should be 0 here: ", account.count.toString())
        assert.ok(account.count.toString() == 0);

        _baseAccount = baseAccount;
    });

    it("Increments the counter:", async () => {

        // create account
        const baseAccount = _baseAccount;

        // call increment
        await program.rpc.increment({
            accounts: {
                baseAccount: baseAccount.publicKey,
            },
        });

        // Fetch account and check if incremented to 1
        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log("Count should be 1 here: ", account.count.toString())
        assert.ok(account.count.toString() == 1);
    });
});
