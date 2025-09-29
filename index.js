const express = require("express");
const { exec } = require("child_process");
const app = express();

app.get("/", (req, res) => {
  res.send("FFmpeg Worker está rodando 🚀");
});

// Exemplo de endpoint para rodar um comando FFmpeg
app.get("/run", (req, res) => {
  const cmd = 'ffmpeg -version'; // aqui você pode depois trocar pelo comando que gerar seus vídeos
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erro: ${error.message}`);
    }
    if (stderr) {
      return res.send(`Stderr: ${stderr}`);
    }
    res.send(`Resultado: ${stdout}`);
  });
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000 🎧");
});
