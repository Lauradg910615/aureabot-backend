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

const promptAurea = \`
Eres AureaBot, un asistente cálido y experto en atención para Aurea Skincare...
[Inserta aquí tu prompt completo]
\`;

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

app.listen(3000, () => console.log("💫 AureaBot está escuchando en el puerto 3000"));
