// Initial quotes array
let quotes = [
  { text: "Wisdom is wealth.", category: "Proverbs" },
  { text: "Courage is grace under pressure.", category: "Motivation" },
];

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
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
  textInput.value = "";
  categoryInput.value = "";
  showRandomQuote();
}

// Event listener for the button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

