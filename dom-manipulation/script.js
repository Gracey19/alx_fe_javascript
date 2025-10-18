// Load quotes from localStorage if available
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Wisdom is wealth.", category: "Proverbs" },
  { text: "Courage is grace under pressure.", category: "Motivation" },
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote (filtered if needed)
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter")?.value || "all";
  let filtered = quotes;

  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function showNotification(message) {
  const note = document.createElement("div");
  note.innerText = message;
  note.style.background = "#ffeeba";
  note.style.padding = "10px";
  note.style.margin = "10px 0";
  note.style.border = "1px solid #f0ad4e";
  document.body.insertBefore(note, document.getElementById("quoteDisplay"));

  setTimeout(() => note.remove(), 5000);
}

function resolveConflicts(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(localQuote =>
      localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
    );

    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server!");
  }
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverQuotes = await response.json();

    const formattedQuotes = serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    }));

    resolveConflicts(formattedQuotes);
  } catch (error) {
    console.error("Failed to fetch server quotes:", error);
  }
}

function syncQuotes() {
  fetchQuotesFromServer();
}

function postQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Quote posted to server:", data);
  })
  .catch(error => {
    console.error("Failed to post quote:", error);
  });
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    text: textInput.value,
    category: categoryInput.value,
  };

  quotes.push(newQuote);
  postQuoteToServer(newQuote);
  saveQuotes();
  populateCategories(); // Refresh dropdown
  textInput.value = "";
  categoryInput.value = "";
  showRandomQuote();
  
}

// Create the form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.innerText = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Populate category dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// Event listener for the button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Create form and import/export controls
createAddQuoteForm();

// Create export button
const exportButton = document.createElement("button");
exportButton.innerText = "Export Quotes";
exportButton.onclick = exportToJsonFile;
document.body.appendChild(exportButton);

// Create import input
const importInput = document.createElement("input");
importInput.type = "file";
importInput.id = "importFile";
importInput.accept = ".json";
importInput.onchange = importFromJsonFile;
document.body.appendChild(importInput);

// Create category filter dropdown
const categoryFilter = document.createElement("select");
categoryFilter.id = "categoryFilter";
categoryFilter.onchange = filterQuotes;
document.body.insertBefore(categoryFilter, document.getElementById("quoteDisplay"));

populateCategories();
showRandomQuote();

setInterval(fetchQuotesFromServer, 30000);
