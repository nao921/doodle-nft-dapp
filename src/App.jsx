import React, {useEffect, useState} from 'react';
import './styles/App.css';
import githubLogo from './assets/github.svg';

import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const GITHUB_HANDLE = 'kuriakinzeng';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;
const CREATOR_NAME = 'KZ';
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = '0x9D39Be59A73bbCC93878a1B271ED2548cCacFfa8'

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [totalNftMinted, setTotalNftMinted] = useState("");
  const [mintingFlag, setMintingFlag] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log('No authorized account found');
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain ", chainId);
        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network");
          return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        let txn = await connectedContract.makeAnEpicNFT();
        console.log('Mining...');
        setMintingFlag(true);

        await txn.wait();
        setMintingFlag(false);
        console.log(`Mined, see txn https://rinkeby.etherscan.io/tx/${txn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist");
      }
      
    } catch (error) {
      console.log(error);
    }

  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on Rarible. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`);

          updateTotalNFTsMintedSoFar();
        });

      } else {
        console.log('Ethereum object not found');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateTotalNFTsMintedSoFar = async() => {
    try {
      const { ethereum } = window;

      if(!ethereum){
        console.log('No ethereum object')
      } else {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);
        let totalNFTsMintedSoFar = await connectedContract.getTotalNFTsMintedSoFar();
        console.log(totalNFTsMintedSoFar.toNumber());
        setTotalNftMinted(totalNFTsMintedSoFar.toNumber());
      }

    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get metamask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts'});

      setCurrentAccount(accounts[0]);

      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect Wallet
    </button>
  );

  const renderMintButton = () => {
    return mintingFlag ?
    (
      <div className="minting">Minting in progress...</div>
    ) 
    :
    (
      <button className="cta-button mint-button" onClick={askContractToMintNft}>
        Mint NFT
      </button>
    );
  }

  const viewCollection = () => {
    const link = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}`
    window.open(link, "blank");
  }

  useEffect(() => {
    updateTotalNFTsMintedSoFar();
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Rick & Morty Names NFT Collection</p>
          <p className="sub-text">
            Pickle Rick. Evil Morty. Space Beth. And many more.
          </p>
          <p className="remaining-text">
            Only {TOTAL_MINT_COUNT - totalNftMinted} left
          </p>
          <div>
            <button className="cta-button view-collection-button" onClick={viewCollection}>
                View Collection on Rarible
            </button>
          </div>
          {currentAccount === "" ? renderNotConnectedContainer() 
          : renderMintButton()}
          
        </div>
        <div className="footer-container">
          <img alt="Github Logo" className="github-logo" src={githubLogo} />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${CREATOR_NAME}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;