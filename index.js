// Game variables
let score = 0;
let target = 25;
let basketPosition = 50; // percentage
let gameRunning = false;
let gameInterval = null;
let itemInterval = null;
let basket = null;
let gameArea = null;
let keysPressed = {}; // Track which keys are currently pressed
let animationFrameId = null;

// Birthday items to catch
const items = [
  '🎂', '🎈', '🎁', '💝', '⭐', '💖', '🌸', '🦄', '🎀', '💕', '💘', '💗', '💓', '💞',
  '💐', '🌸',  '🌹', '🌺', , '🌷',
  '🍓', '🍒', '🍑',
  '🍭', '🍬', '🍫',
   '🍧', '🍦'
];
// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const gameScreen = document.getElementById('gameScreen');
  const celebrationScreen = document.getElementById('celebrationScreen');
  
  basket = document.getElementById('basket');
  gameArea = document.getElementById('gameArea');

  // Start game
  startBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    startGame();
  });

  // Play again
  playAgainBtn.addEventListener('click', () => {
    celebrationScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    resetGame();
    startGame();
  });

  // Keyboard controls - smooth continuous movement
  document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keysPressed.left = true;
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keysPressed.right = true;
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keysPressed.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keysPressed.right = false;
    }
  });

  // Handle window blur to reset keys (prevents stuck keys)
  window.addEventListener('blur', () => {
    keysPressed = {};
  });

  // Mouse/touch controls
  gameArea.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const clickX = (e.clientX / window.innerWidth) * 100;
    basketPosition = Math.max(5, Math.min(95, clickX));
    updateBasketPosition();
  });

  // Touch controls for mobile
  let touchStartX = 0;
  gameArea.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    touchStartX = e.touches[0].clientX;
  });

  gameArea.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;
    e.preventDefault();
    const touchX = (e.touches[0].clientX / window.innerWidth) * 100;
    basketPosition = Math.max(5, Math.min(95, touchX));
    updateBasketPosition();
  });
});

function startGame() {
  gameRunning = true;
  score = 0;
  updateScore();
  
  // Create falling items more frequently
  itemInterval = setInterval(() => {
    if (!gameRunning) return;
    // Create 1-3 items at once for more excitement
    const itemCount = Math.random() < 0.3 ? 2 : (Math.random() < 0.1 ? 3 : 1);
    for (let i = 0; i < itemCount; i++) {
      // Stagger items slightly so they don't all appear at once
      setTimeout(() => {
        if (gameRunning) {
          createFallingItem();
        }
      }, i * 100);
    }
  }, 600); // Reduced from 1000ms to 600ms for more items

  // Check for collisions
  gameInterval = setInterval(() => {
    if (!gameRunning) return;
    checkCollisions();
  }, 50);

  // Start smooth movement animation loop
  startMovementLoop();
}

function startMovementLoop() {
  function animate() {
    if (!gameRunning) return;
    
    // Smooth continuous movement
    if (keysPressed.left) {
      moveBasket(-2); // Smaller increment for smoother movement
    }
    if (keysPressed.right) {
      moveBasket(2);
    }
    
    animationFrameId = requestAnimationFrame(animate);
  }
  animate();
}

function resetGame() {
  gameRunning = false;
  score = 0;
  basketPosition = 50;
  keysPressed = {}; // Reset keys
  updateBasketPosition();
  updateScore();
  
  // Clear intervals
  if (gameInterval) clearInterval(gameInterval);
  if (itemInterval) clearInterval(itemInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
  // Remove all falling items
  const fallingItems = document.querySelectorAll('.falling-item');
  fallingItems.forEach(item => item.remove());
}

function moveBasket(delta) {
  basketPosition = Math.max(5, Math.min(95, basketPosition + delta));
  updateBasketPosition();
}

function updateBasketPosition() {
  basket.style.left = basketPosition + '%';
}

function createFallingItem() {
  const item = document.createElement('div');
  item.className = 'falling-item';
  item.textContent = items[Math.floor(Math.random() * items.length)];
  
  const startX = Math.random() * 90 + 5; // 5% to 95%
  item.style.left = startX + '%';
  item.style.animationDuration = (Math.random() * 2 + 2) + 's'; // 2-4 seconds
  
  // Store position for collision detection
  item.dataset.startX = startX;
  item.dataset.startTime = Date.now();
  
  gameArea.appendChild(item);
  
  // Remove item after animation
  setTimeout(() => {
    if (item.parentNode) {
      item.remove();
    }
  }, 5000);
}

function checkCollisions() {
  const fallingItems = document.querySelectorAll('.falling-item');
  const basketRect = basket.getBoundingClientRect();
  
  fallingItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    
    // Check if item is near the bottom (where basket is)
    if (itemRect.top + itemRect.height > basketRect.top && 
        itemRect.top < basketRect.bottom &&
        itemRect.left + itemRect.width > basketRect.left &&
        itemRect.left < basketRect.right) {
      
      // Collision detected!
      catchItem(item);
    }
  });
}

function catchItem(item) {
  // Add catch effect
  item.style.animation = 'none';
  item.style.transform = 'scale(1.5)';
  item.style.opacity = '0';
  
  // Play catch sound effect (visual feedback)
  createCatchEffect(item);
  
  // Update score
  score++;
  updateScore();
  
  // Remove item
  setTimeout(() => {
    if (item.parentNode) {
      item.remove();
    }
  }, 200);
  
  // Check win condition
  if (score >= target) {
    winGame();
  }
}

function createCatchEffect(item) {
  const effect = document.createElement('div');
  effect.textContent = '+1 ✨';
  effect.style.position = 'absolute';
  effect.style.left = '50%',
  effect.style.top = '50%',
  effect.style.transform= 'translate(-50%, -50%)',
  effect.style.color = '#ff1493';
  effect.style.fontSize = '2em';
  effect.style.fontWeight = 'bold';
  effect.style.pointerEvents = 'none';
  effect.style.zIndex = '100';
  effect.style.animation = 'fadeUp 1s ease-out forwards';
  
  gameArea.appendChild(effect);
  
  setTimeout(() => {
    if (effect.parentNode) {
      effect.remove();
    }
  }, 1000);
}

function updateScore() {
  document.getElementById('score').textContent = score;
}

function winGame() {
  gameRunning = false;
  keysPressed = {}; // Reset keys
  clearInterval(gameInterval);
  clearInterval(itemInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
  // Remove all falling items
  const fallingItems = document.querySelectorAll('.falling-item');
  fallingItems.forEach(item => item.remove());
  
  // Show celebration screen
  setTimeout(() => {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('celebrationScreen').style.display = 'flex';
    createConfetti();
  }, 500);
}

function createConfetti() {
  const confettiContainer = document.getElementById('confettiContainer');
  confettiContainer.innerHTML = '';
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confettiContainer.appendChild(confetti);
  }
}

// Add fadeUp animation for catch effect
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeUp {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(1.5);
    }
  }
`;
document.head.appendChild(style);

