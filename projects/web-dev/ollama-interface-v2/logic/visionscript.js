import { autoformatMarkdown } from "./autostyle.js";

const API_URL = "http://172.16.100.136:11434/api/chat";

let conversationHistory = [
  // { role: "user", content: string }
];

let currentImageBase64 = null;
let currentImageFilename = null;

const modelTypeSelect = document.getElementsByClassName("chat-select")[0];
const promptTextarea = document.getElementsByClassName(
  "chat-textarea textarea"
)[0];
const sendButton = document.getElementsByClassName("chat-button button")[0];
const chatDiv = document.getElementsByClassName("chat-container7")[0];
const fileInput = document.getElementById("fileInput");

function newMessage(author, textContent) {
  const messageElement = document.createElement("span");
  messageElement.classList.add(`chat-text-${author}`);
  messageElement.innerHTML = textContent.replace(/\n/g, "<br>");
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
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function callVisionAPI(userPrompt, imageBase64) {
  const selectedModel = modelTypeSelect.value;
  if (!selectedModel) {
    newMessage("ai", "Error: No model selected.");
    return;
  }

  const messagesPayload = [
    {
      role: "user",
      content: userPrompt,
      images: imageBase64 ? [imageBase64] : undefined,
    },
  ];

  const requestData = {
    model: selectedModel,
    messages: messagesPayload,
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
  sendButton.disabled = true;
  sendButton.style.opacity = 0.5;

  try {
    aiMessageElement = newMessage("ai", "Thinking...");

    const response = await fetch(API_URL, fetchOptions);

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      const errorMessage = `Error: ${response.status}${
        errorText ? " - " + errorText : ""
      }`;
      if (aiMessageElement) {
        aiMessageElement.textContent = errorMessage;
      } else {
        newMessage("ai", errorMessage);
      }
      saveMessage("ai", `API Error: ${response.status}`);
      throw new Error(`HTTP Error! ${response.status} ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    aiMessageElement.textContent = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        saveMessage("ai", fullAiResponse);
        if (aiMessageElement && typeof autoformatMarkdown === "function") {
          autoformatMarkdown(aiMessageElement);
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let boundary;
      while ((boundary = buffer.indexOf("\n")) !== -1) {
        const line = buffer.substring(0, boundary).trim();
        buffer = buffer.substring(boundary + 1);

        if (line) {
          // console.log("Raw line received:", line); // Optional: Log raw line before parsing
          try {
            const data = JSON.parse(line);
            if (data.message && typeof data.message.content === "string") {
              const chunkText = data.message.content;
              // --- FIX/CHECK 2: Log received content ---
              // console.log("Received chunk:", chunkText);
              fullAiResponse += chunkText;
              if (aiMessageElement) {
                aiMessageElement.textContent += chunkText;
                chatDiv.scrollTop = chatDiv.scrollHeight;
              }
            } else {
              // --- FIX/CHECK 2: Log if parsed structure is unexpected ---
              console.log(
                "Parsed data but no valid content/message structure:",
                data
              );
            }

            if (data.done) {
              if (!fullAiResponse.trim()) {
                fullAiResponse =
                  data.message?.content || "Received empty final message.";
              }
              saveMessage("ai", fullAiResponse);
              if (
                aiMessageElement &&
                typeof autoformatMarkdown === "function"
              ) {
                autoformatMarkdown(aiMessageElement);
              }
              if (reader)
                reader
                  .cancel()
                  .catch((e) => console.warn("Error cancelling reader:", e));
              return;
            }
          } catch (e) {
            // --- FIX/CHECK 1: Log JSON parsing errors ---
            console.error("Failed to parse JSON line:", line, "Error:", e);
          }
        }
      }
    }
    if (
      !conversationHistory.some(
        (msg) => msg.role === "assistant" && msg.content === fullAiResponse
      )
    ) {
      saveMessage("ai", fullAiResponse);
    }
  } catch (error) {
    console.error("Error during API call:", error);
    const displayError = `Error processing request: ${error.message}`;
    if (
      aiMessageElement &&
      !aiMessageElement.textContent.startsWith("Error:")
    ) {
      aiMessageElement.textContent = displayError;
    } else if (!aiMessageElement) {
      newMessage("ai", displayError);
    }
  } finally {
    sendButton.disabled = false;
    sendButton.style.opacity = 1;
  }
}

fileInput.addEventListener("change", async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) {
    currentImageBase64 = null;
    currentImageFilename = null;
    return;
  }

  const file = files[0];

  newMessage("ai", `Processing image...`);

  try {
    currentImageBase64 = await readFileAsBase64(file);
    currentImageFilename = file.name;
    newMessage("ai", `Ready to analyze ${file.name}`);
  } catch (error) {
    console.error("Error reading file:", error);
    newMessage("ai", `Error reading file "${file.name}": ${error.message}`);
    currentImageBase64 = null;
    currentImageFilename = null;
    fileInput.value = "";
  }
});

sendButton.addEventListener("click", async () => {
  const userPrompt = promptTextarea.value.trim();

  if (!userPrompt && !currentImageBase64) {
    return;
  }
  if (!currentImageBase64) {
    newMessage("ai", "Please select an image to analyze.");
    return;
  }
  if (!userPrompt) {
    newMessage(
      "ai",
      "Please provide a question or instruction about the image."
    );
    return;
  }

  promptTextarea.value = "";
  newMessage(
    "user",
    `${userPrompt}${
      currentImageFilename ? ` (Image: ${currentImageFilename})` : ""
    }`
  );
  saveMessage("user", userPrompt);

  await callVisionAPI(userPrompt, currentImageBase64);
});
