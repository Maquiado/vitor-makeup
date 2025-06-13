document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const cardsContainer = document.getElementById("cards-container");

  const modal = document.getElementById("modal-agendamento");
  const modalClose = document.getElementById("modal-close");
  const form = document.getElementById("form-agendamento");

  const filtroData = document.getElementById("filtro-data");
  const filtroHora = document.getElementById("filtro-hora");
  const btnLimparFiltro = document.getElementById("btn-limpar-filtro");
  const btnExcluir = document.getElementById("btn-excluir");

  let currentDocId = null;

  function formatDateForInput(dateStr) {
    return dateStr; // formato já compatível com input date
  }

  function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  function openModal(agendamento) {
    currentDocId = agendamento.id;

    form.nome.value = agendamento.nome || "";
    form.telefone.value = agendamento.telefone || "";
    form.email.value = agendamento.email || "";
    form.data.value = formatDateForInput(agendamento.data) || "";
    form.hora.value = agendamento.hora || "";
    form.tipo.value = agendamento.tipo || "";
    form.duracao.value = agendamento.duracao || "";
    form.valor.value = agendamento.valor || "";
    form.status.value = agendamento.status || "pendente";

    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
    currentDocId = null;
  }

  modalClose.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  function updateCard(docId, agendamento) {
    const card = cardsContainer.querySelector(`.card[data-doc-id="${docId}"]`);
    if (!card) return;

    card.innerHTML = `
      <h3>${agendamento.nome}</h3>
      <p><strong>Data:</strong> ${formatDateForDisplay(agendamento.data)}</p>
      <p><strong>Hora:</strong> ${agendamento.hora}</p>
      <p><strong>Serviço:</strong> ${agendamento.tipo}</p>
      <p><strong>Duração:</strong> ${agendamento.duracao} min</p>
      <p class="valor">R$ ${agendamento.valor}</p>
      <button class="btn-realizado" title="Marcar como realizado">✔️</button>
    `;

    const btnRealizado = card.querySelector(".btn-realizado");
    btnRealizado.addEventListener("click", (e) => {
      e.stopPropagation();

      db.collection("agendamentos").doc(agendamento.id).update({ status: "realizado" })
        .then(() => {
          card.remove();
          alert(`Agendamento de ${agendamento.nome} marcado como realizado!`);
        })
        .catch((error) => {
          console.error("Erro ao atualizar status:", error);
          alert("Erro ao marcar como realizado. Tente novamente.");
        });
    });
  }

  function carregarAgendamentos() {
    cardsContainer.innerHTML = "";

    db.collection("agendamentos")
      .where("status", "==", "pendente")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          cardsContainer.innerHTML = "<p>Nenhum agendamento pendente encontrado.</p>";
          return;
        }

        let agendamentos = [];
        querySnapshot.forEach((doc) => {
          agendamentos.push({ id: doc.id, ...doc.data() });
        });

        const dataFiltro = filtroData.value;
        const horaFiltro = filtroHora.value;

        if (dataFiltro) {
          agendamentos = agendamentos.filter(a => a.data === dataFiltro);
        }
        if (horaFiltro) {
          agendamentos = agendamentos.filter(a => a.hora === horaFiltro);
        }

        agendamentos.sort((a, b) => {
          if (a.data === b.data) {
            return a.hora.localeCompare(b.hora);
          }
          return a.data.localeCompare(b.data);
        });

        if (agendamentos.length === 0) {
          cardsContainer.innerHTML = "<p>Nenhum agendamento corresponde ao filtro.</p>";
          return;
        }

        agendamentos.forEach((agendamento) => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.dataset.docId = agendamento.id;

          card.innerHTML = `
            <h3>${agendamento.nome}</h3>
            <p><strong>Data:</strong> ${formatDateForDisplay(agendamento.data)}</p>
            <p><strong>Hora:</strong> ${agendamento.hora}</p>
            <p><strong>Serviço:</strong> ${agendamento.tipo}</p>
            <p><strong>Duração:</strong> ${agendamento.duracao} min</p>
            <p class="valor">R$ ${agendamento.valor}</p>
            <button class="btn-realizado" title="Marcar como realizado">✔️</button>
          `;

          card.addEventListener("click", () => openModal(agendamento));

          const btnRealizado = card.querySelector(".btn-realizado");
          btnRealizado.addEventListener("click", (e) => {
            e.stopPropagation();

            db.collection("agendamentos").doc(agendamento.id).update({ status: "realizado" })
              .then(() => {
                card.remove();
                alert(`Agendamento de ${agendamento.nome} marcado como realizado!`);
              })
              .catch((error) => {
                console.error("Erro ao atualizar status:", error);
                alert("Erro ao marcar como realizado. Tente novamente.");
              });
          });

          cardsContainer.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar agendamentos: ", error);
        cardsContainer.innerHTML = "<p>Erro ao carregar agendamentos.</p>";
      });
  }

  // Listener para o botão excluir (FORA do submit)
  btnExcluir.addEventListener("click", () => {
    if (!currentDocId) {
      alert("Nenhum agendamento selecionado para excluir.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.")) {
      return;
    }

    db.collection("agendamentos").doc(currentDocId).delete()
      .then(() => {
        const card = cardsContainer.querySelector(`.card[data-doc-id="${currentDocId}"]`);
        if (card) card.remove();

        closeModal();
        alert("Agendamento excluído com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao excluir agendamento: ", error);
        alert("Erro ao excluir agendamento. Tente novamente.");
      });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!currentDocId) {
      alert("Erro: Nenhum agendamento selecionado.");
      return;
    }

    const updatedData = {
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
      email: form.email.value.trim(),
      data: form.data.value,
      hora: form.hora.value,
      tipo: form.tipo.value.trim(),
      duracao: Number(form.duracao.value),
      valor: Number(form.valor.value),
      status: form.status.value,
    };

    db.collection("agendamentos").doc(currentDocId).update(updatedData)
      .then(() => {
        updateCard(currentDocId, updatedData);
        closeModal();
      })
      .catch((error) => {
        console.error("Erro ao atualizar agendamento: ", error);
        alert("Erro ao salvar alterações. Tente novamente.");
      });
  });

  filtroData.addEventListener("change", carregarAgendamentos);
  filtroHora.addEventListener("change", carregarAgendamentos);

  btnLimparFiltro.addEventListener("click", () => {
    filtroData.value = "";
    filtroHora.value = "";
    carregarAgendamentos();
  });

  carregarAgendamentos();
});
