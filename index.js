const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/', (req, res) => res.send('Bot Terneros activo 🐄'));

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const msg = change?.value?.messages?.[0];
    if (msg) {
      const from = msg.from;
      const text = msg.text?.body?.toLowerCase() || '';
      let reply = 'Hola 🐄 Soy el bot de Terneros. Escribe:\n1️⃣ Precio\n2️⃣ Ubicación\n3️⃣ Hablar con asesor';

      if (text.includes('1') || text.includes('precio')) reply = '🐄 Terneros de 250-300kg: $1.850.000 c/u. ¿Cuántos necesitas?';
      else if (text.includes('2') || text.includes('ubic')) reply = '📍 Estamos en Planeta Rica, Córdoba. Hacemos envíos a toda la costa.';
      else if (text.includes('3') || text.includes('asesor')) reply = '👨‍🌾 Te conecto con un asesor en un momento...';
      else if (text.includes('hola')) reply = '¡Hola! 👋 Bienvenido a Terneros El Paraíso 🐄\nEscribe 1, 2 o 3 para ayudarte.';

      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: reply }
      }, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
      });
      console.log('Mensaje enviado a', from);
    }
    res.sendStatus(200);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
