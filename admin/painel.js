document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  const totalClientesEl = document.getElementById("total-clientes");
  const agendamentosPendentesEl = document.getElementById("agendamentos-pendentes");
  const agendamentosRealizadosEl = document.getElementById("agendamentos-realizados");
  const receitaMesEl = document.getElementById("receita-mes");

  // Pega total de clientes
  db.collection("usuarios").where("tipo", "==", "cliente").get()
    .then(snapshot => {
      totalClientesEl.textContent = snapshot.size;
    })
    .catch(() => {
      totalClientesEl.textContent = "Erro ao carregar";
    });

  // Função pra formatar valor em R$
  function formatarDinheiro(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  // Pega agendamentos pendentes de hoje
  const hoje = new Date();
  const dataHoje = hoje.toISOString().slice(0, 10); // yyyy-mm-dd

  db.collection("agendamentos")
    .where("data", "==", dataHoje)
    .where("status", "==", "pendente")
    .get()
    .then(snapshot => {
      agendamentosPendentesEl.textContent = snapshot.size;
    })
    .catch(() => {
      agendamentosPendentesEl.textContent = "Erro";
    });

  // Pega agendamentos realizados no mês atual
  const ano = hoje.getFullYear();
  const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");

  db.collection("agendamentos")
    .where("status", "==", "realizado")
    .get()
    .then(snapshot => {
      // Filtra só do mês atual
      const realizadosMes = snapshot.docs.filter(doc => {
        const agendamento = doc.data();
        return agendamento.data.startsWith(`${ano}-${mes}`);
      });
      agendamentosRealizadosEl.textContent = realizadosMes.length;

      // Soma receita
      const receita = realizadosMes.reduce((total, doc) => {
        const ag = doc.data();
        const valor = parseFloat(ag.valor);
        return total + (isNaN(valor) ? 0 : valor);
      }, 0);
      receitaMesEl.textContent = formatarDinheiro(receita);
    })
    .catch(() => {
      agendamentosRealizadosEl.textContent = "Erro";
      receitaMesEl.textContent = "Erro";
    });
});