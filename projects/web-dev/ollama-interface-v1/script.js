import { autoformatMarkdown } from "./autostyle.js";

const OLLAMA_API_URL = "http://<your-api-url>/api/chat"; // Put your API URL where you can reach OLLAMA

let conversationHistory = [];

const modelType = document.getElementById("model-select");
const promptInput = document.getElementById("promptInput");
const send = document.getElementById("send");
const responseDiv = document.getElementById("responseDiv");

send.addEventListener("click", async () => {
  const userPrompt = promptInput.value;
  promptInput.value = "";
  if (!userPrompt) {
    alert("Please enter a prompt!");
    return;
  }

  send.disabled = true;
  send.style.opacity = 0.5;
  const newMessage = document.createElement("p");
  newMessage.classList.add("user");
  newMessage.textContent = userPrompt;
  responseDiv.appendChild(newMessage);

  if (userPrompt) {
    conversationHistory.push({
      role: "user",
      content: userPrompt,
    });
    console.log("Chat history:", conversationHistory);
  }

  const requestData = {
    model: modelType.value,
    messages: conversationHistory,
    stream: true,
  };

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  try {
    const response = await fetch(OLLAMA_API_URL, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP Error! Status: ${response.status}, Nachricht: ${errorText}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    var message = "";

    const newMessage = document.createElement("p");
    newMessage.classList.add("ai");
    newMessage.textContent = "";
    responseDiv.appendChild(newMessage);

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log("Stream complete.");
        autoformatMarkdown();
        send.disabled = false;
        send.style.opacity = 1;
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.lastIndexOf("\n");
      if (boundary !== -1) {
        const completeLines = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 1);

        const lines = completeLines.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message && data.message.content) {
                const chunkText = data.message.content;
                message += chunkText;
                newMessage.innerText += chunkText;
              }
            } catch (e) {
              console.error("Error:", e, "line:", line);
            }
          }
        });
      }
    }

    if (message) {
      conversationHistory.push({
        role: "ai",
        content: message,
      });
      console.log("Chat history:", conversationHistory);
    }
  } catch (error) {
    console.error("Error while trying to access the OLLAMA API", error);
    responseDiv.innerText = "Error: " + error.message;
  }
});
