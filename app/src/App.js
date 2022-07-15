import './App.css';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import {
    Program, web3
} from '@project-serum/anchor';
import idl from './idl.json';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');



const wallets = [
    new PhantomWalletAdapter()
]

const { SystemProgram, Keypair } = web3;

// create an account
const baseAccount = Keypair.generate();
const opts = {
    preflightCommitment: "processed"
}

const programId = new PublicKey(idl.metadata.address);

function App() {
    const [account, setAccount] = useState(null)
    useEffect(() => {
        window.solana.on("connect", () => {
            console.log('updated...')
        })
        return () => {
            window.solana.disconnect();
        }
    }, [])

    const wallet = window.solana

    let value;

    async function getProvider() {

        const network = "https://127.0.0.1:8899";
        const connection = new Connection(network, opts.preflightCommitment);

        const provider = new ConnectionProvider(
            connection, wallet, opts.preflightCommitment,
        );
        return provider;
    }

    async function createCounter() {

        const provider = await getProvider()
        // create program interface
        const program = new Program(idl, programId, provider);

        try {
            /* interact with the program via rpc */
            await program.create({
                accounts: {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
                signers: [baseAccount]
            }).rpc();
            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
            console.log('account: ', account.count.toString());
            value = account.count.toString()
        } catch (err) {
            console.log("Transaction error: ", err);
        }
    }

    async function increment() {
        const provider = await getProvider();
        console.log("yur", programId)
        const program = new Program(idl, programId, provider);
        await program.increment({
            accounts: {
                baseAccount: baseAccount.publicKey
            }
        }).rpc();

        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log('account: ', account.count.toString());
        // setValue(account.count.toString());
    }

    if (!wallet.connected) {
        /* If the user's wallet is not connected, display connect wallet button. */
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <WalletMultiButton />
            </div>
        )
    } else {
        return (
            <div className="App">
                <div>
                    {
                        !value && (<button onClick={createCounter}>Create counter</button>)
                    }
                    {
                        value && <button onClick={increment}>Increment counter</button>
                    }

                    {
                        value && value >= Number(0) ? (
                            <h2>{value}</h2>
                        ) : (
                            <h3>Please create the counter.</h3>
                        )
                    }
                </div>
            </div>
        );
    }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
    <ConnectionProvider endpoint="http://127.0.0.1:8899">
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <App />
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
)

export default AppWithProvider;
