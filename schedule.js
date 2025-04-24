
  fetch('./data/schedule.json')
    .then(response => response.json())
    .then(data => {
      const scheduleDiv = document.getElementById('schedule');
      scheduleDiv.innerHTML = data.map(game => `<p>${game.date}: ${game.team}</p>`).join('');
    });
