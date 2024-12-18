import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../clients/prisma.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
// The URL should start with 'https://' and be properly formatted
const MINI_APP_URL = 'https://memed.fun'; // Replace with your actual web app URL

export class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    this.setupHandlers();
    console.log('Telegram bot initialized');
  }

  private async sendMainMenu(chatId: number) {
    try {
      const welcomeMessage = `🌟 Welcome to Memed - Your Premier DeFi Meme Token Creator!

Here’s what you can explore:
• Create your own unique meme tokens
• Trade tokens seamlessly using bonding curves
• Graduate tokens to DEX for wider reach
• Engage in exciting meme battles

Would you like to:
1. Create a new token 🎨
2. Discover how it works
3. View trending memes 🔥

Simply click one of the buttons below to get started!`;

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{
              text: '🎨 Create Token',
              web_app: {
                url: MINI_APP_URL
              }
            }],
            [{ text: 'How it Works', callback_data: 'how_it_works' }],
            [{ text: '🔥 Trending Memes', callback_data: 'trending' }]
          ]
        }
      };

      await this.bot.sendPhoto(chatId, 'https://ibb.co/SPsqrZC', { caption: 'Welcome to Memed!' });
      await this.bot.sendMessage(chatId, welcomeMessage, keyboard);
    } catch (error) {
      console.error('Error sending main menu:', error);
      await this.bot.sendMessage(chatId, 'Apologies, there was an error. Please try again later.');
    }
  }

  private setupHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      try {
        await this.sendMainMenu(msg.chat.id);
      } catch (error) {
        console.error('Error handling /start command:', error);
      }
    });

    // Handle callback queries
    this.bot.on('callback_query', async (query) => {
      try {
        if (!query.message) return;
        
        const chatId = query.message.chat.id;

        switch (query.data) {
          case 'how_it_works':
            const howItWorksMessage = `🔮 Understanding Memed:

1️⃣ Create Your Token:
- Select a name and ticker
- Upload your meme image
- Pay a nominal creation fee

2️⃣ Bonding Curve Phase:
- Users can buy/sell tokens
- Price escalates with supply
- Automatic liquidity generation

3️⃣ Graduation:
- Upon sufficient liquidity collection
- Token transitions to PancakeSwap
- Trading becomes fully decentralized

Are you ready to create your first token? 🚀`;
            
            await this.bot.sendMessage(chatId, howItWorksMessage, {
              reply_markup: {
                inline_keyboard: [
                  [{
                    text: '🎨 Create Token Now',
                    web_app: {
                      url: MINI_APP_URL
                    }
                  }],
                  [{ text: '« Back to Menu', callback_data: 'menu' }]
                ]
              }
            });
            break;

          case 'trending':
            try {
              const trendingTokens = await prisma.token.findMany({
                take: 5,
                orderBy: {
                  comments: {
                    _count: 'desc'
                  }
                }
              });

              let trendingMessage = '🔥 Trending Meme Tokens:\n\n';
              trendingTokens.forEach((token, index) => {
                trendingMessage += `${index + 1}. ${token.address}\n`;
              });

              await this.bot.sendMessage(chatId, trendingMessage, {
                reply_markup: {
                  inline_keyboard: [
                    [{
                      text: '🎨 Create Your Own',
                      web_app: {
                        url: MINI_APP_URL
                      }
                    }],
                    [{ text: '« Back to Menu', callback_data: 'menu' }]
                  ]
                }
              });
            } catch (error) {
              console.error('Error fetching trending tokens:', error);
              await this.bot.sendMessage(chatId, 'Sorry, we are unable to fetch trending tokens at the moment.');
            }
            break;

          case 'menu':
            if (query.message) {
              await this.bot.deleteMessage(chatId, query.message.message_id);
              await this.sendMainMenu(chatId);
            }
            break;
        }

        // Answer callback query to remove loading state
        await this.bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('Error handling callback query:', error);
        if (query.message) {
          await this.bot.sendMessage(query.message.chat.id, 'Sorry, there was an error. Please try again.');
        }
      }
    });

    // Error handling for polling errors
    this.bot.on('polling_error', (error) => {
      console.error('Telegram bot polling error:', error);
    });

    // Handle other errors
    this.bot.on('error', (error) => {
      console.error('Telegram bot error:', error);
    });
  }
} 