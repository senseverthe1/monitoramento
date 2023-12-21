// const puppeteer = require('puppeteer');

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://casino.betfair.com/pt-br/');
//     while(true){
//         await page.waitForTimeout(5000);
//         const valoresIndividuais = await page.$$eval('#root > div > div:nth-child(4) > div:nth-child(2) > div > div.zone-content > div > div:nth-child(1) > div > div.table-details-wrapper > div.table-results > div > span', spans => spans.map(span => span.textContent.trim()));
//         console.log('Valores individuais:', valoresIndividuais);
//     }

//     await browser.close();
// })();

const puppeteer = require('puppeteer');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Conectar o Socket.io
io.on('connection', async (socket) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://casino.betfair.com/pt-br/');

  // Enviar os valores individuais quando um cliente se conecta pela primeira vez
  const valoresIndividuais = await page.$$eval('#root > div > div:nth-child(4) > div:nth-child(2) > div > div.zone-content > div > div:nth-child(1) > div > div.table-details-wrapper > div.table-results > div > span', spans => spans.map(span => span.textContent.trim()));
  console.log('Valores individuais:', valoresIndividuais);
  socket.emit('updateValoresIndividuais', valoresIndividuais);

  // Atualizar os valores e emitir para os clientes
  setInterval(async () => {
    await page.waitForTimeout(5000);
    const novosValores = await page.$$eval('#root > div > div:nth-child(4) > div:nth-child(2) > div > div.zone-content > div > div:nth-child(1) > div > div.table-details-wrapper > div.table-results > div > span', spans => spans.map(span => span.textContent.trim()));
    console.log('Novos Valores:', novosValores);
    io.emit('updateValoresIndividuais', novosValores);
  }, 5000);

  // Fechar o monitoramento quando o cliente desconectar
  socket.on('disconnect', async () => {
    await browser.close();
  });
});

// Iniciar o servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
