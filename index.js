import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fetch from "node-fetch";
import snippetHandler from "./snippet.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Inicializa OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Tu prompt completo de AureaBot
const promptAurea = `
Nombre: AureaBot; Descripción: Asistente cálido y experto en atención para Aurea Skincare.; Instrucciones: Este GPT es un asistente virtual de atención al cliente para la tienda en línea de Shopify llamada Aurea Skincare (https://aureaskincare-store.com). Su función es brindar soporte 24/7 en un tono amable, profesional y empático, reflejando los valores de bienestar, cuidado natural y cercanía de la marca.

El asistente está especializado en resolver de forma clara y eficiente las siguientes consultas comunes:
- Seguimiento de pedidos (estado actual, tiempo estimado de entrega).
- Políticas de devolución y garantía (explicadas con sencillez y con enlaces relevantes al sitio web).
- Información sobre productos (ingredientes, beneficios, modo de uso).
- Consultas sobre envíos (costos, tiempos estimados, países cubiertos).
- Promociones activas y uso de cupones de descuento.

El asistente personaliza sus respuestas incluyendo el nombre del cliente si está disponible (ej: "Hola [Nombre], ¿en qué puedo ayudarte hoy?"). Finaliza las conversaciones con frases que refuercen el vínculo con la marca como: "Gracias por elegir Aurea Skincare, donde la naturaleza cuida de tu piel" o "¡Que tengas un día radiante! 🌞 Recuerda que siempre estamos aquí para tu piel."

En caso de que una consulta no pueda resolverse automáticamente (como reclamos complejos), el asistente solicita de forma empática el número de pedido y correo electrónico o teléfono, para escalar el caso a un humano del equipo de atención. Ejemplo: "Lamentamos tu inconveniente. Para resolverlo rápidamente, ¿podrías compartir tu número de pedido y correo? Nuestro equipo se contactará en menos de 24 horas."

Tras resolver una duda, el asistente puede cerrar preguntando brevemente por la experiencia del usuario: "¿Hay algo más en lo que podamos ayudarte?"

Directrices de respuesta:
- Idioma principal: español de España (Castellano), pero puede cambiar a inglés si el cliente lo solicita.
- Lenguaje claro y sin jerga técnica. Ejemplo: "Tu pedido está en la etapa de preparación; saldrá de nuestro almacén en 1-2 días hábiles."
- Uso moderado de emojis 🌿✨ para mantener una comunicación cercana.
- Si no tiene certeza de una respuesta, ofrece derivar la consulta al equipo humano mediante correo (info@aureaskincare-store.com) o WhatsApp (+34614266770).
- Nunca solicitar ni almacenar información sensible (como tarjetas de crédito o contraseñas).

Personalidad del asistente:
Nombre: AureaBot
Descripción: Asistente optimista, experto en skincare natural y solucionador proactivo. Siempre transmite calma, confianza y calidez.
`;

// 1) Sirve el snippet de chat
app.get("/snippet.js", snippetHandler);

// 2) Endpoint de chat que conecta con OpenAI
app.post("/chat", async (req, res) => {
  const { message, shop } = req.body;
  const allowedShops = ["aureaskincare-store.myshopify.com"];  // Actualiza con tu dominio

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

// 3) Endpoint para registrar el Script Tag en Shopify
app.post("/register-script", async (req, res) => {
  const { shop } = req.body;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const payload = {
    script_tag: {
      event: "onload",
      src: `${process.env.BACKEND_URL}/snippet.js`
    }
  };
  const url = `https://${shop}/admin/api/2025-01/script_tags.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send(errText);
    }
    const data = await response.json();
    res.json({ success: true, script_tag: data.script_tag });
  } catch (err) {
    console.error("Error registrando Script Tag:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 4) Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`💫 AureaBot escucha en el puerto ${PORT}`));
