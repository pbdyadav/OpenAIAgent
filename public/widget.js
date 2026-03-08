(function () {

  const apiUrl = "https://ftt.imalag.com/api/chat";
  const botId = window.AGENTHUB_BOT || "ftt";

  function createWidget() {

    const bubble = document.createElement("div");
    bubble.id = "ftt-chat-bubble";
    bubble.innerHTML = "💬";

    const box = document.createElement("div");
    box.id = "ftt-chat-box";

    box.innerHTML = `
      <div id="ftt-header">
        <span>Chat Support</span>
        <button id="ftt-close">×</button>
      </div>
      <div id="ftt-messages"></div>
      <div id="ftt-input-area">
        <input id="ftt-input" placeholder="Type a message..." />
        <button id="ftt-send">Send</button>
      </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(box);

    bubble.onclick = () => {
      box.style.display = "flex";
      bubble.style.display = "none";
    };

    document.getElementById("ftt-close").onclick = () => {
      box.style.display = "none";
      bubble.style.display = "flex";
    };

    document.getElementById("ftt-send").onclick = sendMessage;

    document
      .getElementById("ftt-input")
      .addEventListener("keypress", function (e) {
        if (e.key === "Enter") sendMessage();
      });
  }

  async function sendMessage() {

    const input = document.getElementById("ftt-input");
    const msg = input.value.trim();

    if (!msg) return;

    addMessage(msg, "user");

    input.value = "";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot: botId,
        message: msg,
      }),
    });

    const data = await res.json();

    addMessage(data.reply, "bot");
  }

  function addMessage(text, type) {

    const messages = document.getElementById("ftt-messages");

    const msg = document.createElement("div");
    msg.className = "ftt-msg " + type;
    msg.innerText = text;

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function injectStyles() {

    const css = document.createElement("style");

    css.innerHTML = `

#ftt-chat-bubble{
position:fixed;
bottom:20px;
right:20px;
width:60px;
height:60px;
background:#007bff;
color:white;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:26px;
cursor:pointer;
box-shadow:0 4px 20px rgba(0,0,0,0.2);
z-index:9999;
}

#ftt-chat-box{
position:fixed;
bottom:20px;
right:20px;
width:320px;
height:420px;
background:white;
border-radius:12px;
display:none;
flex-direction:column;
box-shadow:0 8px 30px rgba(0,0,0,0.2);
font-family:sans-serif;
z-index:9999;
}

#ftt-header{
background:#007bff;
color:white;
padding:12px;
display:flex;
justify-content:space-between;
align-items:center;
border-radius:12px 12px 0 0;
}

#ftt-messages{
flex:1;
padding:10px;
overflow:auto;
background:#f5f5f5;
}

.ftt-msg{
margin:6px 0;
padding:8px 12px;
border-radius:10px;
max-width:80%;
}

.ftt-msg.user{
background:#007bff;
color:white;
margin-left:auto;
}

.ftt-msg.bot{
background:#e4e6eb;
}

#ftt-input-area{
display:flex;
border-top:1px solid #ddd;
}

#ftt-input{
flex:1;
border:none;
padding:10px;
outline:none;
}

#ftt-send{
background:#007bff;
color:white;
border:none;
padding:10px 14px;
cursor:pointer;
}

`;

    document.head.appendChild(css);
  }

  function init() {
    injectStyles();
    createWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
