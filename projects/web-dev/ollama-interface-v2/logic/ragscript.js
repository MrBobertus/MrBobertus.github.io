import { autoformatMarkdown } from "./autostyle.js";
import { compareData } from "./compare.js";
import { chunkTextBySize } from "./chunk.js";

const API_URL = "http://172.16.100.136:11434/api/chat";
const MESSAGE_API_URL = "http://172.16.100.136:11434/api/embeddings";
const EMBEDDING_MODEL = "nomic-embed-text";
const searchOptions = {
  topN: 7,
  minSimilarity: 0.4,
};

let conversationHistory = [
  // { role: "", content: "" }
];

let storedData = [
  // { filename: string, chunks: [{ text: string, embedding: number[] }] }
];

const modelTypeSelect = document.getElementsByClassName("chat-select")[0];
const promptTextarea = document.getElementsByClassName(
  "chat-textarea textarea"
)[0];
const sendButton = document.getElementsByClassName("chat-button button")[0];
const chatDiv = document.getElementsByClassName("chat-container7")[0];
const fileInput = document.getElementById("fileInput");

const test = document.getElementsByClassName("chat-fileinput-label");

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
    aiMessageElement = newMessage("ai", "Reading data...");

    const response = await fetch(API_URL, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      if (aiMessageElement) {
        aiMessageElement.textContent = `Error: ${response.status} ${errorText}`;
      }
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
        // if (aiMessageElement) {
        //   autoformatMarkdown(aiMessageElement);
        // }
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
              fullAiResponse += chunkText; // Accumulate response
              if (aiMessageElement) {
                aiMessageElement.textContent += chunkText; // Update UI progressively
                chatDiv.scrollTop = chatDiv.scrollHeight;
              }
            }
            // Check if the stream indicates it's done within the JSON structure (some models do this)
            if (data.done) {
              saveMessage("ai", fullAiResponse);
              // Optional: Apply markdown formatting
              // if (aiMessageElement) {
              //   autoformatMarkdown(aiMessageElement);
              // }
              // Ensure the outer loop also breaks if 'done' is true in the JSON
              if (reader) reader.cancel(); // Close the reader
              break; // Exit inner while loop
            }
          } catch (e) {
            // Ignore potential JSON parsing errors for incomplete lines
            // console.warn("Error parsing stream line:", e, "line:", line);
          }
        }
      }
      // If the stream sends a 'done' signal within the JSON, break the outer loop too
      if (buffer.includes('"done":true')) {
        // A simple check, might need refinement
        break;
      }
    }
    // In case the stream ends without a final newline or explicit 'done' marker
    if (
      !conversationHistory.some(
        (msg) => msg.role === "ai" && msg.content === fullAiResponse
      )
    ) {
      saveMessage("ai", fullAiResponse);
    }
  } catch (error) {
    console.error("Error during API call:", error);
    if (
      aiMessageElement &&
      !aiMessageElement.textContent.startsWith("Error:")
    ) {
      aiMessageElement.textContent = "Error fetching AI response.";
    } else if (!aiMessageElement) {
      newMessage("ai", "Error fetching AI response.");
    }
    // Still save a system message about the error? Maybe not needed.
    // saveMessage("ai", `Error: ${error.message}`);
  } finally {
    if (sendButton) {
      sendButton.disabled = false;
      sendButton.style.opacity = 1;
    }
  }
}

async function extractTextFromFiles(files) {
  // Assuming TextExtractor is available globally or imported correctly
  // Make sure TextExtractor.configurePdfJsWorker() is called elsewhere, maybe on page load
  if (typeof TextExtractor === "undefined") {
    console.error("TextExtractor library is not loaded.");
    return [];
  }

  if (!files || files.length === 0) {
    return [];
  }

  const fileArray = Array.from(files);

  try {
    // Assuming TextExtractor.extractTextFromFiles processes an array of File objects
    // and returns an array of { filename: string, value: string } or similar
    const results = await TextExtractor.extractTextFromFiles(fileArray);
    return results; // Expecting [{ filename: '...', value: '...' }, ...]
  } catch (error) {
    console.error("Error extracting text from files:", error);
    return [];
  }
}

async function getEmbeddingsForChunks(textChunks) {
  if (!Array.isArray(textChunks) || textChunks.length === 0) {
    return [];
  }

  const embeddingPromises = textChunks.map(async (chunkText) => {
    if (typeof chunkText !== "string" || !chunkText.trim()) {
      return null; // Skip empty chunks
    }

    const requestData = {
      model: EMBEDDING_MODEL,
      prompt: chunkText,
    };

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    try {
      const response = await fetch(MESSAGE_API_URL, fetchOptions);

      if (!response.ok) {
        console.error(
          `Embedding request failed for chunk: ${chunkText.substring(
            0,
            50
          )}... Status: ${response.status}`
        );
        return null;
      }

      const responseData = await response.json();
      const embeddingArray = responseData.embedding;

      if (!embeddingArray) {
        console.warn(
          `No embedding returned for chunk: ${chunkText.substring(0, 50)}...`
        );
        return null;
      }

      // Return object containing both text and embedding
      return {
        text: chunkText,
        embedding: embeddingArray,
      };
    } catch (error) {
      console.error(
        `Error fetching embedding for chunk: ${chunkText.substring(
          0,
          50
        )}... Error: ${error}`
      );
      return null;
    }
  });

  try {
    const results = await Promise.all(embeddingPromises);
    // Filter out any null results from failed requests or empty chunks
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error("Error processing embedding promises:", error);
    return []; // Return empty array on major error
  }
}

async function processAndStoreFiles(files) {
  if (!files || files.length === 0) {
    console.log("No files selected for processing.");
    return;
  }
  newMessage("ai", `Processing ${files.length} file(s)...`);
  sendButton.disabled = true; // Disable send while processing files
  sendButton.style.opacity = 0.5;

  // Ensure PDF worker is configured (if needed by TextExtractor)
  if (
    typeof TextExtractor !== "undefined" &&
    typeof TextExtractor.configurePdfJsWorker === "function"
  ) {
    TextExtractor.configurePdfJsWorker();
  }

  const extractedResults = await extractTextFromFiles(files);

  if (!extractedResults || extractedResults.length === 0) {
    newMessage("ai", "Could not extract text from the selected file(s).");
    sendButton.disabled = false; // Re-enable send button
    sendButton.style.opacity = 1;
    return;
  }

  let totalChunks = 0;

  for (const result of extractedResults) {
    if (result && result.value && typeof result.value === "string") {
      const textChunks = chunkTextBySize(result.value);
      totalChunks += textChunks.length;
      newMessage(
        "ai",
        `Embedding ${textChunks.length} chunks from ${result.filename}...`
      );

      const chunksWithEmbeddings = await getEmbeddingsForChunks(textChunks);

      if (chunksWithEmbeddings.length > 0) {
        storedData.push({
          filename: result.filename,
          chunks: chunksWithEmbeddings,
        });
      } else {
        newMessage("ai", `Could not get embeddings for ${result.filename}.`);
      }
    } else {
      newMessage(
        "ai",
        `No valid text content found in ${result.filename || "a file"}.`
      );
    }
  }

  if (storedData.length > 0) {
    const successfulFiles = storedData.map((f) => f.filename).join(", ");
    newMessage(
      "ai",
      `Successfully processed and stored data for: ${successfulFiles}. Total chunks: ${storedData.reduce(
        (sum, file) => sum + file.chunks.length,
        0
      )}`
    );
  } else {
    newMessage("ai", "Failed to process any files successfully.");
  }

  sendButton.disabled = false;
  sendButton.style.opacity = 1;
  fileInput.value = "";
}

fileInput.addEventListener("change", (event) => {
  processAndStoreFiles(event.target.files);
});

sendButton.addEventListener("click", async () => {
  const userPrompt = promptTextarea.value.trim();
  if (!userPrompt) {
    return;
  }
  promptTextarea.value = "";

  if (storedData.length === 0) {
    newMessage("user", userPrompt);
    saveMessage("user", userPrompt);
    newMessage("ai", "Please upload a file first to provide context.");
    return;
  }

  sendButton.disabled = true;
  sendButton.style.opacity = 0.5;

  newMessage("user", userPrompt);

  const promptEmbeddingResult = await getEmbeddingsForChunks([userPrompt]);

  if (
    !promptEmbeddingResult ||
    promptEmbeddingResult.length === 0 ||
    !promptEmbeddingResult[0].embedding
  ) {
    newMessage("ai", "Could not create embedding for the question.");
    sendButton.disabled = false;
    sendButton.style.opacity = 1;
    return;
  }
  const userPromptEmbedding = promptEmbeddingResult[0];

  const allContextChunks = storedData.flatMap((fileData) =>
    fileData.chunks
      .filter((chunk) => chunk && chunk.text && chunk.embedding)
      .map((chunk) => ({ ...chunk, filename: fileData.filename }))
  );

  if (allContextChunks.length === 0) {
    newMessage("ai", "No context chunks available for comparison.");
    sendButton.disabled = false;
    sendButton.style.opacity = 1;
    return;
  }

  const relevantContexts = compareData(
    userPromptEmbedding,
    allContextChunks,
    searchOptions
  );

  let contextText = "";
  if (relevantContexts && relevantContexts.length > 0) {
    contextText = relevantContexts
      .map(
        (ctx, index) =>
          `File ${ctx.filename} \n\n\n Context ${index + 1}:\n${ctx.text}`
      )
      .join("\n\n");
  } else {
    contextText = "No relevant context found in the provided documents.";
  }
  console.log(contextText);
  const finalPromptToLLM = `You are an AI assistant performing Retrieval-Augmented Generation. Your task is to answer the user's question based *strictly* and *exclusively* on the provided context document.

**Rules:**
1.  Analyze the "Provided Context" carefully.
2.  Formulate an answer to the "User Question" using *only* information found within the "Provided Context".
3.  Do **NOT** use any prior knowledge, external information, or assumptions.
4.  If the "Provided Context" explicitly contains the answer, provide it clearly.
5.  If the "Provided Context" does **NOT** contain the information required to answer the "User Question", you MUST state: "Based on the provided context, I cannot answer this question." Do not attempt to infer or guess.
6.  Your answer must be in the same language as the "User Question".

**Provided Context:**
---
${contextText}
---

**User Question:**
${userPrompt}

**Answer:**`;

  saveMessage("user", finalPromptToLLM);

  await callAPIEndpoint();
});
