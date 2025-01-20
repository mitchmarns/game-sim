const playerDataKey = 'playersData';
const starterBackupSkills = {
    glove: 90,
    stickHandling: 89,
    legs: 89,
    reboundControl: 91,
    positioning: 92,
    fiveHole: 91,
    speed: 89,
    reflexes: 90,
    durability: 85,
    vision: 90,
    puckTracking: 89,
    agility: 89,
    hockeyIQ: 86,
    aggression: 68
  };
  
  const otherPositionsSkills = {
    slapShotAccuracy: 88,
    slapShotPower: 91,
    wristShotAccuracy: 85,
    wristShotPower: 87,
    passing: 89,
    puckControl: 88,
    speed: 84,
    acceleration: 83,
    agility: 82,
    balance: 90,
    defense: 89,
    stickChecking: 90,
    bodyChecking: 85,
    endurance: 88,
    hockeyIQ: 90,
    vision: 87,
    creativity: 85,
    faceoff: 50,
    shotBlocking: 88,
    penaltyKilling: 86,
    powerPlaySkill: 91,
    poise: 87,
    aggression: 82
  };
  
document.getElementById('player-position').addEventListener('change', updateSkills);
document.getElementById('add-player-btn').addEventListener('click', addOrEditPlayer);


function updateSkills() {
    const position = document.getElementById('player-position').value;
    const skillsContainer = document.getElementById('skills-container');
  
    // Clear existing skill inputs
    skillsContainer.innerHTML = '';
  
    // Define the skill set to show based on the position
    let skillSet;
    if (position === 'Starter' || position === 'Backup') {
      skillSet = starterBackupSkills;
    } else {
      skillSet = otherPositionsSkills;
    }
  
    // Loop through the selected skill set and create inputs for each skill
    for (const [skill, value] of Object.entries(skillSet)) {
      const div = document.createElement('div');
      div.classList.add('skill-input-container');
      
      const label = document.createElement('label');
      label.setAttribute('for', skill);
      label.innerText = skill;
  
      const input = document.createElement('input');
      input.type = 'number';
      input.name = skill;
      input.classList.add('skill-input');
      input.value = value;
      input.min = 0;
      input.max = 100;
      
      div.appendChild(label);
      div.appendChild(input);
      skillsContainer.appendChild(div);
    }
  }

  window.onload = function() {
    updateSkills(); // Call the function to populate the skill set
  };

// Load players from JSON and merge with localStorage
function loadPlayers() {
  return fetch('../data/players.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load players.json');
      return response.json();
    })
    .then(data => {
      const localPlayers = JSON.parse(localStorage.getItem(playerDataKey)) || [];
      const jsonPlayers = data.players;

      // Merge JSON players with local storage players
      const mergedPlayers = [...jsonPlayers];
      localPlayers.forEach(localPlayer => {
        const existingIndex = mergedPlayers.findIndex(player => player.id === localPlayer.id);
        if (existingIndex !== -1) {
          mergedPlayers[existingIndex] = { ...mergedPlayers[existingIndex], ...localPlayer };
        } else {
          mergedPlayers.push(localPlayer);
        }
      });

      savePlayers(mergedPlayers);
      return mergedPlayers;
    })
    .catch(error => {
      console.error('Error loading players:', error);
      return JSON.parse(localStorage.getItem(playerDataKey)) || [];
    });
}

// Save players to localStorage
function savePlayers(players) {
  localStorage.setItem(playerDataKey, JSON.stringify(players));
}

// Render players in the list
function renderPlayerList(players) {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = ''; 
  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player-card');
    playerDiv.innerHTML = `
      <img src="${player.image}" alt="${player.name}" class="player-image" />
      <p><strong>ID:</strong> ${player.id}</p>  <!-- Display the ID here -->
      <p><strong>Name:</strong> ${player.name}</p>
      <p><strong>Position:</strong> ${player.position}</p>
      <p><strong>Age:</strong> ${player.age}</p>
      <button onclick="editPlayer(${player.id})">Edit</button>
      <button onclick="deletePlayer(${player.id})">Delete</button>
    `;
    playerList.appendChild(playerDiv);
  });
}

// Add or edit a player
function addOrEditPlayer() {
  const id = document.getElementById('player-id').value; // Get player ID
  const name = document.getElementById('player-name').value.trim();
  const position = document.getElementById('player-position').value.trim();
  const age = parseInt(document.getElementById('player-age').value.trim(), 10);
  const image = document.getElementById('player-image').value.trim();

  const skills = {};
  document.querySelectorAll('.skill-input').forEach(input => {
    skills[input.name] = parseInt(input.value.trim()) || 0;
  });

  if (!name || !position || isNaN(age) || !image) {
    alert('Please fill out all fields correctly.');
    return;
  }

  loadPlayers().then(players => {
    if (!id) {
      // Add new player with unique ID if no ID is provided (new player)
      const existingPlayer = players.find(p => p.name === name);
      if (existingPlayer) {
        alert('Error: A player with this name already exists. Please pick a unique name.');
        return; 
      }

      const newPlayer = {
        id: players.length > 0 ? players[players.length - 1].id + 1 : 1, 
        name,
        position,
        age,
        assigned: false,
        lineAssigned: null,
        lineAssignments: null,
        specialTeamAssigned: null,
        team: null,
        injured: false,
        healthyScratch: false,
        image,
        skills,
      };
      players.push(newPlayer);
    } else {
      // Edit existing player
      const playerIndex = players.findIndex(p => p.id === parseInt(id, 10)); 
      if (playerIndex !== -1) {
        players[playerIndex] = { ...players[playerIndex], name, position, age, image, skills };
      }
    }

    savePlayers(players);
    renderPlayerList(players);
    document.getElementById('player-form').reset(); 
  });
}
  
  // Populate form with existing player data, including skills
  function editPlayer(id) {
    loadPlayers().then(players => {
      const player = players.find(p => p.id === id);
      if (player) {
        // Populate form fields
        document.getElementById('player-id').value = player.id;
        document.getElementById('player-name').value = player.name;
        document.getElementById('player-position').value = player.position;
        document.getElementById('player-age').value = player.age;
        document.getElementById('player-image').value = player.image;
  
        // Update the skill set based on the position
        updateSkills(); // Trigger skill update based on selected position
  
        // Populate the skill inputs with existing data
        Object.entries(player.skills).forEach(([key, value]) => {
          const skillInput = document.querySelector(`.skill-input[name="${key}"]`);
          if (skillInput) skillInput.value = value;
        });
      }
    });
  }
  
  // Render skill inputs dynamically
  function renderSkillInputs(skills) {
    const skillContainer = document.getElementById('skills-container');
    skillContainer.innerHTML = '';
    Object.keys(skills).forEach(skill => {
      const skillDiv = document.createElement('div');
      skillDiv.classList.add('skill-field');
      skillDiv.innerHTML = `
        <label for="${skill}">${skill}:</label>
        <input type="number" id="${skill}" name="${skill}" class="skill-input" value="${skills[skill]}" />
      `;
      skillContainer.appendChild(skillDiv);
    });
  }
  
  // Initial skill rendering with default keys
  function initializeSkills() {
    const defaultSkills = {
      glove: 0,
      stickHandling: 0,
      legs: 0,
      reboundControl: 0,
      positioning: 0,
      fiveHole: 0,
      speed: 0,
      reflexes: 0,
      durability: 0,
      vision: 0,
      puckTracking: 0,
      agility: 0,
      hockeyIQ: 0,
      aggression: 0,
    };
    renderSkillInputs(defaultSkills);
  }
  
  // Initialize page
  initializeSkills();
  loadPlayers().then(renderPlayerList);
