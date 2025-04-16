(function() {
  const caja = document.createElement("div");
  caja.id = "aurea-chat-box";
  caja.style = "position:fixed; bottom:20px; right:20px; z-index:9999;";
  caja.innerHTML = `
    <textarea id="chat-input" placeholder="Escríbeme..." rows="2" style="width:200px;"></textarea>
    <button id="chat-send">Enviar</button>
    <div id="chat-response" style="margin-top:8px;"></div>
  `;
  document.body.appendChild(caja);

  document.getElementById("chat-send").onclick = async function() {
    const msg = document.getElementById("chat-input").value;
    const shop = Shopify && Shopify.shop;
    const resp = document.getElementById("chat-response");
    resp.innerText = "⏳ Pensando…";
    try {
      const r = await fetch("https://aureabot-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, shop })
      });
      const j = await r.json();
      resp.innerText = j.reply || "❌ Falló la respuesta.";
    } catch {
      resp.innerText = "❌ Error de red.";
    }
  };
})();
