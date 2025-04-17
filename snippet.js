export default (req, res) => {
  const snippet = `
    <!-- Chatbox de AureaBot -->
    <div id="chat-box" style="position:fixed;bottom:20px;right:20px;z-index:9999;…">
      <!-- tu HTML de chat aquí -->
    </div>
    <script>
      async function sendMessage() {
        const input = document.getElementById("chat-input").value;
        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ message: input, shop: Shopify.shop })
        });
        const json = await res.json();
        document.getElementById("chat-response").innerText = json.reply;
      }
    </script>
  `;
  res.setHeader("Content-Type", "application/javascript");
  res.send(snippet);
};
