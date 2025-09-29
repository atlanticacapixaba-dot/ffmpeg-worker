# Usar Node.js como base
FROM node:18

# Instalar ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar restante do código
COPY . .

# Expor porta (caso seu app precise de webserver, senão pode remover)
EXPOSE 3000

# Comando padrão para iniciar
CMD ["npm", "start"]
