const express = require("express");
const { exec } = require("child_process");
const app = express();

// endpoint inicial
app.get("/", (req, res) => {
  res.send("🚀 FFmpeg Worker está rodando!");
});

// exemplo de endpoint para teste
app.get("/run", (req, res) => {
  res.send("✅ Endpoint /run funcionando!");
});

// exemplo usando ffmpeg
app.get("/convert", (req, res) => {
  exec("ffmpeg -version", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erro: ${stderr}`);
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});

// porta obrigatória do Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
