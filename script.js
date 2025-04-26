document.addEventListener('DOMContentLoaded', () => {
    const dog = document.getElementById('dog');
    const sheep = document.getElementById('sheep');
    const fence = document.getElementById('fence');
    const gameContainer = document.getElementById('game-container');
    const winModal = document.getElementById('win-modal');
    const playAgainBtn = document.getElementById('play-again');
    
    // Game state
    let gameActive = true;
    
    // Set initial positions
    let dogX = window.innerWidth * 0.75; // Start on the right side of the screen
    let dogY = window.innerHeight / 2;
    
    // Start sheep on the right side (outside the fence)
    let sheepX = window.innerWidth * 0.75 + Math.random() * (window.innerWidth * 0.2);
    let sheepY = window.innerHeight * 0.25 + Math.random() * (window.innerHeight * 0.5);
    
    // Fence properties
    let fenceX, fenceY, fenceWidth, fenceHeight;
    
    // Function to update fence dimensions
    function updateFenceDimensions() {
        const fenceRect = fence.getBoundingClientRect();
        fenceX = fenceRect.left;
        fenceY = fenceRect.top;
        fenceWidth = fenceRect.width;
        fenceHeight = fenceRect.height;
    }
    
    // Initialize fence dimensions
    updateFenceDimensions();
    
    // Variables for sheep movement
    let sheepDirectionX = Math.random() * 2 - 1;
    let sheepDirectionY = Math.random() * 2 - 1;
    const sheepSpeed = 2;
    
    // Check if a point collides with the fence
    function checkFenceCollision(x, y, size) {
        // Only check collision if point is within fence boundaries
        if (x + size > fenceX && x < fenceX + fenceWidth && 
            y + size > fenceY && y < fenceY + fenceHeight) {
            
            // Check if point is within the fence but not on the right side (which is open)
            const rightEdge = fenceX + fenceWidth;
            const fenceThickness = 15; // Match the CSS thickness
            
            // Check collision with top border
            if (y < fenceY + fenceThickness && x + size > fenceX + fenceThickness) {
                return true;
            }
            
            // Check collision with left border
            if (x < fenceX + fenceThickness) {
                return true;
            }
            
            // Check collision with bottom border
            if (y + size > fenceY + fenceHeight - fenceThickness && x + size > fenceX + fenceThickness) {
                return true;
            }
        }
        return false; // No collision
    }
    
    // Check if sheep is inside the fence (for win condition)
    function isSheepInFence() {
        const sheepSize = parseInt(getComputedStyle(sheep).width);
        const sheepCenterX = sheepX + sheepSize/2;
        const sheepCenterY = sheepY + sheepSize/2;
        
        // Check if sheep center is inside fence boundaries
        return (sheepCenterX > fenceX && 
                sheepCenterX < fenceX + fenceWidth && 
                sheepCenterY > fenceY && 
                sheepCenterY < fenceY + fenceHeight && 
                !checkFenceCollision(sheepX, sheepY, sheepSize));
    }
    
    // End game and show win modal
    function endGame() {
        gameActive = false;
        winModal.style.display = 'flex';
    }
    
    // Update dog position based on cursor/touch
    function updateDogPosition(clientX, clientY) {
        // Calculate target position
        const targetX = clientX;
        const targetY = clientY;
        
        // Calculate angle for dog rotation
        const angle = Math.atan2(targetY - dogY, targetX - dogX) * 180 / Math.PI + 90;
        
        // Get sheep size for collision detection
        const sheepSize = parseInt(getComputedStyle(sheep).width);
        const dogSize = 40; // Height of the dog triangle
        
        // Calculate distance between dog and sheep
        const distance = getDistance(dogX, dogY, sheepX + sheepSize/2, sheepY + sheepSize/2);
        
        // Minimum distance to maintain between dog and sheep
        const minDistance = sheepSize * 2;
        const pushDistance = sheepSize * 1.5; // Distance at which dog pushes sheep
        
        // Update dog position with smooth movement
        let newDogX = dogX + (targetX - dogX) * 0.1;
        let newDogY = dogY + (targetY - dogY) * 0.1;
        
        // Check if new position would be too close to sheep
        const newDistance = getDistance(newDogX, newDogY, sheepX + sheepSize/2, sheepY + sheepSize/2);
        
        // Check for fence collision
        const dogFenceCollision = checkFenceCollision(newDogX - 20, newDogY - 20, dogSize);
        
        if (newDistance < minDistance) {
            // Only move dog if it's moving away from the sheep
            const currentToSheep = getDistance(dogX, dogY, sheepX + sheepSize/2, sheepY + sheepSize/2);
            const newToSheep = getDistance(newDogX, newDogY, sheepX + sheepSize/2, sheepY + sheepSize/2);
            
            if (newToSheep > currentToSheep && !dogFenceCollision) {
                dogX = newDogX;
                dogY = newDogY;
            }
            
            // Push the sheep if dog is very close
            if (distance < pushDistance) {
                // Calculate push direction (from dog to sheep)
                const pushX = sheepX + sheepSize/2 - dogX;
                const pushY = sheepY + sheepSize/2 - dogY;
                
                // Normalize push vector
                const pushLength = Math.sqrt(pushX * pushX + pushY * pushY);
                const normalizedPushX = pushX / pushLength;
                const normalizedPushY = pushY / pushLength;
                
                // Push strength increases as dog gets closer
                const pushStrength = 5 * (1 - distance / pushDistance);
                
                // Apply push to sheep position
                sheepX += normalizedPushX * pushStrength;
                sheepY += normalizedPushY * pushStrength;
                
                // Update sheep position immediately
                sheep.style.left = `${sheepX}px`;
                sheep.style.top = `${sheepY}px`;
            }
        } else if (!dogFenceCollision) {
            dogX = newDogX;
            dogY = newDogY;
        }
        
        // Apply position and rotation
        dog.style.left = `${dogX - 20}px`; // Adjust for triangle width
        dog.style.top = `${dogY - 20}px`; // Adjust for triangle height
        dog.style.transform = `rotate(${angle}deg)`;
    }
    
    // Calculate distance between dog and sheep
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Update sheep position with random movement and dog repulsion
    function updateSheepPosition() {
        // Skip if game is not active
        if (!gameActive) return;
        
        // Change direction occasionally
        if (Math.random() < 0.02) {
            sheepDirectionX = Math.random() * 2 - 1;
            sheepDirectionY = Math.random() * 2 - 1;
        }
        
        // Get sheep size for collision detection
        const sheepSize = parseInt(getComputedStyle(sheep).width);
        
        // Calculate distance between dog and sheep
        const distance = getDistance(dogX, dogY, sheepX + sheepSize/2, sheepY + sheepSize/2);
        
        // Apply repulsion force if dog gets too close
        const minDistance = sheepSize * 3; // Increased minimum distance for earlier reaction
        
        if (distance < minDistance) {
            // Calculate repulsion direction
            const repulsionX = sheepX + sheepSize/2 - dogX;
            const repulsionY = sheepY + sheepSize/2 - dogY;
            
            // Normalize and apply repulsion force
            const repulsionLength = Math.sqrt(repulsionX * repulsionX + repulsionY * repulsionY);
            const normalizedX = repulsionX / repulsionLength;
            const normalizedY = repulsionY / repulsionLength;
            
            // Stronger repulsion when closer - increased strength from 8 to 12 for more pronounced effect
            const repulsionStrength = 12 * (1 - distance / minDistance);
            
            // Update sheep direction with repulsion
            sheepDirectionX = normalizedX * repulsionStrength;
            sheepDirectionY = normalizedY * repulsionStrength;
            
            // Force immediate movement if too close (less than half the minimum distance)
            if (distance < minDistance / 2) {
                // Apply immediate position adjustment to maintain minimum separation
                sheepX += normalizedX * (minDistance / 2 - distance) * 1.5; // Increased immediate movement factor
                sheepY += normalizedY * (minDistance / 2 - distance) * 1.5;
            }
            
            // Add a "scared" effect - make sheep move faster when dog is close
            const speedMultiplier = 1 + (1 - distance / minDistance) * 1.5;
            sheepDirectionX *= speedMultiplier;
            sheepDirectionY *= speedMultiplier;
        }
        
        // Calculate new position
        let newSheepX = sheepX + sheepDirectionX * sheepSpeed;
        let newSheepY = sheepY + sheepDirectionY * sheepSpeed;
        
        // Check for fence collision
        if (checkFenceCollision(newSheepX, newSheepY, sheepSize)) {
            // Bounce off the fence
            sheepDirectionX *= -1;
            sheepDirectionY *= -1;
            
            // Apply the reversed direction
            newSheepX = sheepX + sheepDirectionX * sheepSpeed;
            newSheepY = sheepY + sheepDirectionY * sheepSpeed;
        }
        
        // Update position
        sheepX = newSheepX;
        sheepY = newSheepY;
        
        // Boundary checking
        if (sheepX < 0) {
            sheepX = 0;
            sheepDirectionX *= -1;
        }
        if (sheepX > window.innerWidth - sheepSize) {
            sheepX = window.innerWidth - sheepSize;
            sheepDirectionX *= -1;
        }
        if (sheepY < 0) {
            sheepY = 0;
            sheepDirectionY *= -1;
        }
        if (sheepY > window.innerHeight - sheepSize) {
            sheepY = window.innerHeight - sheepSize;
            sheepDirectionY *= -1;
        }
        
        // Apply position
        sheep.style.left = `${sheepX}px`;
        sheep.style.top = `${sheepY}px`;
        
        // Check win condition - if sheep is inside fence
        if (isSheepInFence()) {
            endGame();
        }
    }
    
    // Mouse movement event
    document.addEventListener('mousemove', (e) => {
        if (gameActive) {
            updateDogPosition(e.clientX, e.clientY);
        }
    });
    
    // Touch movement event for mobile
    document.addEventListener('touchmove', (e) => {
        if (gameActive) {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            updateDogPosition(touch.clientX, touch.clientY);
        }
    }, { passive: false });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Update fence dimensions
        updateFenceDimensions();
        
        // Keep sheep within bounds after resize
        const sheepSize = parseInt(getComputedStyle(sheep).width);
        if (sheepX > window.innerWidth - sheepSize) {
            sheepX = window.innerWidth - sheepSize;
        }
        if (sheepY > window.innerHeight - sheepSize) {
            sheepY = window.innerHeight - sheepSize;
        }
    });
    
    // Game loop
    function gameLoop() {
        updateSheepPosition();
        requestAnimationFrame(gameLoop);
    }
    
    // Reset game function
    function resetGame() {
        // Reset game state
        gameActive = true;
        
        // Hide modal
        winModal.style.display = 'none';
        
        // Reset positions
        dogX = window.innerWidth * 0.75;
        dogY = window.innerHeight / 2;
        
        // Start sheep on the right side (outside the fence)
        sheepX = window.innerWidth * 0.75 + Math.random() * (window.innerWidth * 0.2);
        sheepY = window.innerHeight * 0.25 + Math.random() * (window.innerHeight * 0.5);
        
        // Reset sheep direction
        sheepDirectionX = Math.random() * 2 - 1;
        sheepDirectionY = Math.random() * 2 - 1;
        
        // Update positions
        dog.style.left = `${dogX - 20}px`;
        dog.style.top = `${dogY - 20}px`;
        sheep.style.left = `${sheepX}px`;
        sheep.style.top = `${sheepY}px`;
    }
    
    // Play Again button event
    playAgainBtn.addEventListener('click', resetGame);
    
    // Start the game
    gameLoop();
    
    // Set initial positions
    dog.style.left = `${dogX - 20}px`;
    dog.style.top = `${dogY - 20}px`;
    sheep.style.left = `${sheepX}px`;
    sheep.style.top = `${sheepY}px`;
});