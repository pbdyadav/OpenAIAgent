(function () {

  let companySlug = null;
  let conversationId = null;

  const API_URL = "https://openai.imalag.com/api/chat";

  window.agenthub = function (action, slug) {
    if (action === "init") {
      companySlug = slug;

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initWidget);
      } else {
        initWidget();
      }
    }
  };

  function initWidget() {

    injectStyles();

    const bubble = document.createElement("div");
    bubble.id = "agenthub-bubble";
    bubble.innerHTML = "💬";

    const box = document.createElement("div");
    box.id = "agenthub-box";

    box.innerHTML = `
      <div id="agenthub-header">
        <span>Chat Support</span>
        <button id="agenthub-close">×</button>
      </div>

      <div id="agenthub-messages"></div>

      <div id="agenthub-input-area">
        <input id="agenthub-input" placeholder="Type a message..." />
        <button id="agenthub-send">Send</button>
      </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(box);

    bubble.onclick = () => {
      box.style.display = "flex";
      bubble.style.display = "none";
    };

    document.getElementById("agenthub-close").onclick = () => {
      box.style.display = "none";
      bubble.style.display = "flex";
    };

    document.getElementById("agenthub-send").onclick = sendMessage;

    document
      .getElementById("agenthub-input")
      .addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
      });

    loadHistory();
  }

  async function sendMessage() {

    const input = document.getElementById("agenthub-input");
    const msg = input.value.trim();

    if (!msg) return;

    addMessage(msg, "user");
    saveMessage(msg, "user");

    input.value = "";

    showTyping();

    const visitorId =
      localStorage.getItem("agenthub_visitor") ||
      (function () {
        const id = crypto.randomUUID();
        localStorage.setItem("agenthub_visitor", id);
        return id;
      })();

    try {

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companySlug,
          message: msg,
          visitorId,
          conversationId,
        }),
      });

      const data = await res.json();

      removeTyping();

      if (data.response) {

        addMessage(data.response, "bot");
        saveMessage(data.response, "bot");

        conversationId = data.conversationId;

      } else {

        addMessage("Error: " + data.error, "bot");

      }

    } catch (err) {

      removeTyping();
      addMessage("Server error", "bot");

    }
  }

  function addMessage(text, type) {

    const messages = document.getElementById("agenthub-messages");

    const msg = document.createElement("div");
    msg.className = "agenthub-msg " + type;
    msg.innerText = text;

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {

    const messages = document.getElementById("agenthub-messages");

    const typing = document.createElement("div");
    typing.id = "agenthub-typing";
    typing.className = "agenthub-msg bot";
    typing.innerText = "AI is typing...";

    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {

    const typing = document.getElementById("agenthub-typing");

    if (typing) typing.remove();
  }

  function saveMessage(text, type) {

    const history =
      JSON.parse(localStorage.getItem("agenthub_history")) || [];

    history.push({ text, type });

    localStorage.setItem("agenthub_history", JSON.stringify(history));
  }

  function loadHistory() {

    const history =
      JSON.parse(localStorage.getItem("agenthub_history")) || [];

    history.forEach((m) => addMessage(m.text, m.type));
  }

  function injectStyles() {

    const css = document.createElement("style");

    css.innerHTML = `

#agenthub-bubble{
position:fixed;
bottom:20px;
right:20px;
width:60px;
height:60px;
background:#000;
color:white;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:26px;
cursor:pointer;
z-index:999999;
}

#agenthub-box{
position:fixed;
bottom:20px;
right:20px;
width:340px;
height:460px;
background:white;
border-radius:12px;
display:none;
flex-direction:column;
box-shadow:0 8px 30px rgba(66, 52, 225, 0.81);
font-family:sans-serif;
z-index:999999;
}

#agenthub-header{
background:#000;
color:white;
padding:12px;
display:flex;
justify-content:space-between;
align-items:center;
border-radius:12px 12px 0 0;
}

#agenthub-messages{
flex:1;
padding:12px;
overflow:auto;
background:#f5f5f5;
}

.agenthub-msg{
margin:6px 0;
padding:8px 12px;
border-radius:10px;
max-width:80%;
font-size:14px;
}

.agenthub-msg.user{
background:#000;
color:white;
margin-left:auto;
}

.agenthub-msg.bot{
background:#e4e6eb;
}

#agenthub-input-area{
display:flex;
border-top:1px solid #ddd;
}

#agenthub-input{
flex:1;
border:none;
padding:10px;
outline:none;
}

#agenthub-send{
background:#000;
color:white;
border:none;
padding:10px 14px;
cursor:pointer;
}

`;

    document.head.appendChild(css);
  }

})();
