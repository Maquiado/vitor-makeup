document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  const listaPromocoes = document.getElementById("lista-promocoes");
  const modal = document.getElementById("modal-promocao");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.querySelector("#modal-promocao .modal-close");
  const formPromocao = document.getElementById("form-promocao");
  const btnNovaPromocao = document.getElementById("btn-nova-promocao");
  const btnCancelar = document.getElementById("btn-cancelar");

  const inputCodigo = document.getElementById("codigo-promocao");
  const inputDescricao = document.getElementById("descricao-promocao");
  const inputDesconto = document.getElementById("desconto-promocao");
  const inputValidade = document.getElementById("validade-promocao");

  let editandoPromocaoId = null;

  function abrirModal() {
    modal.style.display = "flex";
  }

  function fecharModal() {
    modal.style.display = "none";
    formPromocao.reset();
    editandoPromocaoId = null;
  }

  function renderizarPromocoes(promocoes) {
    listaPromocoes.innerHTML = "";
    promocoes.forEach(doc => {
      const promocao = doc.data();
      const id = doc.id;

      const div = document.createElement("div");
      div.classList.add("promocao-item");

      // Formatando data para dd/mm/yyyy
      let validadeStr = "";
      if(promocao.validade) {
        const d = new Date(promocao.validade.seconds * 1000);
        validadeStr = d.toLocaleDateString("pt-BR");
      }

      div.innerHTML = `
        <div class="promocao-info">
          <h3>${promocao.codigo}</h3>
          <p>${promocao.descricao || ""}</p>
          <p><strong>Desconto:</strong> ${parseFloat(promocao.desconto).toFixed(0)}%</p>
          <p><strong>Validade:</strong> ${validadeStr}</p>
        </div>
        <div class="promocao-acoes">
          <button class="edit">Editar</button>
          <button class="delete">Excluir</button>
        </div>
      `;

      div.querySelector(".edit").addEventListener("click", () => {
        editandoPromocaoId = id;
        modalTitle.textContent = "Editar Promoção / Cupom";
        inputCodigo.value = promocao.codigo;
        inputDescricao.value = promocao.descricao || "";
        inputDesconto.value = promocao.desconto;
        if(promocao.validade) {
          const d = new Date(promocao.validade.seconds * 1000);
          inputValidade.value = d.toISOString().slice(0,10);
        } else {
          inputValidade.value = "";
        }
        abrirModal();
      });

      div.querySelector(".delete").addEventListener("click", () => {
        if(confirm(`Excluir a promoção/cupom "${promocao.codigo}"?`)) {
          db.collection("promocoes").doc(id).delete()
            .then(() => {
              alert("Promoção excluída com sucesso!");
              carregarPromocoes();
            })
            .catch(err => alert("Erro ao excluir promoção: " + err.message));
        }
      });

      listaPromocoes.appendChild(div);
    });
  }

  function carregarPromocoes() {
    db.collection("promocoes").get()
      .then(snapshot => {
        renderizarPromocoes(snapshot.docs);
      })
      .catch(err => {
        alert("Erro ao carregar promoções: " + err.message);
      });
  }

  btnNovaPromocao.addEventListener("click", () => {
    editandoPromocaoId = null;
    modalTitle.textContent = "Nova Promoção / Cupom";
    formPromocao.reset();
    abrirModal();
  });

  modalClose.addEventListener("click", fecharModal);
  btnCancelar.addEventListener("click", fecharModal);

  formPromocao.addEventListener("submit", (e) => {
    e.preventDefault();

    const codigo = inputCodigo.value.trim();
    const descricao = inputDescricao.value.trim();
    const desconto = parseFloat(inputDesconto.value);
    const validadeStr = inputValidade.value;

    if (!codigo || desconto < 0 || desconto > 100 || !validadeStr) {
      alert("Preencha os campos corretamente (código, desconto entre 0-100% e validade).");
      return;
    }

    const validade = new Date(validadeStr);
    if (isNaN(validade.getTime())) {
      alert("Data de validade inválida.");
      return;
    }

    const dados = {
      codigo,
      descricao,
      desconto,
      validade: firebase.firestore.Timestamp.fromDate(validade),
    };

    if (editandoPromocaoId) {
      // Editar
      db.collection("promocoes").doc(editandoPromocaoId).update(dados)
        .then(() => {
          alert("Promoção atualizada!");
          fecharModal();
          carregarPromocoes();
        })
        .catch(err => alert("Erro ao atualizar promoção: " + err.message));
    } else {
      // Criar novo
      db.collection("promocoes").add(dados)
        .then(() => {
          alert("Promoção criada!");
          fecharModal();
          carregarPromocoes();
        })
        .catch(err => alert("Erro ao criar promoção: " + err.message));
    }
  });

  // Carrega promoções ao iniciar
  carregarPromocoes();
});
