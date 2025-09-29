const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// Rota inicial
app.get("/", (req, res) => {
  res.send("🚀 FFmpeg Worker está rodando!");
});

// Rota para checar a versão do FFmpeg
app.get("/run", (req, res) => {
  exec("ffmpeg -version", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erro ao rodar FFmpeg: ${error.message}`);
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
