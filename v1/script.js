const postBtn = document.querySelector(".btn-post");
const artForm = document.querySelector(".art-form");
const artList = document.querySelector(".art-list");

const CATEGORIES = [
  { name: "espresso", color: "#3b82f6" },
  { name: "lattes", color: "#16a34a" },
  { name: "cortados", color: "#ef4444" },
  { name: "cappucinos", color: "#eab308" },
];

// Create DOM elements
artList.innerHTML = "";

// Load data from Supabase
loadArt();

async function loadArt() {
  const res = await fetch(
    "https://ahzvwcyggypskspkfozy.supabase.co/rest/v1/art",
    {
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoenZ3Y3lnZ3lwc2tzcGtmb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczMzMyMzgsImV4cCI6MjAyMjkwOTIzOH0.WTdYCGaE2I2bruy8TawS2FGP-NLhqEeQt830cDQ4mxs",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoenZ3Y3lnZ3lwc2tzcGtmb3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczMzMyMzgsImV4cCI6MjAyMjkwOTIzOH0.WTdYCGaE2I2bruy8TawS2FGP-NLhqEeQt830cDQ4mxs",
      },
    }
  );
  const data = await res.json();
  createArtList(data);
}

function createArtList(dataArray) {
  const htmlArr = dataArray.map(
    (art) => `<li class="art">
    <p>${art.text}
      <a
        class="recipe"
        href="${art.recipe}"
        target="_blank"
        >(Recipe)</a>
    </p>
    <span class="tag" 
    style="background-color: ${
      CATEGORIES.find((cat) => cat.name === art.category).color
    }"
      >${art.category}</span>`
  );
  const html = htmlArr.join("");
  artList.insertAdjacentHTML("afterend", html);
}

// Toggle form visibility
openPostDialogue = function () {
  artForm.classList.toggle("hidden");
  if (artForm.classList.contains("hidden")) {
    postBtn.textContent = "Share a picture";
  } else {
    postBtn.textContent = "Close";
  }
};

postBtn.addEventListener("click", function () {
  openPostDialogue();
});

console.log([7, 64, 6, -23, 11].filter((el) => el > 10));
console.log([7, 64, 6, -23, 11].find((el) => el > 10));
