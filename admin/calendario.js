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
      const hoje = new Date();
      const dataClicada = new Date(data + 'T00:00:00'); // força meia-noite da data clicada
      const hojeInicio = new Date(hoje.toDateString()); // hoje 00:00

      if (dataClicada < hojeInicio) {
        alert("Não é possível editar dias que já passaram.");
        return;
      }

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
