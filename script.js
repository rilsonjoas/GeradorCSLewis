// Seleciona os elementos do DOM
const quoteTextElement = document.getElementById("quote-text");
const quoteSourceElement = document.getElementById("quote-source");
const quoteButton = document.getElementById("quote-button");

// Certifica-se de que o array foi carregado
if (
  typeof lewisQuotes === "undefined" ||
  !Array.isArray(lewisQuotes) ||
  lewisQuotes.length === 0
) {
  console.error(
    "Erro: O array 'lewisQuotes' não foi encontrado ou está vazio. Verifique se 'quotes.js' está carregado corretamente antes de 'script.js'."
  );
  quoteTextElement.textContent = "Erro ao carregar as citações.";
} else {
  // Função para obter um objeto de citação aleatório
  function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * lewisQuotes.length);
    return lewisQuotes[randomIndex];
  }

  // Função para exibir a citação e a fonte
function displayQuote(quoteObj) {
  if (quoteObj && quoteObj.quote) {
    quoteTextElement.textContent = `"${quoteObj.quote}"`;

    if (quoteObj.source) {
      const affiliateTag = "rilson-20";
      const amazonSearchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(
        quoteObj.source
      )}&tag=${affiliateTag}`;

      quoteSourceElement.innerHTML = `— <a href="${amazonSearchUrl}" target="_blank" rel="noopener noreferrer" class="source-link"> ${quoteObj.source}</a>`;
    } else {
      quoteSourceElement.innerHTML = ""; 
    }
  } else {
    quoteTextElement.textContent = "Não foi possível carregar a citação.";
    quoteSourceElement.innerHTML = ""; 
    console.error("Erro: Objeto de citação inválido recebido.", quoteObj);
  }
}

  // Adiciona o Event Listener ao botão para gerar uma nova citação
  quoteButton.addEventListener("click", () => {
    const newQuote = getRandomQuote(); 
    displayQuote(newQuote);
  });

  // Exibe uma citação inicial quando a página carrega
  document.addEventListener("DOMContentLoaded", () => {
    const initialQuote = getRandomQuote(); 
    displayQuote(initialQuote); 
  });
} 
