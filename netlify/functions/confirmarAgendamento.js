const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./path-to-service-account.json')),
    databaseURL: "https://<seu-projeto>.firebaseio.com"
  });
}

const db = admin.firestore();

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    const { tipo, valor, duracao, dataAgendamento, hora, nome, telefone, email } = data;

    if (!tipo || !valor || !duracao || !dataAgendamento || !hora || !nome || !telefone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados incompletos para agendamento.' }),
      };
    }

    // Verificar disponibilidade do horário (exemplo)
    const agendamentosNoHorario = await db.collection('agendamentos')
      .where('data', '==', dataAgendamento)
      .where('hora', '==', hora)
      .get();

    if (!agendamentosNoHorario.empty) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Horário já reservado.' }),
      };
    }

    const novoAgendamento = {
      tipo,
      valor,
      duracao,
      data: dataAgendamento,
      hora,
      nome,
      telefone,
      email,
      status: 'pendente',
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('agendamentos').add(novoAgendamento);

    return {
      statusCode: 200,
      body: JSON.stringify({ sucesso: true, mensagem: 'Agendamento confirmado com sucesso!' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};