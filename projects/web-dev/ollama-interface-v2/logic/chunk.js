// chunk.js

/**
 * Chunks a given text into smaller pieces of a target size with a specified overlap.
 *
 * @param {string} inputText - The text to be chunked.
 * @param {object} [options={}] - Optional configuration settings.
 * @param {number} [options.targetChunkSize=1000] - The desired maximum number of characters per chunk.
 * @param {number} [options.chunkOverlap=100] - The number of characters to overlap between consecutive chunks.
 * @returns {string[]} An array of text chunk strings. Returns an empty array if the input
 *          is invalid or no chunks can be generated.
 */
function chunkTextBySize(inputText, options = {}) {
  // --- Apply Configuration with Defaults ---
  const {
    targetChunkSize = 400, // Default target characters per chunk
    chunkOverlap = 30, // Default characters to overlap
  } = options;

  // --- Input Validation ---
  if (typeof inputText !== "string" || inputText.trim().length === 0) {
    console.warn(
      "[chunkTextBySize] Input text is not a valid string or is empty."
    );
    return []; // Return empty array for invalid input
  }
  if (
    typeof targetChunkSize !== "number" ||
    typeof chunkOverlap !== "number" ||
    targetChunkSize <= 0 ||
    chunkOverlap < 0 ||
    chunkOverlap >= targetChunkSize
  ) {
    console.error(
      `[chunkTextBySize] Invalid chunk/overlap size. targetChunkSize (${targetChunkSize}) must be > 0, chunkOverlap (${chunkOverlap}) must be >= 0 and < targetChunkSize.`
    );
    return []; // Return empty array for invalid configuration
  }

  console.log(
    `[chunkTextBySize] Starting chunking: size=${targetChunkSize}, overlap=${chunkOverlap}, text length=${inputText.length}`
  );

  let chunks = [];
  let startIndex = 0;
  const textLength = inputText.length;

  // --- Chunking Loop ---
  while (startIndex < textLength) {
    // Calculate the end index for this chunk
    // Ensure it doesn't exceed the text length
    const endIndex = Math.min(startIndex + targetChunkSize, textLength);

    // Extract the chunk using substring
    const currentChunk = inputText.substring(startIndex, endIndex);

    // Add the chunk to our list if it contains non-whitespace characters
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }

    // If we've reached the end of the text, break the loop
    if (endIndex >= textLength) {
      break;
    }

    // Determine the start index for the *next* chunk
    // Move forward by the chunk size minus the overlap
    startIndex += targetChunkSize - chunkOverlap;

    // Safety check: Ensure startIndex doesn't somehow go negative or loop infinitely
    // This condition primarily prevents issues if overlap logic causes no progress
    if (startIndex < 0 || startIndex >= endIndex) {
      console.warn(
        `[chunkTextBySize] Potential loop issue or no progress. Adjusting startIndex from ${startIndex} to ${endIndex}. Check overlap/size ratio.`
      );
      startIndex = endIndex; // Force progress to the end of the last chunk
    }
  } // End while loop

  if (chunks.length === 0 && inputText.trim().length > 0) {
    // This might happen if the text is shorter than the first chunk attempt
    // and consists only of whitespace, but let's log a warning if non-whitespace input yielded no chunks.
    console.warn(
      "[chunkTextBySize] No chunks were generated, although input text was provided."
    );
  }

  console.log(
    `[chunkTextBySize] Finished chunking. Generated ${chunks.length} chunks.`
  );

  // --- Return the array of text chunks ---
  return chunks;
}

// Export the function to be used by other modules
export { chunkTextBySize };
