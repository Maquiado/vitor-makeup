  const firebaseConfig = {
    apiKey: "AIzaSyCeRbnwjdUlkoIAtsET95m00Kds7xadecA",
    authDomain: "vitor-makeup.firebaseapp.com",
    projectId: "vitor-makeup",
    storageBucket: "vitor-makeup.appspot.com",
    messagingSenderId: "968145525660",
    appId: "1:968145525660:web:915f5e605adc86d527c659",
    measurementId: "G-67L0EMY6WS"
  };

  firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();

  let usuarioAtual = null;

  // Elementos DOM do modal
  const modal = document.getElementById('modalAlterarHorario');
  const formAlterarHorario = document.getElementById('formAlterarHorario');
  const agendamentoIdInput = document.getElementById('agendamentoId');
  const novaDataInput = document.getElementById('novaData');
  const novaHoraSelect = document.getElementById('novaHora');
  const btnCancelarModal = document.getElementById('btnCancelarModal');
  const btnLogout = document.getElementById('btnLogout');
  const btnNovoAgendamento = document.getElementById('novoAgendamentoBtn');
  const listaPendentes = document.getElementById('listaClienteAgendamentos');
  const listaRealizados = document.getElementById('listaMaquiagensRealizadas');

  // Gerenciar foco para acessibilidade no modal
  let ultimoFocoAntesModal = null;

auth.onAuthStateChanged(user => {
  if (user) {
    console.log('Usuário logado:', user.uid);
    usuarioAtual = user;
    carregarAgendamentosDoCliente();
  } else {
    console.log('Usuário não logado, redirecionando...');
    window.location.href = 'logincliente.html';
  }
});

async function carregarAgendamentosDoCliente() {
  listaPendentes.innerHTML = '<p>Carregando agendamentos...</p>';
  listaRealizados.innerHTML = '<p>Carregando maquiagens realizadas...</p>';

  try {
    const agendamentosSnapshot = await db.collection('agendamentos')
      .where('email', '==', usuarioAtual.email)
      .where('status', '==', 'pendente')
      .orderBy('criadoEm', 'desc')
      .get();

    if (agendamentosSnapshot.empty) {
      listaPendentes.innerHTML = '<p>Você não possui agendamentos pendentes.</p>';
    } else {
      listaPendentes.innerHTML = '';
      agendamentosSnapshot.forEach(doc => {
        const data = doc.data();
        const dataFormatada = new Date(data.data).toLocaleDateString('pt-BR');
        const horaFormatada = data.hora || '';
        const servico = data.tipo || 'Não informado';

        const item = document.createElement('article');
        item.setAttribute('role', 'listitem');
        item.classList.add('agendamento-item');
        item.innerHTML = `
          <p><strong>Data:</strong> ${dataFormatada}</p>
          <p><strong>Horário:</strong> ${horaFormatada}</p>
          <p><strong>Serviço:</strong> ${servico}</p>
          <button type="button" aria-label="Alterar horário do agendamento em ${dataFormatada} às ${horaFormatada}" 
            onclick="abrirModalAlterarHorario('${doc.id}', '${data.data}', '${data.hora}')">
            Alterar Horário
          </button>
          <button type="button" aria-label="Cancelar agendamento em ${dataFormatada} às ${horaFormatada}" 
            onclick="cancelarAgendamento('${doc.id}')">
            Cancelar
          </button>
        `;
        listaPendentes.appendChild(item);
      });
    }

    // Mesma alteração para maquiagens realizadas
    const maquiagensSnapshot = await db.collection('agendamentos')
      .where('email', '==', usuarioAtual.email)
      .where('status', '==', 'realizado')
      .orderBy('data', 'desc')
      .get();

    if (maquiagensSnapshot.empty) {
      listaRealizados.innerHTML = '<p>Você não possui maquiagens realizadas.</p>';
    } else {
      listaRealizados.innerHTML = '';
      maquiagensSnapshot.forEach(doc => {
        const data = doc.data();
        const dataFormatada = new Date(data.data).toLocaleDateString('pt-BR');
        const horaFormatada = data.hora || '';
        const servico = data.tipo || 'Não informado';

        const item = document.createElement('article');
        item.setAttribute('role', 'listitem');
        item.classList.add('agendamento-realizado');
        item.innerHTML = `
          <p><strong>Data:</strong> ${dataFormatada} às ${horaFormatada}</p>
          <p><strong>Serviço realizado:</strong> ${servico}</p>
        `;
        listaRealizados.appendChild(item);
      });
    }
  } catch (error) {
    listaPendentes.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
    listaRealizados.innerHTML = '<p>Erro ao carregar maquiagens realizadas.</p>';
    console.error('Erro ao carregar agendamentos:', error);
  }
}

  // Abre modal e preenche com dados
function abrirModalAlterarHorario(id, dataString, horarioAtual) {
  agendamentoIdInput.value = id;
  novaDataInput.value = dataString; // já no formato YYYY-MM-DD
  preencherHorariosDisponiveis(novaDataInput.value, horarioAtual);

  ultimoFocoAntesModal = document.activeElement;
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';

  document.body.style.overflow = 'hidden';

  novaDataInput.focus();
}

  // Fecha modal
  function fecharModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';

    if (ultimoFocoAntesModal) {
      ultimoFocoAntesModal.focus();
    }
  }

  // Preenche os horários disponíveis baseado na data selecionada
  function preencherHorariosDisponiveis(dataSelecionada, horarioSelecionado = '') {
    novaHoraSelect.innerHTML = '<option value="">Selecione o horário</option>';

    // Exemplo fixo - você deve adaptar para buscar do banco ou calcular horários disponíveis
    const horariosDisponiveis = [
      '09:00',
      '10:00',
      '11:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ];

    horariosDisponiveis.forEach(hora => {
      const option = document.createElement('option');
      option.value = hora;
      option.textContent = hora;
      if (hora === horarioSelecionado) {
        option.selected = true;
      }
      novaHoraSelect.appendChild(option);
    });
  }

  // Evento para alterar data no modal e atualizar horários
  novaDataInput.addEventListener('change', () => {
    preencherHorariosDisponiveis(novaDataInput.value);
  });

  // Cancelar modal via botão
  btnCancelarModal.addEventListener('click', fecharModal);

  // Fechar modal com ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      fecharModal();
    }
  });

  // Enviar formulário para alterar horário
  formAlterarHorario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = agendamentoIdInput.value;
    const novaDataVal = novaDataInput.value;
    const novoHorarioVal = novaHoraSelect.value;

    if (!novaDataVal || !novoHorarioVal) {
      alert('Por favor, selecione a nova data e horário.');
      return;
    }

    try {
      // Atualiza no Firestore (adapte nomes campos conforme seu banco)
      await db.collection('agendamentos').doc(id).update({
        data: firebase.firestore.Timestamp.fromDate(new Date(novaDataVal)),
        horario: novoHorarioVal,
      });
      alert('Horário alterado com sucesso!');
      fecharModal();
      carregarAgendamentosDoCliente();
    } catch (error) {
      alert('Erro ao alterar horário. Tente novamente.');
      console.error('Erro alterar horário:', error);
    }
  });

  // Cancelar agendamento
  async function cancelarAgendamento(id) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      await db.collection('agendamentos').doc(id).update({
        status: 'cancelado',
      });
      alert('Agendamento cancelado com sucesso.');
      carregarAgendamentosDoCliente();
    } catch (error) {
      alert('Erro ao cancelar agendamento. Tente novamente.');
      console.error('Erro cancelar agendamento:', error);
    }
  }

  // Logout
  btnLogout.addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = 'logincliente.html';
    } catch (error) {
      alert('Erro ao sair. Tente novamente.');
    }
  });

  // Novo agendamento - redirecionar
  btnNovoAgendamento.addEventListener('click', () => {
    window.location.href = 'agendamento.html';
  });

  // Expor para onclick inline (modal)
  window.abrirModalAlterarHorario = abrirModalAlterarHorario;
  window.cancelarAgendamento = cancelarAgendamento;

  document.getElementById('popupPerfil').setAttribute('aria-hidden', 'false');
  document.getElementById('popupPerfil').setAttribute('aria-hidden', 'true');

  
  const btnPerfil = document.getElementById('btnPerfil');
const popupPerfil = document.getElementById('popupPerfil');
const btnFecharPerfil = document.getElementById('btnFecharPerfil');


const spanNome = document.getElementById('perfilNome');
const spanEmail = document.getElementById('perfilEmail');
const spanTelefone = document.getElementById('perfilTelefone');
const spanNascimento = document.getElementById('perfilNascimento');

btnPerfil.addEventListener('click', async () => {
  if (!usuarioAtual) return;

  try {
    const doc = await db.collection('usuarios').doc(usuarioAtual.uid).get();
    if (doc.exists) {
      const dados = doc.data();
      spanNome.textContent = dados.nome || 'Não informado';
      spanEmail.textContent = dados.email || 'Não informado';
      spanTelefone.textContent = dados.telefone || 'Não informado';
      spanNascimento.textContent = dados.nascimento || 'Não informado';

      popupPerfil.setAttribute('aria-hidden', 'false');
    } else {
      alert('Dados do perfil não encontrados.');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do perfil:', error);
    alert('Erro ao carregar dados do perfil.');
  }
});

btnFecharPerfil.addEventListener('click', () => {
  popupPerfil.setAttribute('aria-hidden', 'true');
});
