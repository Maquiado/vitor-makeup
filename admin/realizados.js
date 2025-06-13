document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const cardsContainer = document.getElementById("cards-container");

  function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  function carregarAgendamentosRealizados() {
    cardsContainer.innerHTML = "";

    db.collection("agendamentos")
      .where("status", "==", "realizado")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          cardsContainer.innerHTML = "<p>Nenhum agendamento realizado encontrado.</p>";
          return;
        }

        querySnapshot.forEach((doc) => {
          const agendamento = { id: doc.id, ...doc.data() };

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
            <button class="btn-excluir" title="Excluir agendamento">🗑️ Excluir</button>
          `;

          const btnExcluir = card.querySelector(".btn-excluir");
          btnExcluir.addEventListener("click", (e) => {
            e.stopPropagation();

            if (!confirm(`Confirma exclusão do agendamento de ${agendamento.nome}?`)) {
              return;
            }

            db.collection("agendamentos").doc(agendamento.id).delete()
              .then(() => {
                card.remove();
                alert("Agendamento excluído com sucesso!");
              })
              .catch((error) => {
                console.error("Erro ao excluir agendamento:", error);
                alert("Erro ao excluir agendamento. Tente novamente.");
              });
          });

          cardsContainer.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar agendamentos realizados:", error);
        cardsContainer.innerHTML = "<p>Erro ao carregar agendamentos realizados.</p>";
      });
  }

  carregarAgendamentosRealizados();

  // Mantém o usuário autenticado
  firebase.auth().onAuthStateChanged(user => {
    if (!user) window.location.href = "login.html";
  });
});