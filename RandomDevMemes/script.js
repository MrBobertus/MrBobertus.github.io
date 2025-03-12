var memes = [];
var maxTry = 100;
var currentTry = 0;

function showMeme(data) {
  console.log(data);
  if (data.nsfw === false) {
    if (memes.includes(data.url) === true) {
      currentTry++;
      if (currentTry < maxTry) {
        generateMeme();
      } else {
        alert("Max tries reached. No more memes to show.");
      }
    } else {
      currentTry = 0;
      memes.push(data.url);
      document.getElementById("meme").innerHTML =
        "<img src='" + data.url + "' alt='Meme'>";
    }
  }
}

function generateMeme() {
  var subreddit = document.getElementById("subreddit").value;
  if (subreddit === null || subreddit === "") {
    subreddit = "ProgrammerHumor";
  }
  fetch(`https://meme-api.com/gimme/${subreddit}`, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((data) => showMeme(data))
    .catch((error) => console.error(error));
}
