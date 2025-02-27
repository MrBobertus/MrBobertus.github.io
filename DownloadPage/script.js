let input = prompt("Authorisations Code:");
input = btoa(input);
if (input != "TXI4MDg=") {
	window.location.href = "https://http.cat/401";
}
  
function clicked(button) {
  button.style.backgroundColor = "lightgreen";
  button.style.color = "green";
  button.innerHTML = '<i class="fa-solid fa-check"></i>';
  button.classList.toggle("rotate");
  
  var id = "1OQYGhQ66wjV4Tni9W7SIlg-aNhFSPrio";
  var downloadURL = `https://drive.usercontent.google.com/uc?id=${id}&authuser=0&export=download`;
  window.location.href = downloadURL;
}