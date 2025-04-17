import snippetHandler from "./snippet.js";
app.get("/snippet.js", snippetHandler);
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const promptAurea = "Eres AureaBot, un asistente cálido y experto en atención para Aurea Skincare.";

app.post("/chat", async (req, res) => {
  const { message, shop } = req.body;

  // Validación básica de tienda autorizada
  const allowedShops = ["aureaskincare-store.myshopify.com"];
  if (!allowedShops.includes(shop)) {
    return res.status(403).json({ error: "Tienda no autorizada" });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: promptAurea },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Error al contactar con OpenAI:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});
app.post("/register-script", async (req, res) => {
  const shop = req.body.shop;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  const payload = { script_tag: { event: "onload", src: `${process.env.BACKEND_URL}/snippet.js` } };
  const url = `https://${shop}/admin/api/2025-01/script_tags.json`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) return res.status(resp.status).send(await resp.text());
  res.send("registered");
});
app.listen(3000, () => console.log("💫 AureaBot está escuchando en el puerto 3000"));
