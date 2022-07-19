import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useAnchorWallet, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
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
import React, { FC, ReactNode, useMemo, useState } from 'react';
import idl from './idl.json';

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
    const [value, setValue] = useState(null);


    /* create an account  */
    const { publicKey } = useWallet();

    const baseAccount = useMemo(
        () => web3.Keypair.generate(),
        [publicKey]
    );



    const anchorWallet = useAnchorWallet();


    async function getProvider() {

        if (!anchorWallet) {
            throw ("No anchor wallet")
        }
        /* create the provider and return it to the caller */
        /* network set to local network for now */
        // const network = "http://127.0.0.1:8899";
        const network = "https://api.devnet.solana.com";

        // const opts = {
        //     preflightCommitment: "processed"
        // }
        const connection = new Connection(network, "processed");
        const provider = new AnchorProvider(connection, anchorWallet, { "preflightCommitment": "processed" });
        console.log("RPC Endpoint: ", provider.connection.rpcEndpoint)
        return provider;
    }

    async function createCounter() {
        const provider = await getProvider();
        if (!provider || !publicKey) {
            throw ("Provider or publicKey missing")
        }
        console.log("Base: ", baseAccount.publicKey.toString())

        const a = JSON.parse(JSON.stringify(idl));
        const program = new Program(a, idl.metadata.address, provider);

        try {
            // create tx
            let methodsbuilder = await program.methods.initialize();
            methodsbuilder.accounts({
                baseAccount: baseAccount.publicKey,
                user: publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            methodsbuilder.signers([baseAccount])
            // send tx
            await methodsbuilder.rpc();
            // fetch created account
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
            console.log('account: ', account, ' count: ', account.count.toString());
            setValue(account.count.toString());

            // const transaction = new Transaction().add(
            //     tx
            // )
            // await sendTransaction(transaction, connection)
            // await provider.connection.confirmTransaction(signature, 'processed');
            // if (!tx) {
            //     console.log("SHIT")
            //     throw ("ERR: tx undefined")
            // }
            // const signedTx = await provider.wallet.signTransaction(tx);
            // await web3.sendAndConfirmTransaction(provider.connection, signedTx, [baseAccount])
            // tx.add(instruction)
            // await provider.connection.confirmTransaction("processed");
        } catch (err) {
            console.log("Error: ", err)
        }

        console.log("Base end of init: ", baseAccount.publicKey.toString())
    }

    async function increment() {
        console.log("Base start of incr: ", baseAccount.publicKey.toString())
        const provider = await getProvider();
        if (!provider || !publicKey) {
            throw ("Provider or publicKey missing")
        }

        const a = JSON.parse(JSON.stringify(idl));
        const program = new Program(a, idl.metadata.address, provider);

        let incrementTx = await program.methods.increment();
        incrementTx.accounts({ baseAccount: baseAccount.publicKey, })
        await incrementTx.rpc();

        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log('account: ', account, ' address:', account.count.toString());
        setValue(account.count.toString());
    }

    return (
        <div className="App">
            <div>
                {
                    !value && (<button onClick={createCounter}>Create Counter</button>)
                }
                {
                    value && (<button onClick={increment}>Increment Counter</button>)
                }
                {
                    value && value >= Number(0) ? (
                        <h2 style={{ color: 'white' }}>{value}</h2>
                    ) : (
                        <h3 style={{ color: 'white' }}>Please create the counter.</h3>
                    )
                }
            </div>
            {/* <button onClick={createCounter}>Example Button</button> */}
            {/* <button></button> */}
            {/* <div></div> */}
            <WalletMultiButton />
        </div>
    );
};
