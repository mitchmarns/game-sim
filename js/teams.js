// Load player data from players.json (assuming the file is available)
fetch('../data/players.json')
.then(response => response.json())
  .then(data => {
    const players = data.players; // Array of players
    let teamAssignments = loadTeamAssignments();

    function createTeamBoxes() {
      const teamsContainer = document.getElementById('teams');
      teamsContainer.innerHTML = '';
    
      Object.keys(teamAssignments).forEach((team) => {
        const teamBox = document.createElement('div');
        teamBox.classList.add('team-box');
        teamBox.id = team; // Ensure this matches the key in `teamAssignments`
        teamBox.setAttribute('ondrop', 'drop(event)');
        teamBox.setAttribute('ondragover', 'allowDrop(event)');
    
        const teamHeader = document.createElement('h3');
        teamHeader.contentEditable = true;
        teamHeader.innerText = team;
        teamHeader.addEventListener('blur', () => renameTeam(team, teamHeader.innerText));
        teamBox.appendChild(teamHeader);
    
        (teamAssignments[team] || []).forEach((playerName) => {
          const player = players.find((p) => p.name === playerName);
          if (player) {
            const playerElement = createPlayerElement(player, team);
            teamBox.appendChild(playerElement);
          }
        });
    
        teamsContainer.appendChild(teamBox);
      });
    }

    function createUnassignedPlayers() {
      const unassignedBox = document.getElementById('unassigned-box');
      unassignedBox.innerHTML = '<h3>Unassigned Players</h3>';
      players.forEach((player) => {
        if (!isPlayerAssigned(player.name)) {
          const playerElement = createPlayerElement(player, 'unassigned');
          unassignedBox.appendChild(playerElement);
        }
      });
    }
    function createPlayerElement(player, team) {
        const playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.draggable = true;
        playerElement.setAttribute('ondragstart', 'drag(event)');
        playerElement.dataset.playerId = player.id; // Use player ID for unique identification
      
        // Player image
        const playerImage = document.createElement('img');
        playerImage.src = player.image;
        playerImage.alt = `${player.name}`;
        playerImage.classList.add('player-image');
      
        // Player name and position
        const playerDetails = document.createElement('div');
        playerDetails.classList.add('player-details');
        playerDetails.innerHTML = `
          <p class="player-name">${player.name}</p>
          <p class="player-position">${player.position}</p>
        `;
      
        // Add remove button only if assigned to a team
        if (team !== 'unassigned') {
          const removeBtn = document.createElement('button');
          removeBtn.classList.add('remove-btn');
          removeBtn.innerText = 'X';
          removeBtn.addEventListener('click', () => removePlayer(player.name, team));
          playerDetails.appendChild(removeBtn);
        }
      
        // Append elements
        playerElement.appendChild(playerImage);
        playerElement.appendChild(playerDetails);
      
        return playerElement;
      }

    function removePlayer(playerName, team) {
      if (team === 'unassigned') {
        // Do nothing, as it's already unassigned
        return;
      }

      // Remove player from the current team
      teamAssignments[team] = teamAssignments[team].filter(name => name !== playerName);
      saveTeamAssignments();
      createTeamBoxes();
      createUnassignedPlayers();
    }

    function isPlayerAssigned(playerName) {
      return Object.values(teamAssignments).some(team => team.includes(playerName));
    }

    function loadTeamAssignments() {
      const savedData = localStorage.getItem('teamAssignments');
      return savedData ? JSON.parse(savedData) : {}; // Start with no teams
    }

    function saveTeamAssignments() {
      localStorage.setItem('teamAssignments', JSON.stringify(teamAssignments));
    }

    window.allowDrop = function(event) {
      event.preventDefault();
    };

    window.drag = function (event) {
      const playerId = event.target.dataset.playerId;
      if (playerId) {
        event.dataTransfer.setData('playerId', playerId);
      } else {
        console.error('Player ID not found for drag event.');
      }
    };
    

    window.drop = function (event) {
      event.preventDefault();
      
      // Ensure the drop target is a valid team box
      const dropTarget = event.target.closest('.team-box');
      if (!dropTarget) {
        console.error('Drop target is not a valid team box.');
        return;
      }
      
      const playerId = event.dataTransfer.getData('playerId');
      const team = dropTarget.id;
    
      if (!teamAssignments[team]) {
        teamAssignments[team] = [];
      }
    
      const player = players.find((p) => p.id === parseInt(playerId));
      if (player && !teamAssignments[team].includes(player.name)) {
        teamAssignments[team].push(player.name);
        player.assigned = true;
        player.team = team;
    
        saveTeamAssignments();
        createTeamBoxes();
        createUnassignedPlayers();
      }
    };

    function addTeam() {
      const teamNameInput = document.getElementById('team-name-input');
      const teamName = teamNameInput.value.trim();

      if (teamName && !teamAssignments[teamName]) {
        teamAssignments[teamName] = [];
        saveTeamAssignments();
        createTeamBoxes();
        teamNameInput.value = '';
      } else if (!teamName) {
        alert('Please enter a valid team name.');
      } else {
        alert('Team already exists.');
      }
    }

    function renameTeam(oldName, newName) {
      if (newName.trim() && newName !== oldName && !teamAssignments[newName]) {
        teamAssignments[newName] = teamAssignments[oldName];
        delete teamAssignments[oldName];
        saveTeamAssignments();
        createTeamBoxes();
      } else if (newName !== oldName) {
        alert('Invalid team name or name already exists.');
      }
    }

    function resetTeams() {
      if (confirm('Are you sure you want to reset all teams?')) {
        teamAssignments = {};
        saveTeamAssignments();
        createTeamBoxes();
        createUnassignedPlayers();
      }
    }

    // Event listeners
    document.getElementById('add-team-btn').addEventListener('click', addTeam);
    document.getElementById('reset-teams-btn').addEventListener('click', resetTeams);

    createTeamBoxes();
    createUnassignedPlayers();
  })
  .catch(error => {
    console.error('Error loading players data:', error);
  });
