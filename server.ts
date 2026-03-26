import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage (resets on restart)
(global as any).orders = [];
(global as any).users = new Set(); // To track unique users for broadcast
(global as any).posts = {}; // { messageId: { stock, groupId, productId, ... } }
(global as any).scheduledPosts = []; // [{ id, productId, scheduledAt, ... }]
(global as any).customers = {}; // { userId: { name, username, orderCount, isLoyal } }
(global as any).settings = {
  paymentInfo: "💳 Karta: 8600 0000 0000 0000\n👤 Ism: Ruslan Market"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.get("/api/orders", (req, res) => {
    res.json({ orders: (global as any).orders });
  });

  app.get("/api/customers", (req, res) => {
    const customers = Object.entries((global as any).customers || {}).map(([id, data]: [string, any]) => ({
      id,
      ...data
    }));
    res.json({ customers });
  });

  app.get("/api/stats", (req, res) => {
    const orders = (global as any).orders || [];
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: any) => o.status === 'Bajarildi').length;
    
    // Simple revenue calculation (stripping commas/spaces from price)
    const totalRevenue = orders
      .filter((o: any) => o.status === 'Bajarildi')
      .reduce((acc: number, curr: any) => {
        // This is a bit hacky since price is a string, but let's try to parse it
        // Assuming price format like "25,000" or "25000"
        const price = parseInt(curr.productId.split('_')[1]) || 0; // Fallback if we had price in order
        // Actually, let's just count occurrences for now if price isn't stored in order
        return acc + 1; 
      }, 0);

    const productStats = orders.reduce((acc: any, curr: any) => {
      acc[curr.productId] = (acc[curr.productId] || 0) + 1;
      return acc;
    }, {});

    const topProducts = Object.entries(productStats)
      .map(([id, count]) => ({ id, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalOrders,
      completedOrders,
      topProducts
    });
  });

  app.post("/api/customers/bonus", async (req, res) => {
    const { userId, message } = req.body;
    const { sendBonusMessage } = await import("./api/bot.ts");
    const success = await sendBonusMessage(userId, message);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/orders/status", (req, res) => {
    const { orderId, status } = req.body;
    const order = (global as any).orders.find((o: any) => o.id === orderId);
    if (order) {
      order.status = status;
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  });

  app.get("/api/settings", (req, res) => {
    res.json((global as any).settings);
  });

  app.post("/api/settings", (req, res) => {
    (global as any).settings = { ...(global as any).settings, ...req.body };
    res.json({ success: true });
  });

  app.post("/api/broadcast", async (req, res) => {
    const { message } = req.body;
    const { broadcastMessage } = await import("./api/bot.ts");
    const count = await broadcastMessage(message);
    res.json({ success: true, count });
  });

  app.post("/api/bot", async (req, res) => {
    const { handleBotRequest } = await import("./api/bot.ts");
    await handleBotRequest(req, res);
  });

  app.post("/api/send-post", async (req, res) => {
    const { handleSendPost } = await import("./api/send-post.ts");
    await handleSendPost(req, res);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Set Telegram Webhook if APP_URL is provided
    if (process.env.APP_URL && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const { Telegraf } = await import('telegraf');
        const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
        const webhookUrl = `${process.env.APP_URL}/api/bot`;
        await bot.telegram.setWebhook(webhookUrl);
        console.log(`Webhook set to: ${webhookUrl}`);
      } catch (err) {
        console.error('Failed to set webhook:', err);
      }
    }
  });
}

startServer();
