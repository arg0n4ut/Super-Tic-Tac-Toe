// Rules implemented:
// - Board: 9 sub-fields (indices 0–8); each sub-field: 9 spots (indices 0–8)
// - Active field: determined by previous move's spot index;
//   if target sub-field is full or won, move allowed in any available sub-field.
// - Win conditions: three in a row (row, column, diagonal) in a sub-field or overall board.
// - When a sub-field is won, it gets colored (blue for X, red for O) and no further moves allowed.

document.addEventListener('DOMContentLoaded', () => {
    let currentPlayer = 'X'; // Player X starts.
    let gameOver = false;
    // 9 sub-fields: each sub-field is an array of 9 spots (null, "X", or "O").
    const board = Array(9).fill(null).map(() => Array(9).fill(null));
    // Track sub-field winners: null, "X", "O", or "D" for draw.
    const fieldWinners = Array(9).fill(null);
    // Active field; null means any sub-field.
    let activeField = null;
  
    const superCells = document.querySelectorAll('.super-cell');
    const cells = document.querySelectorAll('.cell');

    // Add CSS style for the springy animation
    const style = document.createElement('style');
    style.textContent = `
        .springy {
            animation: spring 0.3s ease-in-out;
        }
        @keyframes spring {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        .fade {
            animation: fade 0.3s ease-in-out;
        }
        @keyframes fade {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Add a current player indicator
    const playerIndicator = document.createElement('div');
    playerIndicator.id = 'player-indicator';
    playerIndicator.textContent = `${currentPlayer} ist dran`;

    // Style the player indicator to be vertically centered below the page title
    playerIndicator.style.textAlign = 'center';
    playerIndicator.style.marginTop = '20px';
    playerIndicator.style.fontSize = '1.5em';
    playerIndicator.style.fontWeight = 'bold';

    const pageTitle = document.querySelector('h1'); // Assuming the page title is an <h1> element
    if (pageTitle) {
        pageTitle.insertAdjacentElement('afterend', playerIndicator);
    }
    playerIndicator.id = 'player-indicator';
    playerIndicator.textContent = `${currentPlayer} ist dran`;
  
    // Attach click listeners on every cell.
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (gameOver) return;
  
        const superCell = cell.parentElement;
        const fieldIndex = parseInt(superCell.getAttribute('data-field'));
        const spotIndex = parseInt(cell.getAttribute('data-spot'));
  
        // First check if cell is already marked
        if (board[fieldIndex][spotIndex] !== null) return;

        // Enforce active field: only allow moves in active field unless it is full
        if (activeField !== null && fieldIndex !== activeField) {
            const isFieldFull = !board[activeField].includes(null);
            if (!isFieldFull) return;
        }
  
        // Place mark.
        board[fieldIndex][spotIndex] = currentPlayer;
        if (currentPlayer === 'X') {
          cell.appendChild(document.getElementById('icon-x').cloneNode(true));
        } else {
          cell.appendChild(document.getElementById('icon-o').cloneNode(true));

        }
        cell.style.pointerEvents = 'none';

        // Add springy animation to the cell
        cell.classList.add('springy');
        setTimeout(() => cell.classList.remove('springy'), 300);
  
        // Check win in current sub-field.
        if (!fieldWinners[fieldIndex]) {
          const winner = checkWin(board[fieldIndex]);
          if (winner) {
            fieldWinners[fieldIndex] = winner;
            // Color individual cells in the sub-field based on winner.
            if (winner === 'X') {
              superCell.querySelectorAll('.cell').forEach(c => c.style.backgroundColor = '#ffd3c5');
            } else if (winner === 'O') {
              superCell.querySelectorAll('.cell').forEach(c => c.style.backgroundColor = '#d0e6ff');
            }
          } else if (isFull(board[fieldIndex])) {
            fieldWinners[fieldIndex] = 'D';
            superCell.querySelectorAll('.cell').forEach(c => c.style.backgroundColor = '#d3d3d3'); // Optional draw color
          }
        }
  
        // Check overall game win: construct an array from fieldWinners (treat draws as null).
        const overallWinner = checkWin(fieldWinners.map(val => (val === 'D' ? null : val)));
        if (overallWinner) {
          // alert('Spieler ' + overallWinner + ' hat gewonnen!');
          playerIndicator.textContent = `${overallWinner} hat gewonnen!`;
          gameOver = true;
          animate();
          return;
        } else if (fieldWinners.every(val => val !== null)) {
          alert('Unentschieden ...');
          playerIndicator.textContent = 'Unentschieden ...';
          gameOver = true;
          return;
        }
  
        // Determine next active field from current move’s spot index.
        // Only allow if target sub-field has free spots.
        if (board[spotIndex].includes(null)) {
          activeField = spotIndex;
        } else {
          activeField = null; // free choice if target sub-field is full
        }
  
        // Update active field highlight.
        superCells.forEach(sc => sc.classList.remove('active'));
        if (activeField !== null) {
          const nextActive = document.querySelector(`.super-cell[data-field="${activeField}"]`);
          if (nextActive) nextActive.classList.add('active');
        }
  
        // Switch player.
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        // Update the current player indicator
        playerIndicator.classList.add('fade');
        setTimeout(() => {
            playerIndicator.textContent = `${currentPlayer} ist dran`;
            playerIndicator.classList.remove('fade');
        }, 300);
      });
    });
  
    // Check win for an array of 9 elements.
    function checkWin(arr) {
      const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
      ];
      for (let line of lines) {
        const [a, b, c] = line;
        if (arr[a] && arr[a] === arr[b] && arr[a] === arr[c]) {
          return arr[a];
        }
      }
      return null;
    }
  
    // Check if all cells in an array are filled.
    function isFull(arr) {
      return arr.every(cell => cell !== null);
    }

    // Add confetti animation
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const particles = [];
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    function createParticle() {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 7 + 3,
        speedX: (Math.random() - 0.5) * 5,
        speedY: Math.random() * 4 + 2,
        rotation: (Math.random() - 0.5) * 6,
        color: `hsl(${Math.random() * 360}, 90%, 70%)`
      });
    }
    
    function updateParticle(particle) {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
    
      particle.x += Math.sin(particle.y * 0.2) * Math.random() * 0.5;
    
      if (particle.y > canvas.height + 20) {
        particle.y = Math.random() * canvas.height - canvas.height;
        particle.x = Math.random() * canvas.width;
      }
    }
    
    function drawParticle(particle) {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
    
      ctx.fillRect(
        particle.size,
        particle.size / 4,
        particle.size * 2,
        particle.size / 2
      );
    
      ctx.restore();
    }
    
    for (let i = 0; i < 400; i++) {
      createParticle();
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        updateParticle(particle);
        drawParticle(particle);
      });
    
      requestAnimationFrame(animate);
    }

    // Add double-click event listener to the event logo
    const eventLogo = document.querySelector('#event-logo'); // Assuming the logo has an ID of 'event-logo'
    if (eventLogo) {
        eventLogo.addEventListener('dblclick', () => {
            animate();
        });
    }

    // Ensure the confetti animation appears in front of all content
    const confettiContainer = document.getElementById('canvas');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999'; // Ensure it is in front of all content
  });
