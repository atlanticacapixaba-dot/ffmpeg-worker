const express = require("express");
const { exec } = require("child_process");

const app = express();

// Rota principal - só para testar se está no ar
app.get("/", (req, res) => {
  res.send("FFmpeg Worker está rodando 🚀");
});

// Rota para rodar um comando de teste (versão do FFmpeg)
app.get("/run", (req, res) => {
  exec("ffmpeg -version", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erro: ${error.message}`);
    }
    if (stderr) {
      return res.send(`Stderr: ${stderr}`);
    }
    res.send(`Resultado:\n${stdout}`);
  });
});

// Porta dinâmica do Railway (ou 3000 como fallback)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🎧`);
});
