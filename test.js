const firebaseConfig = {
    apiKey: "AIzaSyCeRbnwjdUlkoIAtsET95m00Kds7xadecA",
    authDomain: "vitor-makeup.firebaseapp.com",
    projectId: "vitor-makeup",
    storageBucket: "vitor-makeup.firebasestorage.app",
    messagingSenderId: "968145525660",
    appId: "1:968145525660:web:915f5e605adc86d527c659",
    measurementId: "G-67L0EMY6WS"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();

      document.addEventListener('DOMContentLoaded', async function () {
      const calendarEl = document.getElementById('calendar');
      const controle = document.getElementById('controle');
      const dataSelecionadaEl = document.getElementById('dataSelecionada');
      const horariosDiv = document.getElementById('horariosDisponiveis');
      const formHorarios = document.getElementById('formHorarios');

      const horarios = [];
      for (let h = 8; h <= 21; h++) {
        const horaStr = (h < 10 ? '0' : '') + h + ':00';
        horarios.push(horaStr);
      }

      let diasComDisponibilidade = new Set();

      async function carregarDiasDisponiveis() {
        const snapshot = await db.collection("disponibilidade").get();
        diasComDisponibilidade = new Set(
          snapshot.docs.filter(doc => {
            const data = doc.data();
            return Array.isArray(data.horarios) && data.horarios.length > 0;
          }).map(doc => doc.id)
        );
      }

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        selectable: true,
        dateClick: async function (info) {
          const data = info.dateStr;
          // Remove destaque anterior
document.querySelectorAll('.fc-daygrid-day').forEach(cell => {
  cell.classList.remove('data-selecionada');
});

// Adiciona destaque na célula clicada
info.dayEl.classList.add('data-selecionada');
          dataSelecionadaEl.textContent = data;
          controle.style.display = 'block';
          horariosDiv.innerHTML = '';

          const docRef = await db.collection("disponibilidade").doc(data).get();
          const horariosSalvos = (docRef.exists && Array.isArray(docRef.data().horarios)) ? docRef.data().horarios : [];

          horarios.forEach(hora => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = hora;
            checkbox.name = 'horarios';
            if (horariosSalvos.includes(hora)) checkbox.checked = true;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + hora));
            horariosDiv.appendChild(label);
          });

formHorarios.onsubmit = async (e) => {
  e.preventDefault();
  const selecionados = [...formHorarios.elements['horarios']]
    .filter(c => c.checked)
    .map(c => c.value);

  if (selecionados.length > 0) {
    await db.collection("disponibilidade").doc(data).set({
      data: data,
      horarios: selecionados
    });
  } else {
    await db.collection("disponibilidade").doc(data).delete();
  }

  alert("Disponibilidade atualizada!");

  await carregarDiasDisponiveis();
await carregarDiasDisponiveis();
calendar.render();
};
        },
        dayCellDidMount: function (info) {
          const data = info.date.toISOString().split('T')[0];
          if (diasComDisponibilidade.has(data)) {
            info.el.classList.add('has-disponibilidade');
          }
        }
      });

      await carregarDiasDisponiveis();
      calendar.render();
    });

  const listaAgendamentos = document.getElementById("listaAgendamentos");
  const filtroNome = document.getElementById("filtroNome");
  const filtroData = document.getElementById("filtroData");

  const modalEditar = document.getElementById("modalEditar");
  const editData = document.getElementById("editData");
  const editHora = document.getElementById("editHora");
  const editTipo = document.getElementById("editTipo");
  const editValor = document.getElementById("editValor");
  const editTelefone = document.getElementById("editTelefone");

  let agendamentoAtualId = null;
  let agendamentoAnterior = null;

  let ultimoDoc = null;
  let primeiroDoc = null;
  let paginaStack = [];

  const LIMITE = 5;

  function showToast(msg, cor = "bg-green-500") {
    const toast = document.getElementById("toast");
    toast.className = `fixed top-4 right-4 z-50 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${cor}`;
    toast.innerText = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  async function carregarAgendamentos(paginaAnterior = false) {
  try {
    listaAgendamentos.innerHTML = ""; // limpa a lista para evitar duplicatas

let query = db.collection("agendamentos");

if (statusFiltro !== "todos") {
  query = query.where("status", "==", statusFiltro);
}

query = query.orderBy("data")
             .orderBy("hora")
             .limit(LIMITE);

    if (paginaAnterior && paginaStack.length > 1) {
      paginaStack.pop(); // remove página atual
      const anterior = paginaStack[paginaStack.length - 1];
      query = query.startAt(anterior);
    } else if (ultimoDoc) {
      query = query.startAfter(ultimoDoc);
    }

    const snap = await query.get();

    if (!snap.empty) {
      ultimoDoc = snap.docs[snap.docs.length - 1];
      if (!paginaAnterior) paginaStack.push(snap.docs[0]);
    }

    snap.forEach(doc => {
      const ag = doc.data();
      const id = doc.id;

      // Criação do card visual
      const el = document.createElement("div");
     const hoje = new Date();
const dataAgendamento = new Date(`${ag.data}T00:00:00`);
let corFundo = "bg-amarelo-claro"; // padrão: pendente

if (ag.status === "realizado") {
  corFundo = "bg-cinza-claro";
} else if (
  dataAgendamento.getDate() === hoje.getDate() &&
  dataAgendamento.getMonth() === hoje.getMonth() &&
  dataAgendamento.getFullYear() === hoje.getFullYear()
) {
  corFundo = "bg-verde-claro";
}

el.className = `p-4 rounded-lg shadow-sm mb-2 ${corFundo}`;

el.innerHTML = `
  <div>
    <strong>${ag.nome}</strong><br>
    Data: ${ag.data} - Hora: ${ag.hora}<br>
    Tipo: ${ag.tipo || "Não informado"}<br>
    Valor: R$ ${ag.valor || "0,00"}<br>
    Telefone: ${ag.telefone || "Não informado"}
  </div>
  <div class="flex gap-2 mt-2 sm:mt-0">
    <button onclick="abrirModalEditar('${id}', '${ag.data}', '${ag.hora}', '${ag.tipo}', '${ag.valor}', '${ag.telefone}')" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Editar</button>
    <button onclick="excluirAgendamento('${id}')" class="bg-laranja-escuro text-white px-3 py-1 rounded hover:bg-red-600">Excluir</button>
    ${
      ag.status === "realizado"
        ? `<button onclick="marcarComoPendente('${id}')" class="bg-green-700 text-white px-2 py-1 rounded text-sm">Remover Realizado</button>`
        : `<button onclick="marcarRealizado('${id}')" class="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-600">Pendente</button>`
    }
  </div>
`;
window.marcarComoPendente = function(id) {
  db.collection("agendamentos").doc(id).update({ status: "pendente" })
    .then(() => {
      showToast("Agendamento marcado como pendente!", "bg-yellow-600");
      carregarAgendamentos(true);
    })
    .catch(err => showToast("Erro ao atualizar status: " + err.message, "bg-red-600"));
};
window.marcarRealizado = function(id) {
  db.collection("agendamentos").doc(id).update({ status: "realizado" })
    .then(() => {
      showToast("Agendamento marcado como realizado!", "bg-green-700");
      carregarAgendamentos(true);
    })
    .catch(err => showToast("Erro ao atualizar status: " + err.message, "bg-red-600"));
};

      listaAgendamentos.appendChild(el);
    });

    // Controle de botões
    document.getElementById("btnAnterior").disabled = paginaStack.length <= 1;
    document.getElementById("btnProximo").disabled = snap.size < LIMITE;

  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);
    showToast("Erro ao carregar agendamentos", "bg-red-600");
  }
}
 function proximaPagina() {
  carregarAgendamentos(); // já considera últimoDoc para buscar próxima página
}

function paginaAnterior() {
  if (paginaStack.length > 1) {
    carregarAgendamentos(true); // ativa modo "voltar"
  }
}

  function excluirAgendamento(id) {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      db.collection("agendamentos").doc(id).delete().then(() => {
        showToast("Agendamento excluído com sucesso!", "bg-laranja-escuro");
        carregarAgendamentos(true);
      }).catch(err => showToast("Erro ao excluir: " + err.message, "bg-red-600"));
    }
  }

 function abrirModalEditar(id, data, hora, tipo = "", valor = "", telefone = "") {
  agendamentoAtualId = id;
  agendamentoAnterior = { data, hora, tipo, valor, telefone };
  editData.value = data;
  editHora.value = hora;
  editTipo.value = tipo;
  editValor.value = valor;
  editTelefone.value = telefone;
  modalEditar.classList.remove("hidden");
}

  function fecharModal() {
    modalEditar.classList.add("hidden");
    agendamentoAtualId = null;
    agendamentoAnterior = null;
  }

  function salvarEdicao() {
    const novaData = editData.value;
    const novaHora = editHora.value;
     const novaTipo = editTipo.value;
      const novaValor = editValor.value;
       const novaTelefone = editTelefone.value;

    if (!novaData || !novaHora) {
      showToast("Preencha data e hora corretamente", "bg-yellow-500");
      return;
    }

    const atualizacoes = {};
    const logs = [];

    if (agendamentoAnterior.data !== novaData) {
      atualizacoes.data = novaData;
      logs.push({
        campo: "data",
        de: agendamentoAnterior.data,
        para: novaData
      });
    }

    if (agendamentoAnterior.hora !== novaHora) {
      atualizacoes.hora = novaHora;
      logs.push({
        campo: "hora",
        de: agendamentoAnterior.hora,
        para: novaHora
      });
    }

        if (agendamentoAnterior.tipo !== novoTipo) {
      atualizacoes.tipo = novoTipo;
      logs.push({
        campo: "tipo",
        de: agendamentoAnterior.tipo,
        para: novoTipo
      });
    }

            if (agendamentoAnterior.valor !== novoValor) {
      atualizacoes.valor = novoValor;
      logs.push({
        campo: "valor",
        de: agendamentoAnterior.valor,
        para: novoValor
      });
    }

                if (agendamentoAnterior.telefone !== novoTelefone) {
      atualizacoes.telefone = novoTelefone;
      logs.push({
        campo: "telefone",
        de: agendamentoAnterior.telefone,
        para: novoTelefone
      });
    }

    if (Object.keys(atualizacoes).length === 0) {
      showToast("Nenhuma alteração detectada.", "bg-gray-500");
      return;
    }

    db.collection("agendamentos").doc(agendamentoAtualId).update(atualizacoes)
      .then(() => {
        const batch = db.batch();
        const user = auth.currentUser;
        logs.forEach(log => {
          const logRef = db.collection("logs").doc();
          batch.set(logRef, {
            agendamentoId: agendamentoAtualId,
            campo: log.campo,
            de: log.de,
            para: log.para,
            alteradoPor: user?.email || "Desconhecido",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
        });

        return batch.commit();
      })
      .then(() => {
        showToast("Alterações salvas com sucesso!");
        fecharModal();
        carregarAgendamentos(true);
      })
      .catch(err => showToast("Erro ao salvar: " + err.message, "bg-red-600"));
  }

  function logout() {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  }

  function alternarStatus(id, statusAtual) {
  const novoStatus = statusAtual === "pendente" ? "atendido" : "pendente";
  db.collection("agendamentos").doc(id).update({ status: novoStatus })
    .then(() => {
      showToast("Status atualizado para: " + novoStatus, "bg-blue-500");
      carregarAgendamentos(true);
    })
    .catch(err => showToast("Erro ao atualizar status: " + err.message, "bg-red-600"));
}
function marcarRealizado(id, statusAtual) {
  const novoStatus = statusAtual === "pendente" ? "pendente" : "pendente";
  db.collection("agendamentos").doc(id).update({ status: novoStatus })
    .then(() => {
      showToast("Status atualizado para: " + novoStatus, "bg-green-600");
      carregarAgendamentos(false, true);
    })
    .catch(err => showToast("Erro ao atualizar status: " + err.message, "bg-red-600"));
}
function escutarAgendamentosTempoReal() {
  db.collection("agendamentos")
    .orderBy("data")
    .orderBy("hora")
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const ag = change.doc.data();
          mostrarAgendamentoVisual(ag, change.doc.id);

          if (!document.getElementById(`agendamento-${change.doc.id}`)) {
            showToast("Novo agendamento recebido! 📅");
            // somOpcional();
          }
        }
      });
    });
}
function mostrarAgendamentoVisual(ag, id) {
  if (document.getElementById(`agendamento-${id}`)) return;

  const el = document.createElement("div");
  el.id = `agendamento-${id}`;
  el.className = "bg-verde-claro p-4 rounded-lg shadow-sm flex justify-between items-center";
  el.innerHTML = `
    <div>
      <strong>${ag.nome}</strong><br>
      Data: ${ag.data} - Hora: ${ag.hora}
    </div>
    <div class="flex gap-2">
      <button onclick="abrirModalEditar('${id}', '${ag.data}', '${ag.hora}', '${ag.tipo}', '${ag.valor}', '${ag.telefone}')" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Editar</button>
      <button onclick="excluirAgendamento('${id}')" class="bg-laranja-escuro text-white px-3 py-1 rounded hover:bg-red-600">Excluir</button>
    </div>
  `;
  listaAgendamentos.prepend(el);
}
function somOpcional() {
  const audio = document.getElementById("somNotificacao");
  if (audio) {
    audio.play().catch(() => {}); // evita erro se estiver bloqueado
  }
}
auth.onAuthStateChanged(user => {
  if (user) {
    carregarAgendamentos(); // carrega ao entrar
    // escutarAgendamentosTempoReal(); // só use se quiser escuta ativa
  } else {
    window.location.href = "login.html";
  }
});
// Botão Liberar Agenda

document.getElementById('abrirAgendaBtn').addEventListener('click', async () => {
  const db = firebase.firestore();

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth(); // 0-indexado
  const totalDias = new Date(ano, mes + 1, 0).getDate(); // Dias no mês atual

  const horariosPadrao = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`); // 09:00 até 20:00

  for (let dia = hoje.getDate(); dia <= totalDias; dia++) {
    const dataFormatada = new Date(ano, mes, dia).toISOString().split('T')[0]; // yyyy-mm-dd
    const refDia = db.collection('disponibilidade').doc(dataFormatada);

    try {
      const doc = await refDia.get();
      if (!doc.exists) {
        await refDia.set({
          horarios: horariosPadrao,
        });
        console.log(`✅ Criado: ${dataFormatada}`);
      } else {
        console.log(`⚠️ Já existe disponibilidade para ${dataFormatada}`);
      }
    } catch (error) {
      console.error(`Erro ao processar ${dataFormatada}`, error);
    }
  }

  // ✅ Atualiza o FullCalendar, se você estiver usando eventSources com função ou url
  if (window.calendar) {
    window.calendar.refetchEvents();
  }
});


// Realizados/ Pendentes
function filtrarStatus(status) {
  statusFiltro = status;
  ultimoDoc = null;
  paginaStack = [];
  carregarAgendamentos();
}
let statusFiltro = "todos"; // ou 'pendente' ou 'realizado'


