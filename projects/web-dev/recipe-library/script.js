var ids = 2;

const recipeListContainer = document.getElementById("grid");

async function createRecipeListItem(recipeId) {
  try {
    const response = await fetch(`recipes/${recipeId}.json`);
    if (!response.ok) {
      console.warn(`Recipe ${recipeId} not found.`);
      return;
    }
    const recipe = await response.json();

    const recipeCard = document.createElement("h4");
    recipeCard.classList.add("recipe-card");
    recipeCard.innerText = recipe.name;

    recipeCard.onclick = function () {
      window.location.href = `template.html?id=${recipeId}`;
    };

    recipeListContainer.appendChild(recipeCard);
  } catch (error) {
    console.error(`Error fetching recipe ${recipeId}:`, error);
  }
}
async function createRecipeList() {
  const maxRecipes = 2;
  for (let i = 1; i <= maxRecipes; i++) {
    await createRecipeListItem(i);
  }
}

if (!window.location.href.includes("template.html")) {
  createRecipeList();
}
