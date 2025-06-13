document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  // Elementos da página
  const filtroInput = document.getElementById("filtro-texto");
  const clientesLista = document.getElementById("clientes-lista");

  const modal = document.getElementById("modal-cliente");
  const modalClose = document.getElementById("modal-close");

  // Visualização
  const viewInfo = document.getElementById("view-info");
  const clienteNome = document.getElementById("cliente-nome");
  const clienteEmail = document.getElementById("cliente-email");
  const clienteTelefone = document.getElementById("cliente-telefone");
  const clienteIdade = document.getElementById("cliente-idade");

  // Formulário edição
  const formEditar = document.getElementById("form-editar");
  const inputNome = document.getElementById("edit-nome");
  const inputEmail = document.getElementById("edit-email");
  const inputTelefone = document.getElementById("edit-telefone");
  const btnCancelar = document.getElementById("btn-cancelar");

  // Botões
  const btnEditar = document.getElementById("btn-editar");
  const btnExcluir = document.getElementById("btn-excluir");

  // Agendamentos
  const agendamentosPendentes = document.getElementById("agendamentos-pendentes");
  const agendamentosRealizados = document.getElementById("agendamentos-realizados");

  let clientes = [];
  let clienteAtual = null;

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return "";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  function limparListaClientes() {
    clientesLista.innerHTML = "";
  }

  function criarItemCliente(cliente) {
    const div = document.createElement("div");
    div.classList.add("cliente-item");
    const idade = calcularIdade(cliente.nascimento);
    div.textContent = `${cliente.nome} (${idade} anos)`;
    div.dataset.clienteId = cliente.id;
    div.style.userSelect = "none";

    div.addEventListener("click", () => abrirModalCliente(cliente));

    return div;
  }

  function abrirModalCliente(cliente) {
    clienteAtual = cliente;

    // Mostrar modo visualização e esconder formulário
    viewInfo.style.display = "block";
    formEditar.style.display = "none";

    clienteNome.textContent = cliente.nome;
    clienteEmail.textContent = cliente.email;
    clienteTelefone.textContent = cliente.telefone;
    clienteIdade.textContent = calcularIdade(cliente.nascimento);

    agendamentosPendentes.innerHTML = "";
    agendamentosRealizados.innerHTML = "";

    db.collection("agendamentos")
      .where("email", "==", cliente.email)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          agendamentosPendentes.innerHTML = "<li>Nenhum agendamento encontrado.</li>";
          agendamentosRealizados.innerHTML = "<li>Nenhum agendamento encontrado.</li>";
          return;
        }

        const pendentes = [];
        const realizados = [];

        querySnapshot.forEach((doc) => {
          const ag = doc.data();

          let valorFormatado = "N/A";
          if (typeof ag.valor === "number") {
            valorFormatado = `R$ ${ag.valor.toFixed(2)}`;
          } else if (!isNaN(parseFloat(ag.valor))) {
            valorFormatado = `R$ ${parseFloat(ag.valor).toFixed(2)}`;
          }

          const itemTexto = `${ag.data} ${ag.hora} - ${ag.tipo} (${valorFormatado})`;

          if (ag.status === "pendente") pendentes.push(itemTexto);
          else if (ag.status === "realizado") realizados.push(itemTexto);
        });

        agendamentosPendentes.innerHTML = pendentes.length
          ? pendentes.map(texto => `<li>${texto}</li>`).join("")
          : "<li>Nenhum agendamento pendente.</li>";

        agendamentosRealizados.innerHTML = realizados.length
          ? realizados.map(texto => `<li>${texto}</li>`).join("")
          : "<li>Nenhum agendamento realizado.</li>";
      })
      .catch((error) => {
        console.error("Erro ao buscar agendamentos:", error);
        agendamentosPendentes.innerHTML = "<li>Erro ao carregar agendamentos.</li>";
        agendamentosRealizados.innerHTML = "<li>Erro ao carregar agendamentos.</li>";
      });

    modal.style.display = "flex";
  }

  // Abrir formulário para edição, preenchendo os inputs
  btnEditar.addEventListener("click", () => {
    if (!clienteAtual) return;

    viewInfo.style.display = "none";
    formEditar.style.display = "block";

    inputNome.value = clienteAtual.nome || "";
    inputEmail.value = clienteAtual.email || "";
    inputTelefone.value = clienteAtual.telefone || "";
  });

  // Cancelar edição, volta para modo visualização
  btnCancelar.addEventListener("click", (e) => {
    e.preventDefault();
    formEditar.style.display = "none";
    viewInfo.style.display = "block";
  });

  // Salvar edição
  formEditar.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!clienteAtual) return;

    const nomeEditado = inputNome.value.trim();
    const emailEditado = inputEmail.value.trim();
    const telefoneEditado = inputTelefone.value.trim();

    if (!nomeEditado || !emailEditado) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    db.collection("usuarios").doc(clienteAtual.id).update({
      nome: nomeEditado,
      email: emailEditado,
      telefone: telefoneEditado,
    }).then(() => {
      alert("Cliente atualizado com sucesso!");

      // Atualiza clienteAtual e interface
      clienteAtual.nome = nomeEditado;
      clienteAtual.email = emailEditado;
      clienteAtual.telefone = telefoneEditado;

      abrirModalCliente(clienteAtual);
      mostrarClientes(clientes);
    }).catch((error) => {
      alert("Erro ao atualizar cliente: " + error.message);
    });
  });

  // Excluir cliente
  btnExcluir.addEventListener("click", () => {
    if (!clienteAtual) return;

    const confirmacao = confirm(`Tem certeza que deseja excluir o cliente "${clienteAtual.nome}"? Esta ação não pode ser desfeita.`);
    if (!confirmacao) return;

    db.collection("usuarios").doc(clienteAtual.id).delete()
      .then(() => {
        alert("Cliente excluído com sucesso!");
        modal.style.display = "none";

        clientes = clientes.filter(c => c.id !== clienteAtual.id);
        mostrarClientes(clientes);
      })
      .catch((error) => {
        alert("Erro ao excluir cliente: " + error.message);
      });
  });

  // Fechar modal
  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Filtrar clientes pela busca
  filtroInput.addEventListener("input", () => {
    const texto = filtroInput.value.toLowerCase().trim();

    if (!texto) {
      mostrarClientes(clientes);
      return;
    }

    const filtrados = clientes.filter((cliente) => {
      return (
        (cliente.nome && cliente.nome.toLowerCase().includes(texto)) ||
        (cliente.email && cliente.email.toLowerCase().includes(texto)) ||
        (cliente.telefone && cliente.telefone.toLowerCase().includes(texto))
      );
    });

    mostrarClientes(filtrados);
  });

  // Carregar clientes do Firestore
  function carregarClientes() {
    db.collection("usuarios")
      .where("tipo", "==", "cliente")
      .get()
      .then((querySnapshot) => {
        clientes = [];
        querySnapshot.forEach((doc) => {
          clientes.push({ id: doc.id, ...doc.data() });
        });

        mostrarClientes(clientes);
      })
      .catch((error) => {
        console.error("Erro ao carregar clientes:", error);
        clientesLista.innerHTML = "<p>Erro ao carregar clientes.</p>";
      });
  }

  // Mostrar clientes na lista
  function mostrarClientes(lista) {
    limparListaClientes();
    if (lista.length === 0) {
      clientesLista.innerHTML = "<p>Nenhum cliente encontrado.</p>";
      return;
    }

    lista.forEach((cliente) => {
      clientesLista.appendChild(criarItemCliente(cliente));
    });
  }

  function limparListaClientes() {
    clientesLista.innerHTML = "";
  }

  // Inicializar
  carregarClientes();
});
