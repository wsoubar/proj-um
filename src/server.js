// Fastify server example
// Import Fastify and create an instance
const fastify = require("fastify")({ logger: true });
const path = require("path");
const fs = require("fs");

// Carrega os dados do arquivo JSON de produtividade
const dataPath = path.join(__dirname, "dados.json");
// É crucial garantir que dados.json exista no mesmo diretório do server.js
let produtos;
try {
  produtos = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
} catch (error) {
  fastify.log.error(`Erro ao ler ou parsear dados.json: ${error.message}`);
  process.exit(1);
}

// Rotas
// Página principal – exibe todos os produtos, com filtro instantâneo no navegador
fastify.get("/", async (req, reply) => {
  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // Início da construção do HTML
  let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Catálogo de Produtos</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
</head>
<body class="bg-light">
  <div class="container mt-4">
    <h1 class="mb-4">Catálogo de Produtos</h1>

    <div class="mb-4" role="search">
      <div class="row g-2">
        <div class="col-md-8 col-lg-6">
          <input type="text" id="busca" class="form-control shadow-sm" placeholder="digite para filtrar" aria-label="Filtrar produtos" autocomplete="off">
        </div>
      </div>
    </div>

    <div id="contador" class="alert alert-info">${produtos.length} produto(s).</div>
    <div id="aviso-vazio" class="alert alert-warning d-none">Nenhum produto encontrado.</div>
`;

  // Início da lista de produtos
  html += `<div id="lista-produtos" class="row row-cols-1 row-cols-md-3 g-4">`;

  // Loop corrigido: O fechamento de tags deve ocorrer APÓS o loop
  produtos.forEach((p) => {
    html += `
        <div class="col produto-card" data-nome="${escapeHtml(p.nome.toLowerCase())}">
          <div class="card h-100 shadow-sm" style="width: 18rem;">
            <img src="${p.imagem}" class="card-img-top" alt="${escapeHtml(p.nome)}">
            <div class="card-body">
              <h5 class="card-title">${escapeHtml(p.nome)}</h5>
              <p class="card-text">${escapeHtml(p.descricao)}</p>
              <p class="card-text fw-bold">Preço: R$ ${p.preco.toFixed(2)}</p>
            </div>
          </div>
        </div>`;
  });

  // Fechamento da lista de produtos
  html += `</div>`;

  // Script do filtro instantâneo + fechamento
  html += `
  </div>
  <script>
    const campo = document.getElementById("busca");
    const cards = document.querySelectorAll(".produto-card");
    const contador = document.getElementById("contador");
    const aviso = document.getElementById("aviso-vazio");

    campo.addEventListener("input", () => {
      const normalizar = (s) =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const termo = normalizar(campo.value.trim());
      let visiveis = 0;
      cards.forEach((card) => {
        const nome = normalizar(card.dataset.nome);
        const mostra = nome.includes(termo);
        card.classList.toggle("d-none", !mostra);
        if (mostra) visiveis++;
      });
      contador.textContent = visiveis + " produto(s).";
      aviso.classList.toggle("d-none", visiveis !== 0);
    });
  </script>
</body>
</html>`;

  // Retorna o HTML completo
  reply.type("text/html").send(html);
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
