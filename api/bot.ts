import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN || '8326288974:AAFmmfXJAJXH6mg68IjKNt8mbHO12uzAdss';
const adminId = process.env.ADMIN_ID || '8215056224';
const appUrl = process.env.APP_URL || '';

const bot = new Telegraf(token);

// Track users for broadcast
bot.use((ctx, next) => {
  if (ctx.from) {
    if (!(global as any).users) (global as any).users = new Set();
    (global as any).users.add(ctx.from.id);
  }
  return next();
});

// Premium sticker ID (example)
const WELCOME_STICKER = 'CAACAgIAAxkBAAEL_...'; // Replace with actual ID if needed
const SUCCESS_STICKER = 'CAACAgIAAxkBAAEL_...';

bot.start(async (ctx) => {
  const userId = ctx.from.id.toString();
  
  if (userId === adminId) {
    try {
      // Try to send a sticker
      await ctx.replyWithSticker('CAACAgIAAxkBAAEL_...').catch(() => {});
    } catch (e) {}

    return ctx.reply('Xush kelibsiz, Admin!', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📝 Post Generator (Sayt)',
              web_app: { url: appUrl }
            }
          ]
        ]
      }
    });
  } else {
    return ctx.reply('Assalomu alaykum! 🛍\n\nBizning do\'konimizga xush kelibsiz. Eng so\'nggi aksiyalarni kanalda kuzatib boring!');
  }
});

bot.command('myorders', async (ctx) => {
  const userId = ctx.from.id.toString();
  const orders = (global as any).orders || [];
  const userOrders = orders.filter((o: any) => o.userLink.includes(userId) || (ctx.from.username && o.userLink.includes(ctx.from.username)));

  if (userOrders.length === 0) {
    return ctx.reply('Sizda hali buyurtmalar yo\'q. 🛍');
  }

  let message = '🛍 SIZNING BUYURTMALARINGIZ:\n\n';
  userOrders.forEach((o: any, i: number) => {
    message += `${i + 1}. 📦 ID: ${o.productId}\n`;
    message += `📊 Holati: ${o.status}\n`;
    message += `📅 Sana: ${new Date(o.timestamp).toLocaleDateString()}\n\n`;
  });

  return ctx.reply(message);
});

// Handle "Sotib olaman" callback
bot.on('callback_query', async (ctx) => {
  const data = (ctx.callbackQuery as any).data;
  if (data && data.startsWith('buy_')) {
    const productId = data.replace('buy_', '');
    const user = ctx.from;
    const userLink = user.username ? `@${user.username}` : `tg://user?id=${user.id}`;
    const messageId = ctx.callbackQuery.message?.message_id;
    const chatId = ctx.callbackQuery.message?.chat.id;

    // Check stock
    const postInfo = (global as any).posts[messageId || ''];
    if (postInfo && postInfo.stock <= 0) {
      await ctx.answerCbQuery('Kechirasiz, bu mahsulot tugadi! ❌');
      return;
    }

    // Decrement stock
    if (postInfo) {
      postInfo.stock -= 1;
      if (postInfo.stock <= 0) {
        // Update post to "SOTILDI"
        try {
          await bot.telegram.editMessageCaption(chatId, messageId, undefined, `❌ SOTILDI • ${productId}\n\nBu mahsulot barcha xaridorlar tomonidan sotib olindi.`, {
            reply_markup: { inline_keyboard: [] }
          });
        } catch (e) { console.error('Failed to update sold out post', e); }
      }
    }
    
    // Track customer orders
    if (!(global as any).customers) (global as any).customers = {};
    const userIdStr = user.id.toString();
    if (!(global as any).customers[userIdStr]) {
      (global as any).customers[userIdStr] = { 
        name: user.first_name, 
        username: user.username, 
        orderCount: 0,
        isLoyal: false
      };
    }
    (global as any).customers[userIdStr].orderCount += 1;
    if ((global as any).customers[userIdStr].orderCount >= 3) {
      (global as any).customers[userIdStr].isLoyal = true;
    }
    const isLoyal = (global as any).customers[userIdStr].isLoyal;

    // Send message to admin
    await bot.telegram.sendMessage(adminId, `🔔 YANGI BUYURTMA!\n\n📦 Mahsulot ID: ${productId}\n👤 Mijoz: ${user.first_name} (${userLink})\n${isLoyal ? '⭐ LOYAL MIJOZ!' : ''}\n\n"ID: ${productId} olaman"`);
    
    // Store order in global array for Web App
    if (!(global as any).orders) (global as any).orders = [];
    (global as any).orders.push({
      id: Date.now().toString(),
      productId,
      userName: user.first_name,
      userLink,
      status: 'Yangi',
      timestamp: new Date().toISOString(),
      isLoyal
    });

    // Answer callback
    await ctx.answerCbQuery('Buyurtmangiz adminga yuborildi! ✅');
    
    // Send payment info to user
    const settings = (global as any).settings || {};
    await ctx.reply(`Buyurtmangiz qabul qilindi! ✅\n\nTo'lov ma'lumotlari:\n${settings.paymentInfo}\n\nTo'lovdan so'ng chekni adminga yuboring.`);
  }
});

// For Vercel Serverless Function
export default async function handler(req: any, res: any) {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
}

// For custom server.ts
export async function handleBotRequest(req: any, res: any) {
    try {
        await bot.handleUpdate(req.body);
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
}

export const sendBonusMessage = async (userId: string, message: string) => {
  try {
    await bot.telegram.sendMessage(userId, message);
    return true;
  } catch (e) {
    console.error(`Failed to send bonus to ${userId}`, e);
    return false;
  }
};

export const broadcastMessage = async (message: string) => {
  const users = Array.from((global as any).users || []);
  let count = 0;
  for (const userId of users) {
    try {
      await bot.telegram.sendMessage(userId as number, message);
      count++;
    } catch (e) {
      console.error(`Failed to send broadcast to ${userId}`, e);
    }
  }
  return count;
};
