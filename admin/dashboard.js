document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  const totalClientesEl = document.getElementById("total-clientes");
  const agendamentosPendentesEl = document.getElementById("agendamentos-pendentes");
  const agendamentosRealizadosEl = document.getElementById("agendamentos-realizados");
  const receitaMesEl = document.getElementById("receita-mes");

  function formatarDinheiro(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  // Função para carregar total clientes em tempo real
  function carregarTotalClientes() {
    db.collection("usuarios").where("tipo", "==", "cliente")
      .onSnapshot(snapshot => {
        totalClientesEl.textContent = snapshot.size;
      }, () => {
        totalClientesEl.textContent = "Erro ao carregar";
      });
  }

  // Função para carregar agendamentos pendentes de hoje
  function carregarPendentesHoje() {
    const hoje = new Date();
    const dataHoje = hoje.toISOString().slice(0, 10);

    db.collection("agendamentos")
      .where("data", "==", dataHoje)
      .where("status", "==", "pendente")
      .onSnapshot(snapshot => {
        agendamentosPendentesEl.textContent = snapshot.size;
      }, () => {
        agendamentosPendentesEl.textContent = "Erro";
      });
  }

  // Função para carregar agendamentos realizados e receita do mês atual
function carregarRealizadosMes() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = (hoje.getMonth() + 1).toString().padStart(2, "0");

  const primeiroDia = `${ano}-${mes}-01`;
  const ultimoDia = `${ano}-${mes}-${new Date(ano, hoje.getMonth() + 1, 0).getDate()}`;

  db.collection("agendamentos")
    .where("status", "==", "realizado")
    .where("data", ">=", primeiroDia)
    .where("data", "<=", ultimoDia)
    .get()  // Use get() ao invés de onSnapshot pra evitar problema se não tiver índice ainda
    .then(snapshot => {
      agendamentosRealizadosEl.textContent = snapshot.size;

      const receita = snapshot.docs.reduce((total, doc) => {
        const valorRaw = doc.data().valor;
        // tenta converter valor para número, com fallback zero
        const valor = Number(valorRaw) || 0;
        return total + valor;
      }, 0);

      receitaMesEl.textContent = formatarDinheiro(receita);
    })
    .catch(err => {
      console.error("Erro ao carregar agendamentos realizados:", err);
      agendamentosRealizadosEl.textContent = "Erro";
      receitaMesEl.textContent = "Erro";
    });
}


  carregarTotalClientes();
  carregarPendentesHoje();
  carregarRealizadosMes();
});
