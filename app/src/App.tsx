import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useAnchorWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    Program,
    AnchorProvider,
    web3,
    BN
} from '@project-serum/anchor';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
import idl from './idl.json';
import { Transaction } from '@solana/web3.js';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                appIdentity: { name: 'Solana Create React App Starter App' },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
            }),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useAnchorWallet();

    function getProvider() {
        if (!wallet) {
            return null;
        }

        const network = "https://127.0.0.1:8899";
        const connection = new Connection(network, "processed");

        const provider = new AnchorProvider(connection, wallet, { "preflightCommitment": "processed" });

        return provider
    }

    async function createCounter() {
        const baseAccount = web3.Keypair.generate();
        const provider = getProvider();
        if (!provider) {
            throw ("Provider is null")
        }

        const a = JSON.parse(JSON.stringify(idl));
        const program = new Program(a, idl.metadata.address, provider);

        if (!program) {
            console.log("AHHHHHHH")
        }

        try {

            // const inst = program.state?.transaction

            // const transaction = new web3.Transaction().add(
            //     inst.initialize({
            //         accounts: {
            //             baseAccount: baseAccount.publicKey,
            //             user: wallet.publicKey,
            //             systemProgram: anchor.web3.SystemProgram.programId,
            //         }
            //     })
            // );
            // const tx = new Transaction()

            console.log(idl.metadata.address)

            console.log(baseAccount.publicKey.toString())

            const tx = await program.methods.initialize({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signer: [baseAccount]
            }).rpc();

            if (!tx) {
                console.log("SHIT")
                throw ("ERR: tx undefined")
            }

            // const signedTx = await provider.wallet.signTransaction(tx);


            // await web3.sendAndConfirmTransaction(provider.connection, signedTx, [baseAccount])


            // tx.add(instruction)



            // await provider.connection.confirmTransaction("processed");


            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
            console.log('account: ', account);
        } catch (err) {
            console.log("Error: ", err)
        }
    }

    return (
        <div className="App">
            <button onClick={createCounter}>Example Button</button>
            <WalletMultiButton />
        </div>
    );
};
