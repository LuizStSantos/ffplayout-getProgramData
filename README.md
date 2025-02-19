# 📋 ffplayout-getProgramData
Este script Node.js coleta dados de uma API de programação de playlists, processa as informações e gera um arquivo JSON com os programas, horários e sinopses. Ele pode ser configurado para rodar automaticamente usando o cron do Linux.

## 🛠 Instalação
Pré-requisitos
Node.js (v16 ou superior)

npm (gerenciador de pacotes do Node.js)

Passos
Clone o repositório:

```
git clone https://github.com/LuizStSantos/ffplayout-getProgramData.git
cd ffplayout-getProgramData
```
Instale as dependências:

```
npm install
```
Crie o arquivo config.yml na raiz do projeto com as configurações necessárias. Veja o exemplo abaixo.

## ⚙️ Configuração do config.yml
O arquivo config.yml é usado para configurar o script. Aqui está um exemplo completo:

```
# Credenciais de acesso à API
username: user  # Nome de usuário para autenticação na API
password: password  # Senha para autenticação na API

# URLs da API
loginUrl: http://ffplayout:8787/auth/login/  # URL para fazer login na API
programUrl: http://ffplayout:8787/api/playlist/1  # URL para buscar a playlist de programas

# Configurações de tempo e arquivo
currentTime: 08:00:00  # Hora inicial para o cálculo dos horários dos programas
outputFile: /home/user/Documents/program.json  # Caminho onde o arquivo JSON será salvo

# Renomeação de programas
rename:
  Breaks: Intervalo comercial  # Renomeia o programa "Breaks" para "Intervalo comercial"
  vivo-SucessoNoCampo: Sucesso No Campo | AO VIVO  # Renomeia o programa "vivo-SucessoNoCampo" para "Sucesso No Campo | AO VIVO"

# Programas a serem ignorados
ignore:
  - Vinhetas  # Ignora o programa "Vinhetas" (não será incluído no JSON, mas o tempo será somado)

# Sinopses dos programas
sinopses:
  Sucesso No Campo: "Gerando 42 horas de conteúdo mensal entre Programas AO VIVO e gravado. Temos ainda boletins diários, cotações, mercado, clima, tecnologia, análise de especialistas, reportagens especiais, coberturas de dias de campo, lançamentos de produtos, feiras e eventos; tudo para contribuir com as tomadas de decisões do nosso telespectador (o produtor rural)."
  vivo-SucessoNoCampo: "Programa ao vivo com as últimas notícias e análises do agronegócio."
```
Explicação dos Campos
username e password: Credenciais para autenticação na API.

loginUrl: URL para fazer login e obter o token de acesso.

programUrl: URL para buscar a playlist de programas.

currentTime: Hora inicial para o cálculo dos horários dos programas.

outputFile: Caminho onde o arquivo JSON será salvo.

rename: Mapeamento de nomes de programas para novos nomes.

ignore: Lista de programas que devem ser ignorados (não aparecerão no JSON, mas seus tempos serão somados).

sinopses: Descrições (sinopses) para programas específicos.

🚀 Como Executar
Execução Manual
Para rodar o script manualmente, use o seguinte comando:

```
node getProgramData.js
```
Execução Automática com Cron (Linux)
Para rodar o script automaticamente todos os dias às 8h, siga os passos abaixo:

Abra o crontab para edição:

```
crontab -e
```
Adicione a seguinte linha ao arquivo crontab:

```
0 8 * * * /usr/bin/node /caminho/para/seu/projeto/getProgramData.js
```
Explicação:

0 8 * * *: Executa o script todos os dias às 8h.

/usr/bin/node: Caminho para o Node.js (use which node para encontrar o caminho correto).

/caminho/para/seu/projeto/getProgramData.js: Caminho completo para o script.

Salve e feche o arquivo. O cron agora executará o script automaticamente todos os dias às 8h.

## 📂 Estrutura do Projeto
```
ffplayout-getProgramData/
├── config.yml              # Arquivo de configuração
├── getProgramData.js       # Script principal
└── README.md               # Este arquivo
```
## 📄 Exemplo de Saída (JSON)
O script gera um arquivo JSON com os programas, horários e sinopses. Exemplo:

```
[
  {
    "name": "Intervalo comercial",
    "tempo": "00:05:00",
    "start": "08:00:00",
    "sinopse": null
  },
  {
    "name": "Sucesso No Campo | AO VIVO",
    "tempo": "01:00:00",
    "start": "08:05:00",
    "sinopse": "Programa ao vivo com as últimas notícias e análises do agronegócio."
  }
]
```
## 📝 Licença
Este projeto é licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição
Contribuições são bem-vindas! Siga os passos abaixo:

Faça um fork do projeto.

Crie uma branch para sua feature (git checkout -b feature/nova-feature).

Commit suas mudanças (git commit -m 'Adicionando nova feature').

Faça push para a branch (git push origin feature/nova-feature).

Abra um Pull Request.
