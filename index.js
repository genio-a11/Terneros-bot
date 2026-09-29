const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = "terneros123";

app.get('/', (req, res) => {
  res.send('Terneros Bot activo');
});

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

app.post('/webhook', (req, res) => {
  console.log('Mensaje recibido:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
