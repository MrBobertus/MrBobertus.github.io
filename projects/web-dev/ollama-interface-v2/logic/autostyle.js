function escapeHtml(unsafe) {
  if (!unsafe) return ""; // Handle null or undefined input gracefully
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'");
}

export function autoformatMarkdown() {
  // 1. Select all elements with the target class
  const elementsToFormat = document.querySelectorAll(".chat-text-ai");

  // --- Regular Expressions ---
  // IMPORTANT: Order matters! Process blocks first, then inline.

  // 1. Code Blocks (```...```) - Handle multiline content
  //    ```([\s\S]*?)```
  //    Captures any character including newlines, non-greedily
  const codeBlockRegex = /```([\s\S]*?)```/g;

  // 2. Inline Code (`...`)
  //    `([^`]+?)`
  //    Captures one or more characters that are NOT backticks, non-greedily
  const inlineCodeRegex = /`([^`]+?)`/g;

  // 3. Bold (**...**)
  //    \*\*(.*?)\*\*
  const boldRegex = /\*\*(.*?)\*\*/g;

  // 4. Italics (*...* or _..._)
  //    Need to be careful not to match parts of bold (**).
  //    Using lookarounds to ensure the asterisks are not part of a bold marker.
  //    (?<!\*)\*([^*]+?)\*(?!\*) - Matches *text* only if not preceded/followed by *
  const italicStarRegex = /(?<!\*)\*([^*]+?)\*(?!\*)/g;
  //    _([^_]+?)_ - Matches _text_
  const italicUnderscoreRegex = /_([^_]+?)_/g;

  elementsToFormat.forEach((element) => {
    let currentHtml = element.innerHTML;

    // --- Apply Replacements Sequentially ---

    // Replace Code Blocks
    currentHtml = currentHtml.replace(codeBlockRegex, (match, capturedText) => {
      // Trim surrounding newlines potentially captured if ``` are on their own lines
      const trimmedContent = capturedText.trim();
      // Escape HTML entities *within* the code block
      return `<pre><code>${escapeHtml(trimmedContent)}</code></pre>`;
    });

    // Replace Inline Code
    currentHtml = currentHtml.replace(
      inlineCodeRegex,
      (match, capturedText) => {
        // No need to trim inline code generally, but escape HTML
        return `<code>${escapeHtml(capturedText)}</code>`;
      }
    );

    // Replace Bold
    currentHtml = currentHtml.replace(boldRegex, (match, capturedText) => {
      const trimmedText = capturedText.trim();
      return trimmedText ? `<strong>${trimmedText}</strong>` : ""; // Remove empty bold
    });

    // Replace Italics (Stars)
    currentHtml = currentHtml.replace(
      italicStarRegex,
      (match, capturedText) => {
        const trimmedText = capturedText.trim();
        return trimmedText ? `<em>${trimmedText}</em>` : ""; // Remove empty italics
      }
    );

    // Replace Italics (Underscores)
    currentHtml = currentHtml.replace(
      italicUnderscoreRegex,
      (match, capturedText) => {
        const trimmedText = capturedText.trim();
        return trimmedText ? `<em>${trimmedText}</em>` : ""; // Remove empty italics
      }
    );

    // Update the element's HTML only if changes were made
    if (element.innerHTML !== currentHtml) {
      element.innerHTML = currentHtml;
    }
  });
}
