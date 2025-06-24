// game.js

// 1. Pegar a tela do jogo (o canvas) e o pincel (ctx)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // '2d' para desenhar em 2 dimensões

// Definir o tamanho da sua tela de jogo (ex: 800 pixels de largura por 600 de altura)
canvas.width = 800;
canvas.height = 600;

// 2. Pegar os lugares na tela onde vamos mostrar HP, XP, etc.
const playerHpEl = document.getElementById('playerHp');
const playerXpEl = document.getElementById('playerXp');
const playerLevelEl = document.getElementById('playerLevel');

// --- VARIÁVEIS DO JOGADOR ---
let playerX = canvas.width / 2;    // Posição X (horizontal) do jogador, no meio
let playerY = canvas.height - 50;  // Posição Y (vertical) do jogador, perto da parte de baixo
let playerSize = 30;               // Tamanho do jogador (quadrado de 30x30 pixels)
let playerSpeed = 5;               // Velocidade que o jogador se move

let playerHp = 100;                // Vida atual do jogador
let playerXp = 0;                  // Experiência atual do jogador
let playerLevel = 1;               // Nível atual do jogador

// --- COMO SABER QUAL TECLA ESTÁ SENDO PRESSIONADA ---
const keys = {}; // Um objeto que vai guardar se uma tecla está "true" (pressionada) ou "false" (solta)

// Quando uma tecla é apertada
window.addEventListener('keydown', (e) => {
    keys[e.key] = true; // Marca a tecla como pressionada
});

// Quando uma tecla é solta
window.addEventListener('keyup', (e) => {
    keys[e.key] = false; // Marca a tecla como solta
});

// --- FUNÇÃO PARA ATUALIZAR A LÓGICA DO JOGO ---
function update() {
    // 1. Mover o jogador com base nas teclas
    if (keys['ArrowLeft'] || keys['a']) { // Se a seta esquerda OU a tecla 'a' estiver pressionada
        playerX -= playerSpeed; // Move o jogador para a esquerda
    }
    if (keys['ArrowRight'] || keys['d']) { // Se a seta direita OU a tecla 'd' estiver pressionada
        playerX += playerSpeed; // Move o jogador para a direita
    }
    if (keys['ArrowUp'] || keys['w']) { // Se a seta para cima OU a tecla 'w' estiver pressionada
        playerY -= playerSpeed; // Move o jogador para cima
    }
    if (keys['ArrowDown'] || keys['s']) { // Se a seta para baixo OU a tecla 's' estiver pressionada
        playerY += playerSpeed; // Move o jogador para baixo
    }

    // 2. Não deixar o jogador sair da tela
    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - playerSize) playerX = canvas.width - playerSize;
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - playerSize) playerY = canvas.height - playerSize;

    // 3. Exemplo: Se o jogador apertar 'x', ele perde HP
    if (keys['x']) {
        playerHp -= 1; // Perde 1 de HP por frame enquanto 'x' estiver pressionado
        if (playerHp < 0) playerHp = 0; // Não deixa o HP ficar negativo
    }

    // 4. Exemplo: Se o jogador apertar 'c', ele ganha XP
    if (keys['c']) {
        playerXp += 1; // Ganha 1 de XP por frame enquanto 'c' estiver pressionado
    }

    // 5. Exemplo de subir de nível: Se XP chegar a 100
    if (playerXp >= 100) {
        playerLevel++; // Aumenta o nível
        playerXp = 0;  // Zera o XP
        playerHp = 100; // Cura o jogador (apenas exemplo)
        console.log("Subiu de nível! Nível: " + playerLevel); // Mostra no console do navegador
    }
}

// --- FUNÇÃO PARA DESENHAR TUDO NA TELA ---
function draw() {
    // 1. Apagar tudo na tela (para desenhar do zero no próximo frame)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Desenhar o jogador (um quadrado azul)
    ctx.fillStyle = 'blue'; // Cor azul
    ctx.fillRect(playerX, playerY, playerSize, playerSize); // Desenha um retângulo

    // 3. Atualizar os textos de HP, XP e Nível na interface
    playerHpEl.textContent = playerHp;
    playerXpEl.textContent = playerXp;
    playerLevelEl.textContent = playerLevel;
}

// --- O LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    update(); // Primeiro, atualiza a lógica (movimento, HP, XP)
    draw();   // Depois, desenha tudo na tela com as novas posições/valores

    // Pede para o navegador chamar essa mesma função 'gameLoop' novamente
    // na próxima vez que ele puder desenhar (normalmente 60 vezes por segundo)
    requestAnimationFrame(gameLoop);
}

// --- INICIAR O JOGO ---
gameLoop(); // Chama o loop pela primeira vez para ele começar a rodar