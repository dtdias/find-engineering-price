const express = require('express');
const path = require('path');
const routes = require('./routes');
const app = express();
const ADMIN_PORT = process.env.ADMIN_PORT || 3002;

app.use(express.json());
app.use('/js', express.static(__dirname + '/static', { cacheControl: true, lastModified: true }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname + '/views'));
app.use(...routes)

// Iniciando o servidor
app.listen(ADMIN_PORT, () => {
  console.log(`Servidor rodando em http://localhost:${ADMIN_PORT}`);
});