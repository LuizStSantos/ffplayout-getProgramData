const axios = require('axios');
const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

// Load the YAML configuration file
const configFile = fs.readFileSync('./config.yml', 'utf8');
const config = yaml.parse(configFile);

// Define variables from the YAML file
const { username, password, loginUrl, programUrl, currentTime, outputFile, rename, ignore, synopsis } = config;

// Check if the directory exists, if not, create it
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to rename programs based on the mapping
function renameProgram(name) {
  return rename[name] || name; // Returns the renamed name or the original if no mapping exists
}

// Function to check if a program should be ignored
function shouldIgnoreProgram(name) {
  return ignore.includes(name); // Returns true if the program is in the ignore list
}

// Function to get the synopsis of a program
function getSynopsis(name) {
  return synopsis[name] || null;
}

// Function to generate today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month starts from 0
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to extract the folder name from the path
function extractFolderName(source) {
  const regex = /\/media\/([^\/]+)\//;
  const match = source.match(regex);
  return match ? match[1] : null; // Returns the folder name or null if not found
}

// Function to convert seconds to "HH:MM:SS" format
function convertToTimeFormat(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Function to add seconds to an initial time
function addSecondsToTime(initialTime, secondsToAdd) {
  const [hours, minutes, seconds] = initialTime.split(':').map(Number);
  let totalSeconds = hours * 3600 + minutes * 60 + seconds + secondsToAdd;

  // Calculate hours, minutes, and seconds, respecting 24-hour format
  totalSeconds %= 86400; // Ensure total seconds do not exceed 24 hours (86400 seconds)

  const finalHours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const finalMinutes = Math.floor(totalSeconds / 60);
  const finalSeconds = totalSeconds % 60;

  return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}:${String(finalSeconds).padStart(2, '0')}`;
}

async function getProgramData() {
  try {
    // Generate today's date in YYYY-MM-DD format
    const todayDate = getTodayDate();
    const fullProgramUrl = `${programUrl}?date=${todayDate}`;

    // Perform login
    const loginResponse = await axios.post(loginUrl, {
      username,
      password,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.data.message === 'login correct!') {
      const token = loginResponse.data.user.token;

      // Use the token to fetch the playlist data
      const programResponse = await axios.get(fullProgramUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter and extract only the folder name (or title for .m3u8 streams) and the duration
      const filteredPrograms = programResponse.data.program
        .map(program => {
          let name;
          if (program.source && program.source.endsWith('.m3u8')) {
            name = program.title; // Use the title if it's a .m3u8 stream
          } else {
            name = extractFolderName(program.source); // Extract the folder name
          }
          const duration = program.out - program.in; // Calculate the duration in seconds
          return { name, duration };
        });

      // Initial time
      let currentTime = config.currentTime; // Initial time in HH:MM:SS format

      // Combine consecutive programs with the same name
      const combinedPrograms = [];
      for (let i = 0; i < filteredPrograms.length; ) {
        const currentProgram = filteredPrograms[i];
        let combinedDuration = currentProgram.duration;
        const start = currentTime;

        // Combine while the next item has the same name
        while (i + 1 < filteredPrograms.length && currentProgram.name === filteredPrograms[i + 1].name) {
          combinedDuration += filteredPrograms[i + 1].duration;
          i++;
        }

        // Update the time, even if it's an ignored program
        currentTime = addSecondsToTime(currentTime, combinedDuration);

        // Add to the array only if it is NOT in the ignore list
        if (!shouldIgnoreProgram(currentProgram.name)) {
          combinedPrograms.push({
            name: renameProgram(currentProgram.name), // Rename the program if necessary
            duration: convertToTimeFormat(combinedDuration), // Convert the duration to "HH:MM:SS"
            start: start, // Start time
            synopsis: getSynopsis(currentProgram.name) // Add the synopsis if available
          });
        }

        i++;
      }

      // Save the data to the JSON file
      if (combinedPrograms.length > 0) {
        fs.writeFileSync(outputFile, JSON.stringify(combinedPrograms, null, 2));
        console.log(`Program data saved successfully to ${outputFile}!`);
      } else {
        console.log('No valid programs found to save.');
      }
    } else {
      console.log('Login failed');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getProgramData();