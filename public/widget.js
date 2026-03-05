(function () {
  let companySlug = null;
  let conversationId = null;

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
    const button = document.createElement("button");

    button.id = "agenthub-chat-button";   // ⭐ important

    button.innerText = "Chat";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.padding = "12px 18px";
    button.style.background = "#000";
    button.style.color = "#fff";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.zIndex = "999999";

    button.onclick = openChat;

    document.body.appendChild(button);
  }

  function openChat() {
    const message = prompt("Ask something:");
    if (!message) return;

    const visitorId =
      localStorage.getItem("agenthub_visitor") ||
      (function () {
        const id = crypto.randomUUID();
        localStorage.setItem("agenthub_visitor", id);
        return id;
      })();

    fetch("https://openai.imalag.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companySlug,
        message,
        visitorId,
        conversationId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API RESPONSE:", data);

        if (data.response) {
          alert("AI: " + data.response);
          conversationId = data.conversationId;
        } else {
          alert("Error: " + data.error);
        }
      })
      .catch((err) => {
        alert("Error: " + err.message);
      });
  }
})();
