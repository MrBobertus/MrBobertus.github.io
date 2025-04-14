import { autoformatMarkdown } from "./autostyle.js";

const API_URL = "http://172.16.100.136:11434/api/chat";

let conversationHistory = [
  // { role: "", content: "" }
];

const modelTypeSelect = document.getElementsByClassName("chat-select")[0];
const promptTextarea = document.getElementsByClassName(
  "chat-textarea textarea"
)[0];
const sendButton = document.getElementsByClassName("chat-button button")[0];
const chatDiv = document.getElementsByClassName("chat-container7")[0];

function newMessage(author, textContent) {
  const messageElement = document.createElement("span");
  messageElement.classList.add(`chat-text-${author}`);
  messageElement.textContent = textContent;
  chatDiv.appendChild(messageElement);
  chatDiv.scrollTop = chatDiv.scrollHeight;
  return messageElement;
}

function saveMessage(author, message) {
  if (message && typeof message === "string" && message.trim()) {
    conversationHistory.push({
      role: author,
      content: message.trim(),
    });
    console.log("Chat history:", conversationHistory);
  }
}

async function callAPIEndpoint() {
  const requestData = {
    model: modelTypeSelect.value,
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

  let aiMessageElement;
  let fullAiResponse = "";

  try {
    aiMessageElement = newMessage("ai", "");

    const response = await fetch(API_URL, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error! ${response.status} ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log("Stream complete.");
        if (aiMessageElement) {
          //autoformatMarkdown(aiMessageElement);
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary;
      while ((boundary = buffer.indexOf("\n")) !== -1) {
        const line = buffer.substring(0, boundary).trim();
        buffer = buffer.substring(boundary + 1);

        if (line) {
          try {
            const data = JSON.parse(line);
            if (data.message && typeof data.message.content === "string") {
              const chunkText = data.message.content;
              fullAiResponse += chunkText;
              if (aiMessageElement) {
                aiMessageElement.textContent += chunkText;
                chatDiv.scrollTop = chatDiv.scrollHeight;
              }
            }
          } catch (e) {
            console.warn("Error parsing stream line:", e, "line:", line);
          }
        }
      }
    }
    saveMessage("ai", fullAiResponse);
  } catch (error) {
    console.error("Error during API call:", error);
    alert("Error fetching AI response: " + error.message);
  } finally {
    if (sendButton) {
      sendButton.disabled = false;
      sendButton.style.opacity = 1;
    }
  }
}

sendButton.addEventListener("click", async () => {
  const userPrompt = promptTextarea.value.trim();
  if (!userPrompt) {
    return;
  }
  promptTextarea.value = "";

  sendButton.disabled = true;
  sendButton.style.opacity = 0.5;

  newMessage("user", userPrompt);
  saveMessage("user", userPrompt);

  await callAPIEndpoint();
});
