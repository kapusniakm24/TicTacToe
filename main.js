const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const gravitacia = 0.5;

// === DEFINÍCIA PLATFORIEK ===
const platforms = [
    { x: 0, y: 380, width: 800, height: 20, color: '#050505', type: 'floor' },
    { x: 0, y: 0, width: 800, height: 1 },
    { x: 0, y: 0, width: 1, height: 400 },
    { x: 800, y: 0, width: 1, height: 400 },
    { x: 0, y: 335, width: 300, height: 400, color: '#1a1a1a', type: 'wall' }, 
    { x: 100, y: 0, width: 100, height: 320, color: '#333', type: 'pipe_v' },
    { x: 200, y: 230, width: 100, height: 90, color: '#333', type: 'pipe_v' },
    { x: 200, y: 150, width: 220, height: 20, color: '#555', type: 'pipe_h' },
    { x: 450, y: 270, width: 250, height: 400, color: '#1a1a1a', type: 'wall' }, 
    { x: 430, y: 320, width: 20, height: 350, color: '#400', type: 'valve' },
    { x: 550, y: 60, width: 150, height: 400, color: '#1a1a1a', type: 'wall' }, 
    { x: 530, y: 200, width: 30, height: 200, color: '#333', type: 'pipe_v' },
    { x: 450, y: 60, width: 420, height: 20, color: '#555', type: 'pipe_h' },
];

// === NAČÍTANIE OBRÁZKOV ===
const macky = {
    dolava: new Image(), doprava: new Image(), plazeniedoprava: new Image()
};
macky.dolava.src = 'asseti/cyber-cat main cahrakter.png';
macky.doprava.src = 'asseti/Cybermacka druhy pohlad.png';
macky.plazeniedoprava.src = 'asseti/Plaziaca macka.png';

let actualnaakciacici = macky.doprava;
const keys = { right: false, left: false };

// === VLASTNOSTI HRÁČA + LOCALSTORAGE NAČÍTANIE ===
// Skúsime načítať pozíciu z pamäte
const savedPosition = JSON.parse(localStorage.getItem('cyberCatPos'));

let player = {
    x: savedPosition ? savedPosition.x : 50, // Ak existuje save, použi ho, inak 50
    y: savedPosition ? savedPosition.y : 300, 
    width: 30, height: 30,
    dx: 0, dy: 0, speed: 3, jumpForce: 10,
    grounded: false
};

// Funkcia na uloženie pozície
function saveGame() {
    localStorage.setItem('cyberCatPos', JSON.stringify({ x: player.x, y: player.y }));
}

// --- ATMOSFÉRICKÉ EFEKTY ---
let time = 0;
let fogParticles = [];
for(let i=0; i<30; i++) {
    fogParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 50 + 20,
        s: Math.random() * 0.5 + 0.1
    });
}

// === GRAFICKÉ RUTINY ===

function getBrickPattern() {
    const p = document.createElement('canvas');
    const pc = p.getContext('2d');
    p.width = 32; p.height = 16;
    pc.fillStyle = '#141a14'; pc.fillRect(0,0,32,16); 
    pc.fillStyle = '#0a100a'; pc.fillRect(0,0,30,14); 
    pc.fillStyle = '#1a251a'; pc.fillRect(1,1,28,12); 
    return c.createPattern(p, 'repeat');
}
const brickPattern = getBrickPattern();

function drawRealPipe(p, isVertical) {
    c.save();
    let grad;
    if (isVertical) {
        grad = c.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
    } else {
        grad = c.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    }
    grad.addColorStop(0, '#111');
    grad.addColorStop(0.2, '#3a403a'); 
    grad.addColorStop(0.5, '#222');   
    grad.addColorStop(0.8, '#443020'); 
    grad.addColorStop(1, '#050505');

    c.fillStyle = grad;
    c.fillRect(p.x, p.y, p.width, p.height);
    
    c.fillStyle = 'rgba(0,0,0,0.4)';
    if(isVertical) {
        for(let i=10; i<p.height; i+=20) { c.fillRect(p.x+2, p.y+i, p.width-4, 2); }
    } else {
        for(let i=10; i<p.width; i+=20) { c.fillRect(p.x+i, p.y+2, 2, p.height-4); }
    }
    c.restore();
}

function drawRealServer(p) {
    c.save();
    c.fillStyle = '#0d0f12';
    c.fillRect(p.x, p.y, p.width, p.height);
    c.strokeStyle = '#1a1d24';
    c.lineWidth = 1;
    for(let i = p.y + 10; i < p.y + p.height; i += 10) {
        c.beginPath(); c.moveTo(p.x + 10, i); c.lineTo(p.x + p.width - 10, i); c.stroke();
    }
    for(let i = p.y + 15; i < p.y + p.height; i += 20) {
        c.fillStyle = Math.random() > 0.98 ? '#ff0055' : (Math.random()>0.5 ? '#00ff41' : '#004411');
        c.fillRect(p.x + 5, i, 4, 3);
    }
    c.restore();
}

function drawFog() {
    c.save();
    c.globalCompositeOperation = 'screen';
    fogParticles.forEach(p => {
        let grad = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, 'rgba(0, 100, 30, 0.1)');
        grad.addColorStop(1, 'transparent');
        c.fillStyle = grad;
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI*2); c.fill();
        p.x += Math.sin(time + p.r) * 0.2;
    });
    c.restore();
}

// === OVLÁDANIE ===
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd'){ keys.right = true; actualnaakciacici = macky.dolava; } 
    if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; actualnaakciacici = macky.doprava; }
    if ((e.key === 'ArrowUp' || e.key === 'w') && player.grounded) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }
    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 15;
        player.grounded = false;
        actualnaakciacici = macky.plazeniedoprava;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if ((e.key === 'ArrowDown' || e.key === 's') && player.grounded) {
        player.height = 30;
        player.y -= 15;
        actualnaakciacici = macky.doprava;
    }
});

// === HLAVNÁ SMYČKA ===
function animovanie() {
    requestAnimationFrame(animovanie);
    time += 0.01;
    c.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Pozadie
    let bgGrad = c.createRadialGradient(400, 200, 50, 400, 200, 400);
    bgGrad.addColorStop(0, '#0a100a');
    bgGrad.addColorStop(1, '#010501');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = brickPattern;
    c.fillRect(0, 0, canvas.width, canvas.height);
    drawFog();

    // 2. Vykreslenie objektov
    platforms.forEach(p => {
        if(p.type === 'floor') {
            c.fillStyle = '#000';
            c.fillRect(p.x, p.y, p.width, p.height);
            let sliz = c.createLinearGradient(0, p.y, 0, p.y + p.height);
            sliz.addColorStop(0, '#00ff41');
            sliz.addColorStop(1, 'transparent');
            c.fillStyle = sliz;
            c.fillRect(p.x, p.y, p.width, 3);
        }
        else if(p.type === 'wall') {
            drawRealServer(p);
        }
        else if(p.type === 'pipe_v') {
            drawRealPipe(p, true);
        }
        else if(p.type === 'pipe_h') {
            drawRealPipe(p, false);
        }
        else if(p.type === 'valve') {
            c.fillStyle = '#400';
            c.fillRect(p.x, p.y, p.width, p.height);
            c.fillStyle = '#600'; c.fillRect(p.x+5, p.y+20, 10, 10);
        }
        else {
            c.fillStyle = 'transparent';
            c.fillRect(p.x, p.y, p.width, p.height);
        }
    });

    // 3. Pohyb a Fyzika
    if (keys.right) player.dx = player.speed;
    else if (keys.left) player.dx = -player.speed;
    else player.dx = 0;

    player.x += player.dx;
    player.dy += gravitacia;
    player.y += player.dy;
    player.grounded = false; 

    // Kolízie
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y 
        ) {
            if (player.dy > 0 && (player.y + player.height - player.dy) <= platform.y) {
                player.y = platform.y - player.height;
                player.dy = 0;
                player.grounded = true;
            } 
            else if (player.dx > 0 && (player.x + player.width - player.dx) <= platform.x) {
                player.x = platform.x - player.width;
            }
            else if (player.dx < 0 && (player.x - player.dx) >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
            }
            else if (player.dy < 0 && (player.y - player.dy) >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.dy = 0;
                player.grounded = true;
            }   
        }
    });

    // --- AUTOMATICKÉ UKLADANIE ---
    saveGame();

    // 4. Vykreslenie postavy
    if (actualnaakciacici && actualnaakciacici.complete && actualnaakciacici.naturalWidth !== 0) {
        c.drawImage(actualnaakciacici, player.x, player.y, player.width, player.height);
    } else {
        c.fillStyle = 'red'; 
        c.fillRect(player.x, player.y, player.width, player.height);
    }
}

animovanie();