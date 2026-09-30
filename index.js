const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/', (req, res) => res.send('Bot Terneros activo'));

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado');
    res.status(200).send(challenge);
  } else {
    console.log('Verificación fallida. Token recibido:', token);
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log('POST recibido en /webhook');
  try {
    const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (msg) {
      const from = msg.from;
      const text = msg.text?.body?.toLowerCase() || '';
      console.log('Mensaje de', from, ':', text);

      let reply = 'Hola, soy el bot de Terneros. Escríbeme *hola* para empezar.';
      if (text.includes('hola')) reply = '¡Hola! ¿En qué te ayudo con tus terneros?';

      const r = await axios.post(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: reply }
        },
        { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
      );
      console.log('Respuesta enviada, estado:', r.status);
    } else {
      console.log('POST sin mensaje (puede ser un estado de entrega)');
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('Error enviando:', e.response?.status, JSON.stringify(e.response?.data) || e.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Servidor en puerto ' + PORT));
