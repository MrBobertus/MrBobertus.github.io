let input = prompt("Authorisations Code:");
input = btoa(input);
if (input != "TXI4MDg=") {
	window.location.href = "https://http.cat/401";
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clicked(button) {
  button.style.backgroundColor = "lightgreen";
  button.style.color = "green";
  button.innerHTML = '<i class="fa-solid fa-check"></i>';
  button.classList.toggle("rotate");
  
  var downloadURL = `https://t4.ftcdn.net/jpg/02/66/72/41/360_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg`;
  await wait(3000);
  window.location.href = downloadURL;
}
