function setRarity() {
  let rarity = Math.floor(Math.random() * 100);
  if (rarity < 3) {
    return "legendary";
  } else if (rarity < 12) {
    return "epic";
  } else if (rarity < 25) {
    return "rare";
  } else if (rarity < 50) {
    return "uncommon";
  }
  return "common";
}

function shuffleArray(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function generateWheel() {
  let items = [];
  let visualItems = [];
  const text = document.getElementById("text").value;
  const list = document.getElementById("list");

  list.innerHTML = "";

  text.split(",").forEach((item) => {
    let rarity = setRarity();
    items.push({ item, rarity });
  });

  items.forEach((item) => {
    let repetitions = 1;

    switch (item.rarity) {
      case "legendary":
        repetitions = 1;
        break;
      case "epic":
        repetitions = 2;
        break;
      case "rare":
        repetitions = 3;
        break;
      case "uncommon":
        repetitions = 5;
        break;
      case "common":
        repetitions = 6;
        break;
    }

    for (let i = 0; i < repetitions; i++) {
      visualItems.push(item);
    }
  });

  while (visualItems.length < 150) {
    shuffleArray(visualItems);
    visualItems = visualItems.concat(visualItems);
    shuffleArray(visualItems);
  }

  visualItems.forEach((item) => {
    list.innerHTML += `<li class="wheel-item rarity-${item.rarity}">${item.item}</li>`;
  });

  list.style.transform = `translateX(48%)`;
}

document.getElementById("text").addEventListener("input", function () {
  generateWheel();
});

function getRandomItem() {
  const list = document.getElementById("list");
  const items = list.querySelectorAll(".wheel-item");
  let randomItem =
    items[Math.floor(Math.random() * (items.length - 55 - 6) + 6)];
  return randomItem;
}

function animateWheelToTarget(targetLiElement) {
  if (!targetLiElement) {
    console.error("No target element provided for animation.");
    return;
  }

  const wheelUlElement = document.getElementById("list");
  const wheelContainer = document.getElementById("output-container");

  if (!wheelContainer) {
    console.error(
      "Wheel container not found! Make sure it has an ID like 'wheel-container'."
    );
    return;
  }

  const containerCenter = wheelContainer.offsetWidth / 2;

  // B. Center of the WINNING LI ELEMENT, relative to the start of the (potentially very long) UL
  //    targetLiElement.offsetLeft = distance from the left edge of wheelUlElement to the left edge of targetLiElement
  //    targetLiElement.offsetWidth / 2 = half the width of the targetLiElement
  const targetLiCenterWithinUl =
    targetLiElement.offsetLeft + targetLiElement.offsetWidth / 2;

  // C. Calculate the necessary translateX for the wheelUlElement
  //    We want to move wheelUlElement so that targetLiCenterWithinUl aligns with containerCenter.
  let targetTranslateX = containerCenter - targetLiCenterWithinUl;
  const targetTranslateXFully = targetTranslateX;
  const maxOffsetPercentage = 0.2;
  const maxPixelOffsetForItem =
    targetLiElement.offsetWidth * maxOffsetPercentage;
  targetTranslateX =
    targetTranslateX +
    Math.random() * (2 * maxPixelOffsetForItem) -
    maxPixelOffsetForItem;

  wheelUlElement.style.transition =
    "transform 30s cubic-bezier(0.12, 0.87, 0.25, 1)";

  // E. Apply the transform to move the wheel
  wheelUlElement.style.transform = `translateX(${targetTranslateX}px)`;

  // --- Post-Animation (Optional but good) ---
  // F. Disable spin button during animation
  const spinButton = document.getElementById("button");
  spinButton.disabled = true;

  // G. Re-enable button and optionally do other things when animation ends
  wheelUlElement.addEventListener(
    "transitionend",
    function handleAnimationEnd() {
      wheelUlElement.style.transition =
        "transform 1s cubic-bezier(0.12, 0.87, 0.25, 1)";
      wheelUlElement.style.transform = `translateX(${targetTranslateXFully}px)`;
      spinButton.disabled = false;
    }
  );
}

document.getElementById("button").addEventListener("click", function () {
  const winningElement = getRandomItem();

  if (winningElement) {
    animateWheelToTarget(winningElement);
  } else {
    console.log("Could not select a winner (list might be empty).");
  }
});
