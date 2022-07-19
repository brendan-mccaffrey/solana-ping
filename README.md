# Solana x React Starter Example

This is an example starter project for the Solana x Anchor x React stack.

## Errors and Fixes to Existing Example Projects

Previous examples that I used include 
 1. [Complete Guide to Solana Full Stack Development](https://dev.to/edge-and-node/the-complete-guide-to-full-stack-solana-development-with-react-anchor-rust-and-phantom-3291)
 2. [Solana Smart Contract Tutorial](https://www.youtube.com/watch?v=vt8GUw_PDqM)
 3. [Working Example of Solana and Acnhor on Javascript Client - React](https://gist.github.com/dabit3/9bac597eb307107991fcf736974af4f3)

These examples are extremely helpful outlining the basics of Solana Full Stack. However, they failed to address two keys bugs that frustrated me for a while.

### Error + Fix 1

Upgrades to `@project-serum/anchor` depreciated the old syntax of program interaction. I couldn't find any resources on how to interact correctly with `anchor ^0.25`  which made me extremely frustrated for a long time (the documentation is trash imo). I finally stumbled upon a working example - I'm sure there's better ways of doing it, but this works..

**Examples of Depreciated Code**

```javascript
// From Example 1
await program.rpc.create({
    accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount]
});

// From Example 3
await program.rpc.initialize(new BN(1234), {
    accounts: {
        myAccount: localAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
    },
    signers: [localAccount],
})
```

The problem is that `program.rpc` is DEPRECIATED (among several other program properties), as noted [HERE](https://coral-xyz.github.io/anchor/ts/classes/Program.html#rpc). After many tries (the documentation is pretty trash imo), I stumbled upon this syntax that works. (there may be other appropriate solutions, but this worked for me).

**Old Syntax**
```typescript
await program.rpc.initialize({
    accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [baseAccount]
});
```
**New Syntax**
```typescript
// create tx
let methodsbuilder = await program.methods.initialize();
// add accounts
methodsbuilder.accounts({
    baseAccount: myAccount.publicKey,
    user: publicKey,
    systemProgram: web3.SystemProgram.programId,
});
// add signer
methodsbuilder.signers([myAccount]);
// send tx
await methodsbuilder.rpc();
```

### Error + Fix 2

After finding the above solution, my `initialize()` function worked correctly but subsequent calls to `increment()` yielded an `AccountNotInitialized` error. For some reason no one in the examples addressed this, and had working examples although the code was nearly identical.

**The Problem** 
In `App.tsx`, the creation of `baseAccount` is done at the highest level of `Content` so that it is not regenerated between the `initialize` and `increment` calls. HOWEVER, React re-renders the page often (idk exactly when, at least when a page item value changes), which re-generates the key of baseAccount.

**The solution**
Use `useMemo()` when generating the baseAccount, which essentially caches the value and avoids recomputing the value until the second parameter value changes.
