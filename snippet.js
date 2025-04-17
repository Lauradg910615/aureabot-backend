// snippet.js
export default (req, res) => {
  const snippet = `
    <!-- Chatbox de AureaBot -->
    <div id="chat-box" style="position:fixed;bottom:20px;right:20px;z-index:9999;…">
      <!-- tu HTML de chat aquí -->
    </div>
    <script>
      async function sendMessage() {
        /* tu lógica de fetch a /chat */
      }
    </script>
  `;
  res.setHeader("Content-Type", "application/javascript");
  res.send(snippet);
};
