# Personal User Page (PUP) - Documentation

This guide will show you how to make changes to your Personal User Page, even if you don't know much about coding!

## What are "Info Cards"?

Think of each "info card" as a little box on your page that shows some information and a picture. You can have as many of these cards as you want!

## How to Add a New Info Card (Like Adding a New Box)

1. **Find the `index.html` File:** This is the main file that makes your webpage work. You'll need to edit this file to add a new card.
2. **Copy an Existing Card:** The easiest way is to copy one of the cards that's already there. Look for a section of code that starts with `<div class="info-tab">` and ends with `</div>`. Copy everything between those two lines.  Make sure to copy the *whole* section.
3. **Paste the Copied Card:** Paste the code you copied right *after* the end of the last info card (look for the `</div>` that closes the previous card).  Make sure you paste it *inside* the area marked `<div id="main">`
4. **Change the Picture and Text:**
   * **Picture:** To change the picture, find the line that starts with `<img src=`. The part inside the quotes (`""`) is the address of the picture. You can either:
      * Use a picture from the internet (like the examples that are already there). Just replace the existing address with the address of your picture.
      * Upload a picture to the same place as your `index.html` file (or a folder there) and then use the name of the picture as the address (e.g., `<img src="my-picture.jpg">`).
   * **Text:** Change the text between the `<p>` tags to say whatever you want!  The `<b>` tags make the text bold.
5. **Save and Upload (or "Commit"):**  Save the `index.html` file and upload it back to your GitHub repository (or "commit" the changes, if you know how to do that).

## How to Remove an Info Card (Like Deleting a Box)

1. **Find the `index.html` File:** (Same as above).
2. **Find the Card to Remove:** Look for the `<div class="info-tab">` block that you want to get rid of.
3. **Delete the Code:** Delete *everything* from the `<div class="info-tab">` line to the closing `</div>` line.
4. **Save:** Save the `index.html` file.

## Important Tips!

*   **Be Careful!** When you're editing the `index.html` file, be careful not to accidentally delete anything important. If you're not sure, ask someone for help!
*   **Ask for Help!** If you get stuck, don't be afraid to ask for help from someone who knows a bit about HTML.

That's it!
