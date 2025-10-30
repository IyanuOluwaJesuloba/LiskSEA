# LiskSEA - Smart Contracts

A collection of ERC20 Token and ERC721 NFT smart contracts deployed on Lisk Sepolia testnet.

## Overview

This project contains two main contracts:
- **LToken (ERC20)** - A fungible token with minting capabilities
- **LNFT (ERC721)** - A non-fungible token with URI storage and flexible minting


### LNFT (ERC721)

**Features:**
- Standard ERC721 with URI storage
- Token counter for sequential IDs
- Owner-restricted minting (`safeMint`)
- Public minting (`mint`)
- Name: "LiskSEA NFT"
- Symbol: "LNFT"


### LToken (ERC20)
- **Name:** LiskSEA Token
- **Symbol:** LSEA
- **Decimals:** 18
- **Initial Supply:** 1,000,000 tokens
- **Features:** Mintable by owner
- **Contract Address:** 0xFD25E23c2AAc3917e9e777D488Dd62724AFeE536

### LNFT (ERC721)
- **Name:** LiskSEA NFT
- **Symbol:** LNFT
- **Features:** 
  - URI storage for metadata
  - Owner-restricted minting (safeMint)
  - Public minting (mint)
- **Contract Address:** 0x83f279d1FC6804a42835e5Ad152477425323e49A

**Key Functions:**
```solidity
function safeMint(address to, string memory uri) public onlyOwner
function mint(string memory uri) public
function totalSupply() public view returns (uint256)
```

