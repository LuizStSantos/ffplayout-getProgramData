const axios = require('axios');
const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

// Carregar o arquivo de configuração YAML
const configFile = fs.readFileSync('./config.yml', 'utf8');
const config = yaml.parse(configFile);

// Definir as variáveis a partir do arquivo YAML
const { username, password, loginUrl, programUrl, currentTime, outputFile, rename, ignore, sinopses } = config;

// Verificar se o diretório existe, se não, criar
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Função para renomear os programas com base no mapeamento
function renameProgram(name) {
  return rename[name] || name; // Retorna o nome renomeado ou o original se não houver mapeamento
}

// Função para verificar se um programa deve ser ignorado
function shouldIgnoreProgram(name) {
  return ignore.includes(name); // Retorna true se o programa estiver na lista de ignorados
}

// Função para obter a sinopse de um programa
function getSinopse(name) {
  return sinopses[name] || null; // Retorna a sinopse ou null se não houver
}

// Função para gerar a data de hoje no formato YYYY-MM-DD
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês começa de 0
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para extrair o nome da pasta a partir do caminho
function extractFolderName(source) {
  const regex = /\/media\/([^\/]+)\//;
  const match = source.match(regex);
  return match ? match[1] : null; // Retorna o nome da pasta ou null se não encontrar
}

// Função para converter segundos em formato "HH:MM:SS"
function convertToTimeFormat(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Função para adicionar segundos a uma hora inicial
function addSecondsToTime(initialTime, secondsToAdd) {
  const [hours, minutes, seconds] = initialTime.split(':').map(Number);
  let totalSeconds = hours * 3600 + minutes * 60 + seconds + secondsToAdd;

  // Calcular a hora, minuto e segundo, respeitando as 24 horas
  totalSeconds %= 86400; // Garantir que o total de segundos não ultrapasse 24h (86400 segundos)

  const finalHours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const finalMinutes = Math.floor(totalSeconds / 60);
  const finalSeconds = totalSeconds % 60;

  return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}`;
}

async function getProgramData() {
  try {
    // Gerar a data de hoje no formato YYYY-MM-DD
    const todayDate = getTodayDate();
    const fullProgramUrl = `${programUrl}?date=${todayDate}`;

    // Realizar login
    const loginResponse = await axios.post(loginUrl, {
      username,
      password,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.data.message === 'login correct!') {
      const token = loginResponse.data.user.token;

      // Usar o token para buscar os dados da playlist
      const programResponse = await axios.get(fullProgramUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filtrar e extrair apenas o nome da pasta (ou title para streams .m3u8) e o tempo
      const filteredPrograms = programResponse.data.program
        .map(program => {
          let name;
          if (program.source && program.source.endsWith('.m3u8')) {
            name = program.title; // Usa o title se for stream .m3u8
          } else {
            name = extractFolderName(program.source); // Extrair o nome da pasta
          }
          const tempo = program.out - program.in; // Calcular o tempo em segundos
          return { name, tempo };
        });

      // Hora inicial
      let currentTime = config.currentTime; // Hora inicial em formato HH:MM:SS

      // Combinar programas consecutivos com o mesmo nome
      const combinedPrograms = [];
      for (let i = 0; i < filteredPrograms.length; ) {
        const currentProgram = filteredPrograms[i];
        let combinedTempo = currentProgram.tempo;
        const start = currentTime;

        // Combine enquanto o próximo item tiver o mesmo nome
        while (i + 1 < filteredPrograms.length && currentProgram.name === filteredPrograms[i + 1].name) {
          combinedTempo += filteredPrograms[i + 1].tempo;
          i++;
        }

        // Atualiza o tempo, mesmo que seja um programa ignorado
        currentTime = addSecondsToTime(currentTime, combinedTempo);

        // Adiciona ao array apenas se NÃO estiver na lista de ignorados
        if (!shouldIgnoreProgram(currentProgram.name)) {
          combinedPrograms.push({
            name: renameProgram(currentProgram.name), // Renomeia o programa, se necessário
            tempo: convertToTimeFormat(combinedTempo), // Converter o tempo para "HH:MM:SS"
            start: start, // Hora de início
            sinopse: getSinopse(currentProgram.name) // Adiciona a sinopse, se disponível
          });
        }

        i++;
      }

      // Salvar os dados no arquivo JSON
      if (combinedPrograms.length > 0) {
        fs.writeFileSync(outputFile, JSON.stringify(combinedPrograms, null, 2));
        console.log(`Dados do programa salvos com sucesso em ${outputFile}!`);
      } else {
        console.log('Nenhum programa válido encontrado para salvar.');
      }
    } else {
      console.log('Falha no login');
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

getProgramData();