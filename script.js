function botaoLista() {
   window.location.href = "lista.html";
}

function botaoCalculadora() {
    window.location.href = "calculadora.html";
}

function botaoCompras() {
    window.location.href = "comprasAnteriores.html";
}

function funcaoCalcular() {
  const inputValor1 = document.getElementById("valor");
  const inputValor2 = document.getElementById("quantidade");
  const listaPrecos = document.getElementById("precos");

  const valor1 = parseFloat(inputValor1.value);
  const valor2 = parseFloat(inputValor2.value);


  if (isNaN(valor1) || isNaN(valor2) || valor2 <= 0) {
    alert("Por favor, insira valores válidos!");
    return;
  }

  
  const divisao = (valor1 / valor2) * 10;

  
  const li = document.createElement("li");
  li.textContent = `R$ ${divisao.toFixed(2)} `;
  listaPrecos.appendChild(li);


  inputValor1.value = "";
  inputValor2.value = "";
}


let somaTotal = 0;
let itens = [];



function adicionarLista() {
  const inputProduto = document.getElementById("prod");
  const inputValor = document.getElementById("val");
  const lista = document.getElementById("lista");
  const total = document.getElementById("tot");

  const produto = inputProduto.value.trim();
  const valor = parseFloat(inputValor.value);

  if (produto === "" || isNaN(valor)) {
    alert("Digite o nome do produto e um valor válido!");
    return;
  }
  const li = document.createElement("li");

  
  const textoPrincipal = document.createElement("span");
  textoPrincipal.className = "item-principal"; // Classe para estilizar
  textoPrincipal.textContent = `${produto}: R$ ${valor.toFixed(2)}`;
  
  
  const historicoPrecos = getHistoricoPrecos(produto);


  lista.appendChild(li);
  li.appendChild(textoPrincipal); 


  if (historicoPrecos) {
    const textoHistorico = document.createElement("small");
    textoHistorico.className = "item-historico"; 
    textoHistorico.textContent = `(Último: R$ ${historicoPrecos.last.toFixed(2)} | Menor: R$ ${historicoPrecos.min.toFixed(2)})`;
    

    if (valor < historicoPrecos.min) {
     
      textoPrincipal.style.color = "#0b664a"; // Verde (cor boa)
      textoPrincipal.style.fontWeight = "bold";
      textoHistorico.textContent += " ✨ Novo Recorde!";
    } else if (valor > historicoPrecos.last) {
      textoPrincipal.style.color = "#c0392b"; // Vermelho (preço ruim)
    }


    li.appendChild(textoHistorico); // Adiciona o histórico ao 'li'
  }

  // 6. Atualizar o total e os itens
  somaTotal += valor;
  itens.push({ produto, valor });

  total.textContent = `Total: R$ ${somaTotal.toFixed(2)}`;

  
  inputProduto.value = "";
  inputValor.value = "";
  inputProduto.focus();
  
  
  fecharSugestoes();
}
function finalizarCompra() {
  if (itens.length === 0) {
    alert("Nenhum item adicionado!");
    return;
  }

  const nomeCompra = prompt("Dê um nome para esta compra:");
  if (!nomeCompra) {
    alert("Você precisa nomear a compra para salvar.");
    return;
  }

  const historico = JSON.parse(localStorage.getItem("compras")) || [];

  historico.push({
    nome: nomeCompra,
    data: new Date().toLocaleString(),
    itens,
    total: somaTotal
  });

  localStorage.setItem("compras", JSON.stringify(historico));
  alert(`Compra "${nomeCompra}" salva com sucesso!`);

  itens = [];
  somaTotal = 0;
  document.getElementById("lista").innerHTML = "";
  document.getElementById("tot").textContent = "Total: R$ 0.00";
}



let historicoNomesUnicos = [];


function carregarHistoricoParaAutocomplete() {
    const historico = JSON.parse(localStorage.getItem("compras")) || [];
    const todosOsItens = historico.flatMap(compra => compra.itens);
    const todosOsNomes = todosOsItens.map(item => item.produto.toLowerCase().trim());
    
  
    historicoNomesUnicos = [...new Set(todosOsNomes)].map(nome => 
        nome.charAt(0).toUpperCase() + nome.slice(1)
    ).sort(); 
}


function fecharSugestoes() {
    const resultsBox = document.getElementById("autocomplete-results");
    if (resultsBox) {
        resultsBox.style.display = "none";
    }
}

function mostrarSugestoes(valor) {
    const resultsBox = document.getElementById("autocomplete-results");
    if (!resultsBox) return; 

    // Limpa sugestões antigas
    resultsBox.innerHTML = "";
    

    const sugestoesFiltradas = valor.length === 0
        ? historicoNomesUnicos 
        : historicoNomesUnicos.filter(nome => 
            nome.toLowerCase().includes(valor.toLowerCase())
          );

    if (sugestoesFiltradas.length === 0) {
        fecharSugestoes();
        return;
    }

    // Cria os divs para cada sugestão
    sugestoesFiltradas.forEach(nome => {
        const itemDiv = document.createElement("div");

 
        const regex = new RegExp(`(${valor})`, 'gi');
        const nomeHTML = nome.replace(regex, '<strong>$1</strong>');
        itemDiv.innerHTML = nomeHTML;

        
        itemDiv.addEventListener("click", function() {
            
            document.getElementById("prod").value = nome;
        
            document.getElementById("val").focus();
            
            fecharSugestoes();
        });
        resultsBox.appendChild(itemDiv);
    });

    
    resultsBox.style.display = "block";
}


document.addEventListener('DOMContentLoaded', () => {
    
    const inputProd = document.getElementById("prod");
    
    // Só executa o código do autocomplete se estivermos na 'lista.html'
    if (inputProd) {
        
        
        carregarHistoricoParaAutocomplete()
        
        inputProd.addEventListener("input", function() {
            mostrarSugestoes(this.value);
        });

        
        inputProd.addEventListener("focus", function() {
            mostrarSugestoes(this.value);
        });

        
        document.addEventListener("click", function (e) {
            const container = document.querySelector(".autocomplete-container");
            // Se o clique NÃO foi dentro do container...
            if (container && !container.contains(e.target)) {
                fecharSugestoes();
            }
        });
    }
});


/**
 * Busca no localStorage o menor e o último preço pago por um produto.
 * @param {string} produtoNome - O nome do produto a ser pesquisado.
 * @returns {object|null} - Um objeto com { min, last } ou null se não houver histórico.
 */
function getHistoricoPrecos(produtoNome) {
  // Pega o histórico completo
  const historico = JSON.parse(localStorage.getItem("compras")) || [];
  
  // 1. Achata todos os itens de todas as compras em um único array
  const todosOsItens = historico.flatMap(compra => compra.itens);

  // 2. Normaliza o nome do produto buscado
  const nomeNormalizado = produtoNome.toLowerCase().trim();

  // 3. Filtra apenas os itens que correspondem ao produto
  const precosDoProduto = todosOsItens
    .filter(item => item.produto.toLowerCase().trim() === nomeNormalizado)
    .map(item => item.valor); // Pega apenas o valor (preço)

  // 4. Se não encontramos nenhum, retorna nulo
  if (precosDoProduto.length === 0) {
    return null;
  }

  // 5. Encontra o menor e o último preço
  const menorPreco = Math.min(...precosDoProduto);
  const ultimoPreco = precosDoProduto[precosDoProduto.length - 1]; // O último é o último no array

  return { min: menorPreco, last: ultimoPreco };
}