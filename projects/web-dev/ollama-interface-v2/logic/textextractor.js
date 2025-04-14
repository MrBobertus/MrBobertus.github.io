/**
 * Text Extraction Module
 *
 * Exports a function to extract text content from various file types
 * using client-side JavaScript. Requires PDF.js and JSZip libraries
 * to be loaded globally (e.g., via CDN).
 */
const TextExtractor = (() => {
  // Using an IIFE to create a module scope

  // --- Essential: Set PDF.js worker source ---
  // Ensure this is configured before calling extractTextFromFiles if using PDFs
  const configurePdfJsWorker = () => {
    if (window.pdfjsLib) {
      // Use the same CDN base path or specific path where worker is hosted
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.1.91/build/pdf.worker.min.mjs";
    } else {
      console.warn(
        "PDF.js library not loaded globally. PDF processing will fail."
      );
    }
  };

  // --- Internal Handler Functions ---

  const handlePlainText = (content) => content;

  const handleCsv = (content) => content; // Return raw text

  const handlePdf = async (arrayBuffer) => {
    if (!window.pdfjsLib) throw new Error("PDF.js library is not available.");

    const typedarray = new Uint8Array(arrayBuffer);
    const pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
    let fullText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          fullText += item.str + (item.hasEOL ? "\n" : " ");
        });
        if (pdfDoc.numPages > 1 && i < pdfDoc.numPages) {
          fullText += "\n"; // Simple newline between pages
        }
      } catch (pageError) {
        console.error(`Error processing PDF page ${i}:`, pageError);
        fullText += `\n[Error processing page ${i}]\n`;
      }
    }
    return fullText.trim();
  };

  const handleDocx = async (arrayBuffer) => {
    if (!window.JSZip) throw new Error("JSZip library is not available.");

    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const contentXmlFile = zip.file(/word\/document.*\.xml$/i)[0];
      if (!contentXmlFile)
        throw new Error(
          "Could not find main document XML (word/document*.xml)."
        );

      const contentText = await contentXmlFile.async("string");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(contentText, "application/xml");

      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        console.error("DOCX XML Parsing Error:", parserError.textContent);
        throw new Error("Failed to parse the document's XML content.");
      }

      const paragraphs = xmlDoc.getElementsByTagName("w:p");
      let structuredText = "";
      for (let i = 0; i < paragraphs.length; i++) {
        const textRuns = paragraphs[i].getElementsByTagName("w:t");
        let pText = "";
        for (let j = 0; j < textRuns.length; j++) {
          pText += textRuns[j].textContent || "";
        }
        structuredText += pText + "\n";
      }
      return structuredText.trim();
    } catch (error) {
      console.error("Error processing DOCX:", error);
      throw new Error(`Failed to process DOCX file: ${error.message}`);
    }
  };

  /**
   * Processes a single file object to extract text.
   * @param {File} file - The file object to process.
   * @returns {Promise<string>} A promise that resolves with the extracted text or rejects with an error.
   */
  const processSingleFile = (file) => {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const fileContent = e.target.result; // text or ArrayBuffer
        try {
          let extractedText = "";
          if (fileName.endsWith(".txt")) {
            extractedText = handlePlainText(fileContent);
          } else if (fileName.endsWith(".csv")) {
            extractedText = handleCsv(fileContent);
          } else if (fileName.endsWith(".pdf")) {
            extractedText = await handlePdf(fileContent);
          } else if (fileName.endsWith(".docx")) {
            extractedText = await handleDocx(fileContent);
          } else {
            // Should not happen if called correctly, but good practice
            reject(
              new Error(`Unsupported file type: ${fileName.split(".").pop()}`)
            );
            return;
          }
          resolve(extractedText);
        } catch (error) {
          reject(error); // Reject with the error from the handler
        }
      };

      reader.onerror = (e) => {
        console.error(`Error reading file ${file.name}:`, e);
        reject(new Error(`Failed to read file ${file.name}`));
      };

      // Read based on expected type for handlers
      if (fileName.endsWith(".txt") || fileName.endsWith(".csv")) {
        reader.readAsText(file);
      } else if (fileName.endsWith(".pdf") || fileName.endsWith(".docx")) {
        reader.readAsArrayBuffer(file);
      } else {
        // Reject immediately if type is not supported by this module
        reject(
          new Error(
            `File type not supported by extractor: ${fileName.split(".").pop()}`
          )
        );
      }
    });
  };

  /**
   * Extracts text content from an array of File objects.
   * Handles TXT, CSV, PDF, DOCX.
   * Requires PDF.js and JSZip to be loaded globally.
   * Ensure configurePdfJsWorker() has been called once if PDFs are expected.
   *
   * @param {File[]} files - An array of File objects.
   * @returns {Promise<Array<{status: 'fulfilled'|'rejected', value?: string, reason?: Error, filename: string}>>}
   *          A Promise that resolves with an array of result objects from Promise.allSettled.
   *          Each object contains the status, filename, and either the extracted text ('value') or the error ('reason').
   */
  const extractTextFromFiles = async (files) => {
    if (!Array.isArray(files)) {
      return Promise.reject(
        new TypeError("Input must be an array of File objects.")
      );
    }
    if (files.length === 0) {
      return Promise.resolve([]); // Resolve with empty array if no files
    }

    const processingPromises = files.map((file) =>
      processSingleFile(file)
        .then((text) => ({
          // Shape fulfilled result
          status: "fulfilled",
          value: text,
          filename: file.name,
        }))
        .catch((error) => ({
          // Shape rejected result
          status: "rejected",
          reason: error,
          filename: file.name,
        }))
    );

    // Use allSettled to wait for all promises, regardless of success/failure
    return Promise.allSettled(processingPromises).then((results) => {
      // The .then/.catch above already shaped the results,
      // but Promise.allSettled wraps them again. We want the inner shape.
      return results.map((result) => result.value); // Extract the shaped result object
    });
  };

  // --- Public API ---
  return {
    configurePdfJsWorker, // Expose configuration function
    extractTextFromFiles, // Expose main extraction function
  };
})(); // Immediately invoke the function expression
