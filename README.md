# 📋 ffplayout-getProgramData
This Node.js script collects data from an ffplayout playlist programming API, processes the information and generates a JSON file with programs, times and synopses. It can be configured to run automatically using Linux cron.

## 🛠 Installation
Prerequisites
Node.js (v16 or higher)

npm (Node.js package manager)

Steps
Clone the repository:

```
git clone https://github.com/LuizStSantos/ffplayout-getProgramData.git
cd ffplayout-getProgramData
```
Install dependencies:
```
npm install
```
Create the config.yml file in the project root with the necessary settings. See the example below.

## ⚙️ Config.yml configuration
The config.yml file is used to configure the script. Here is a complete example:

```
# API access credentials
username: user  # Username for API authentication
password: password  # Password for API authentication

# API URLs
loginUrl: http://ffplayout:8787/auth/login/  # URL to log in to the API
programUrl: http://ffplayout:8787/api/playlist/1  # URL to search for the program playlist

# Time and file settings
currentTime: 08:00:00  # Start time for calculating program times
outputFile: /home/user/Documents/program.json  # Path where the JSON file will be saved

# Renaming programs
rename:
  Breaks: Intervalo comercial  #  Renames the program "Breaks" to "Commercial Break"
  vivo-SucessoNoCampo: Sucesso No Campo | AO VIVO  # Renames the program "vivo-SucessoNoCampo" to "Sucesso No Campo | LIVE"

# Programs to ignore
ignore:
  - Vinhetas  # Ignore the "Vinhetas" program (it will not be included in the JSON, but the time will be added)

# Program synopsis
synopsis:
  Sucesso No Campo: "Gerando 42 horas de conteúdo mensal entre Programas AO VIVO e gravado. Temos ainda boletins diários, cotações, mercado, clima, tecnologia, análise de especialistas, reportagens especiais, coberturas de dias de campo, lançamentos de produtos, feiras e eventos; tudo para contribuir com as tomadas de decisões do nosso telespectador (o produtor rural)."
  vivo-SucessoNoCampo: "Programa ao vivo com as últimas notícias e análises do agronegócio."
```
Explanation of Fields
username e password: Credentials for API authentication.

loginUrl: URL to log in and obtain the access token.

programUrl: URL to search for the program playlist.

currentTime: Start time for calculating program times.

outputFile: Path where the JSON file will be saved.

rename: Mapping program names to new names.

ignore: List of programs that should be ignored (they will not appear in the JSON, but their times will be added together).

synopsis: Descriptions (synopsis) for specific programs.

🚀 How to Run
Manual Execution
To run the script manually, use the following command:

```
node getProgramData.js
```
Autorun with Cron (Linux)
To run the script automatically every day at 8am, follow the steps below:

Open crontab for editing:

```
crontab -e
```
Add the following line to the crontab file:

```
0 8 * * * /usr/bin/node /path/to/your/project/getProgramData.js
```
Explanation:

0 8 * * *: Runs the script every day at 8am.

/usr/bin/node: Path to Node.js (use which node to find the correct path).

/path/to/your/project/getProgramData.js: Full path to the script.

Save and close the file. Cron will now automatically run the script every day at 8am.


## 📂 Project Structure

```
ffplayout-getProgramData/
├── config.yml              # Configuration file
├── getProgramData.js       # Main script
├── package.json            # Dependency package
└── README.md               # This file
```
## 📄 Example Output (JSON)
The script generates a JSON file with programs, schedules and synopses. Example:
```
[
  {
    "name": "Sucesso No Campo",
    "duration": "00:29:55.026566999999886",
    "start": "08:00:33.76706700000068",
    "synopsis": "Gerando 42 horas de conteúdo mensal entre Programas AO VIVO e gravado. Temos ainda boletins diários, cotações, mercado, clima, tecnologia, análise de especialistas, reportagens especiais, coberturas de dias de campo, lançamentos de produtos, feiras e eventos; tudo para contribuir com as tomadas de decisões do nosso telespectador (o produtor rural)."
  },
  {
    "name": "Intervalo comercial",
    "duration": "00:02:46.733238",
    "start": "08:30:28.793634000001475",
    "synopsis": null
  },
  {
    "name": "Conexao Rural Brasil",
    "duration": "00:54:55.75913300000002",
    "start": "08:33:42.98764300000039",
    "synopsis": null
  }
]
```
## 📝 License
This project is licensed under the [MIT License](https://opensource.org/license/mit). See the LICENSE file for more details.

## 🤝 Contribution
Contributions are welcome! Follow the steps below:

Fork the project.

Create a branch for your feature (git checkout -b feature/nova-feature).

Commit your changes (git commit -m 'Adding new feature').

Push to the branch (git push origin feature/nova-feature).

Open a Pull Request.
