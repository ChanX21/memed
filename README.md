# Memed

## Overview
Memed is a decentralized finance (DeFi) platform built on the Binance Smart Chain (BSC) that allows users to create, trade, and engage with meme tokens. The platform combines the fun of meme culture with the innovative features of blockchain technology, enabling users to create unique tokens, participate in battles, and trade seamlessly.

## Features
- **Token Creation**: Users can create their own meme tokens with customizable names and tickers.
- **Trading**: Engage in trading through bonding curves, allowing for dynamic pricing based on supply and demand.
- **Meme Battles**: Participate in exciting battles between tokens, where users can vote for their favorites.
- **Trending Tokens**: Discover and interact with trending meme tokens in the community.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- Yarn or npm
- A local Ethereum development environment (e.g., Hardhat)
- BSC network setup (e.g., using MetaMask)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/memed.git
   cd memed
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   # For backend
   cd backend
   npm install

   # For frontend
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory and add your Telegram bot token:
     ```
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token
     ```

4. Deploy the smart contracts to the BSC network:
   - Navigate to the `contracts` directory and run:
     ```bash
     npx hardhat run scripts/deploy.js --network bsc
     ```

5. Start the backend server:
   ```bash
   cd ../backend
   npm start
   ```

6. Start the frontend application:
   ```bash
   cd ../frontend
   npm start
   ```

## Usage
- **Interacting with the Telegram Bot**: Use the `/start` command to initiate interaction with the bot and explore the available options.
- **Creating Tokens**: Follow the prompts in the frontend application to create your own meme tokens.
- **Participating in Battles**: Engage in battles by voting for your favorite tokens and track their performance.

## Smart Contracts
The project includes several smart contracts:
- **MemedToken**: ERC20 token implementation for meme tokens.
- **MemedBattle**: Logic for managing battles between tokens.
- **MemedFactory**: Factory contract for creating and managing meme tokens.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For any inquiries or support, please reach out to the project maintainers via GitHub.

---

Thank you for your interest in Memed! We hope you enjoy creating and trading your meme tokens on the Binance Smart Chain.