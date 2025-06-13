document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  const listaServicos = document.getElementById("lista-servicos");
  const modal = document.getElementById("modal-servico");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.querySelector("#modal-servico .modal-close");
  const formServico = document.getElementById("form-servico");
  const btnNovoServico = document.getElementById("btn-novo-servico");
  const btnCancelar = document.getElementById("btn-cancelar");

  const inputNome = document.getElementById("nome-servico");
  const inputDescricao = document.getElementById("descricao-servico");
  const inputTempo = document.getElementById("tempo-servico");
  const inputValor = document.getElementById("valor-servico");

  let editandoServicoId = null;

  function abrirModal() {
    modal.style.display = "flex";
  }

  function fecharModal() {
    modal.style.display = "none";
    formServico.reset();
    editandoServicoId = null;
  }

  function renderizarServicos(servicos) {
    listaServicos.innerHTML = "";
    servicos.forEach(doc => {
      const servico = doc.data();
      const id = doc.id;

      const div = document.createElement("div");
      div.classList.add("servico-item");

      div.innerHTML = `
        <div class="servico-info">
          <h3>${servico.nome}</h3>
          <p>${servico.descricao || ""}</p>
          <p><strong>Tempo:</strong> ${servico.tempo} min</p>
          <p><strong>Valor:</strong> R$ ${parseFloat(servico.valor).toFixed(2).replace(".", ",")}</p>
        </div>
        <div class="servico-acoes">
          <button class="edit">Editar</button>
          <button class="delete">Excluir</button>
        </div>
      `;

      div.querySelector(".edit").addEventListener("click", () => {
        editandoServicoId = id;
        modalTitle.textContent = "Editar Serviço";
        inputNome.value = servico.nome;
        inputDescricao.value = servico.descricao || "";
        inputTempo.value = servico.tempo;
        inputValor.value = servico.valor;
        abrirModal();
      });

      div.querySelector(".delete").addEventListener("click", () => {
        if(confirm(`Excluir o serviço "${servico.nome}"?`)) {
          db.collection("servicos").doc(id).delete()
            .then(() => {
              alert("Serviço excluído com sucesso!");
              carregarServicos();
            })
            .catch(err => alert("Erro ao excluir serviço: " + err.message));
        }
      });

      listaServicos.appendChild(div);
    });
  }

  function carregarServicos() {
    db.collection("servicos").get()
      .then(snapshot => {
        renderizarServicos(snapshot.docs);
      })
      .catch(err => {
        alert("Erro ao carregar serviços: " + err.message);
      });
  }

  btnNovoServico.addEventListener("click", () => {
    editandoServicoId = null;
    modalTitle.textContent = "Novo Serviço";
    formServico.reset();
    abrirModal();
  });

  modalClose.addEventListener("click", fecharModal);
  btnCancelar.addEventListener("click", fecharModal);

  formServico.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const descricao = inputDescricao.value.trim();
    const tempo = parseInt(inputTempo.value);
    const valor = parseFloat(inputValor.value);

    if(!nome || tempo <= 0 || valor < 0) {
      alert("Preencha os campos corretamente.");
      return;
    }

    const dados = { nome, descricao, tempo, valor };

    if(editandoServicoId) {
      // Editar
      db.collection("servicos").doc(editandoServicoId).update(dados)
        .then(() => {
          alert("Serviço atualizado!");
          fecharModal();
          carregarServicos();
        })
        .catch(err => alert("Erro ao atualizar serviço: " + err.message));
    } else {
      // Criar novo
      db.collection("servicos").add(dados)
        .then(() => {
          alert("Serviço criado!");
          fecharModal();
          carregarServicos();
        })
        .catch(err => alert("Erro ao criar serviço: " + err.message));
    }
  });

  // Carrega serviços ao iniciar
  carregarServicos();
});
