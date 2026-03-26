import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_BOT_TOKEN || '8326288974:AAFmmfXJAJXH6mg68IjKNt8mbHO12uzAdss';
const bot = new Telegraf(token);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { groupIds, productId, title, subtitle, description, price, discountPrice, duration, images, video, stock, scheduledAt } = req.body;

  if (!groupIds || !Array.isArray(groupIds) || !productId || !description || (!images && !video)) {
    return res.status(400).send('Missing required fields');
  }

  const sendPost = async () => {
    try {
      const generateCaption = (isExpired: boolean) => {
        let caption = `📦 ${title || 'MAHSULOT'}\n`;
        caption += `📝 ${subtitle || 'Flash Sale'}\n\n`;
        caption += `${description}\n\n`;
        caption += `#FlashSale #Chegirmalar #Aksiyalar #RuslanMarket\n\n`;
        
        if (!isExpired) {
          caption += `Narxlar:\n`;
          caption += `🔴 ${price} — eski narx\n`;
          caption += `🟢 ${discountPrice} ✅ — sizga\n\n`;
          if (stock) caption += `📦 Ombor: ${stock} ta qoldi\n\n`;
          caption += `🔥 Aksiya faqat belgilangan vaqt davom etadi!\n`;
          caption += `🔥 Ulguring — miqdor cheklangan!\n\n`;
          caption += `🔸 Xarid qilish uchun quyidagi tugmani bosing:`;
        } else {
          caption += `Narxlar:\n`;
          caption += `🔴 ${price} — narx (aksiya tugadi)\n\n`;
          caption += `❌ Aksiya muddati tugadi.`;
        }
        return caption;
      };

      const caption = generateCaption(false);
      
      const media: any[] = [];
      if (video) {
        const base64Data = video.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        media.push({
          type: 'video',
          media: { source: buffer },
          caption: (images && images.length === 0) ? caption : '',
        });
      }
      if (images && Array.isArray(images)) {
        images.forEach((base64: string, index: number) => {
          const base64Data = base64.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          media.push({
            type: 'photo',
            media: { source: buffer },
            caption: (index === 0 && !video) ? caption : '',
          });
        });
      }

      for (const groupId of groupIds) {
        const messages = await bot.telegram.sendMediaGroup(groupId, media);
        
        if (messages && messages.length > 0) {
          const messageId = messages[0].message_id;
          
          // Add inline buttons to the first message (the one with the caption)
          await bot.telegram.editMessageReplyMarkup(groupId, messageId, undefined, {
            inline_keyboard: [
              [
                { text: '🛒 Sotib olaman', callback_data: `buy_${productId}` },
                { text: '💬 Aloqa qilish', url: `https://t.me/${(await bot.telegram.getMe()).username}` }
              ]
            ]
          });

          await bot.telegram.pinChatMessage(groupId, messageId);

          // Track post info for stock
          if (!(global as any).posts) (global as any).posts = {};
          (global as any).posts[messageId] = { stock: parseInt(stock || '0'), groupId, productId };

          // Set timer to remove discount
          if (duration > 0) {
            setTimeout(async () => {
              try {
                const expiredCaption = generateCaption(true);
                await bot.telegram.editMessageCaption(groupId, messageId, undefined, expiredCaption);
                // Remove buttons or update them
                await bot.telegram.editMessageReplyMarkup(groupId, messageId, undefined, {
                  inline_keyboard: [
                    [
                      { text: '💬 Aloqa qilish', url: `https://t.me/${(await bot.telegram.getMe()).username}` }
                    ]
                  ]
                });
              } catch (err) {
                console.error('Failed to update expired post:', err);
              }
            }, duration * 60 * 1000);
          }
        }
      }
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  if (scheduledAt) {
    const delay = new Date(scheduledAt).getTime() - Date.now();
    if (delay > 0) {
      const scheduledId = Date.now().toString();
      if (!(global as any).scheduledPosts) (global as any).scheduledPosts = [];
      (global as any).scheduledPosts.push({
        id: scheduledId,
        productId,
        title,
        scheduledAt,
        groupIds
      });
      
      setTimeout(async () => {
        await sendPost();
        // Remove from list after sending
        (global as any).scheduledPosts = (global as any).scheduledPosts.filter((p: any) => p.id !== scheduledId);
      }, delay);
      
      return res.status(200).json({ success: true, scheduled: true });
    }
  }

  const success = await sendPost();
  if (success) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send post' });
  }
}

export async function handleSendPost(req: any, res: any) {
    return handler(req, res);
}
