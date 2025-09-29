const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json()); // importante para receber JSON

app.get("/", (req, res) => {
  res.send("🚀 FFmpeg Worker está rodando!");
});

app.get("/run", (req, res) => {
  exec("ffmpeg -version", (error, stdout, stderr) => {
    if (error) return res.status(500).send(error.message);
    res.type("text/plain").send(stdout || stderr);
  });
});

/**
 * POST /compose
 * Body JSON: { imageUrl, audioUrl, subtitleUrl, width, height, outName }
 * - Baixa imagem, áudio e legenda
 * - Roda FFmpeg (estilo “imagem + áudio + legenda”) 
 * - Retorna o arquivo mp4 gerado
 */
app.post("/compose", async (req, res) => {
  try {
    const {
      imageUrl,
      audioUrl,
      subtitleUrl,
      width = 1280,
      height = 720,
      outName = "output.mp4",
    } = req.body || {};

    if (!imageUrl || !audioUrl) {
      return res.status(400).json({ error: "Envie imageUrl e audioUrl" });
    }

    const tmpImage = "/tmp/image.jpg";
    const tmpAudio = "/tmp/audio.mp3";
    const tmpSubs  = "/tmp/legendas.srt";
    const outFile  = `/tmp/${outName}`;

    // limpa restos de execuções anteriores
    for (const f of [tmpImage, tmpAudio, tmpSubs, outFile]) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }

    // baixa arquivos
    const dlImage = `wget -q -O ${tmpImage} "${imageUrl}"`;
    const dlAudio = `wget -q -O ${tmpAudio} "${audioUrl}"`;
    const cmds = [dlImage, dlAudio];

    if (subtitleUrl) {
      const dlSubs = `wget -q -O ${tmpSubs} "${subtitleUrl}"`;
      cmds.push(dlSubs);
    }

    // monta filtro de legendas (se tiver SRT)
    const subsFilter = subtitleUrl
      ? `,subtitles='${tmpSubs}':charenc=UTF-8:force_style='FontName=DejaVu Serif,FontSize=42,PrimaryColour=&H00FFFFFF&,OutlineColour=&H40404000&,BorderStyle=1,Outline=3,Shadow=1,Bold=1,Alignment=2,MarginV=100'`
      : "";

    // comando FFmpeg: imagem parada + áudio + (opcional) legenda
    const ffmpegCmd = [
      `ffmpeg -y -hide_banner`,
      `-loop 1 -i ${tmpImage}`,
      `-i ${tmpAudio}`,
      `-vf "fps=1,scale=${width}:${height}${subsFilter}"`,
      `-c:v libx264 -tune stillimage -pix_fmt yuv420p`,
      `-c:a aac -b:a 128k`,
      `-shortest ${outFile}`
    ].join(" ");

    // executa: baixar + ffmpeg
    const fullCmd = `${cmds.join(" && ")} && ${ffmpegCmd}`;

    exec(fullCmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: "Erro ao rodar FFmpeg",
          detail: error.message,
          stderr
        });
      }
      // stream do arquivo final
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="${path.basename(outFile)}"`);
      fs.createReadStream(outFile).pipe(res);
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Worker rodando na porta ${PORT}`));
