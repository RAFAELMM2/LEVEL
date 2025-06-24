// game.js

// ... (seção 1: Configurações do Canvas e Contexto de Desenho)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ... (seção 2: Elementos da Interface do Usuário (UI))
const playerHpEl = document.getElementById('playerHp');
const playerMaxHpEl = document.getElementById('playerMaxHp');
const playerXpEl = document.getElementById('playerXp');
const playerXpToNextLevelEl = document.getElementById('playerXpToNextLevel');
const playerLevelEl = document.getElementById('playerLevel');
const playerAttributePointsEl = document.getElementById('playerAttributePoints');
const playerStrengthEl = document.getElementById('playerStrength');
const playerDefenseEl = document.getElementById('playerDefense');
const playerVitalityEl = document.getElementById('playerVitality');

const addStrengthBtn = document.getElementById('addStrengthBtn');
const addDefenseBtn = document.getElementById('addDefenseBtn');
const addVitalityBtn = document.getElementById('addVitalityBtn');

const gameOverScreen = document.getElementById('game-over-screen');
const startScreen = document.getElementById('start-screen'); // NOVO: Elemento da tela de início
const startGameBtn = document.getElementById('startGameBtn'); // NOVO: Botão de iniciar

// ... (seção 3: Variáveis Globais do Jogo)
let gameStarted = false; // NOVO: Variável para controlar se o jogo começou
let gameOver = false;
let enemies = [];
let gameFrame = 0;
const ENEMY_SPAWN_INTERVAL = 300;
const BOSS_LEVEL = 5;

// ... (seção 4: Teclas Pressionadas - Sistema de Input)
const keys = {};
window.addEventListener('keydown', (e) => {
    if (gameStarted) { // Apenas registra teclas se o jogo já começou
        keys[e.key.toLowerCase()] = true;
    }
});
window.addEventListener('keyup', (e) => {
    if (gameStarted) { // Apenas registra teclas se o jogo já começou
        keys[e.key.toLowerCase()] = false;
    }
});

// ... (seção 5: Variáveis Globais para Ataque do Jogador)
let playerIsAttacking = false;
const ATTACK_COOLDOWN = 500;
let lastAttackTime = 0;

// ... (CLASSE DO JOGADOR - sem mudanças aqui) ...
// ... (CLASSE DO INIMIGO - sem mudanças aqui) ...
// ... (CLASSE DO BOSS - sem mudanças aqui) ...

// --- FUNÇÕES DE GERENCIAMENTO DE INIMIGOS E BOSS ---
function spawnEnemy() {
    // Apenas spawna se o jogo tiver começado e não estiver em Game Over
    if (!gameStarted || gameOver || player.level >= BOSS_LEVEL) return; 

    const side = Math.floor(Math.random() * 4);
    let spawnX, spawnY;

    if (side === 0) {
        spawnX = Math.random() * canvas.width;
        spawnY = -50;
    } else if (side === 1) {
        spawnX = canvas.width + 50;
        spawnY = Math.random() * canvas.height;
    } else if (side === 2) {
        spawnX = Math.random() * canvas.width;
        spawnY = canvas.height + 50;
    } else {
        spawnX = -50;
        spawnY = Math.random() * canvas.height;
    }
    enemies.push(new Enemy(spawnX, spawnY, player.level));
}

function spawnBoss() {
    if (!gameStarted || gameOver) return; // Garante que o boss só apareça se o jogo estiver ativo
    enemies = [];
    enemies.push(new Boss(canvas.width / 2, 100, player.level));
    console.log("O BOSS APARECEU!");
}

// ... (FUNÇÕES DE EVENTO PARA BOTÕES DE ATRIBUTO - sem mudanças aqui) ...

// ... (FUNÇÃO PARA ATUALIZAR A INTERFACE DO USUÁRIO (UI) - sem mudanças aqui) ...

// --- FUNÇÃO PARA INICIAR O JOGO ---
function initializeGame() {
    // Resetar estado do jogo, caso seja um "jogar novamente" sem refresh completo
    player.currentHp = player.maxHp;
    player.currentXp = 0;
    player.level = 1;
    player.attributePoints = 0;
    player.strength = 1;
    player.defense = 1;
    player.vitality = 1;
    player.calculateMaxHp();
    enemies = [];
    gameFrame = 0;
    gameOver = false;
    gameStarted = true; // Marca que o jogo começou!

    startScreen.style.display = 'none'; // Esconde a tela de início
    gameOverScreen.style.display = 'none'; // Garante que a tela de game over esteja escondida

    updateUI(); // Atualiza a UI com os valores iniciais do jogo
    gameLoop(); // Inicia o loop principal do jogo
}

// --- NOVO: Listener para o botão de iniciar jogo ---
startGameBtn.addEventListener('click', initializeGame);

// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    // Apenas executa o loop se o jogo tiver começado e não estiver em Game Over
    if (!gameStarted || gameOver) {
        // Se o jogo não começou, apenas desenha o player parado (opcional)
        if (!gameStarted) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            player.draw(); // Desenha o player na tela enquanto espera o início
        }
        requestAnimationFrame(gameLoop); // Continua chamando para verificar o startGameBtn
        return;
    }

    gameFrame++;

    // Spawna inimigos regularmente, mas não se for o nível do boss
    if (player.level < BOSS_LEVEL && gameFrame % ENEMY_SPAWN_INTERVAL === 0) {
        spawnEnemy();
    }

    // Filtrar inimigos mortos (e o boss, se ele for derrotado) da lista
    enemies = enemies.filter(enemy => enemy.isAlive);

    // 1. ATUALIZAÇÃO DA LÓGICA DO JOGO
    player.update();
    enemies.forEach(enemy => enemy.update());

    // 2. DESENHO NA TELA
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas inteiro

    player.draw();
    enemies.forEach(enemy => enemy.draw());

    // 3. ATUALIZAÇÃO DA INTERFACE (UI)
    updateUI();

    // Requisita o próximo frame para continuar o loop
    requestAnimationFrame(gameLoop);
}

// --- Remover a chamada inicial do gameLoop daqui ---
// gameLoop(); // Esta linha será removida ou comentada
// updateUI(); // Esta linha também
// O jogo só começa quando o botão "INICIAR JOGO" for clicado
