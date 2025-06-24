// game.js

// 1. Configurações do Canvas e Contexto de Desenho
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Definir o tamanho da sua tela de jogo (ex: 1000 pixels de largura por 700 de altura)
canvas.width = 1000;
canvas.height = 700;

// 2. Elementos da Interface do Usuário (UI) - Pegando do HTML
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
const startScreen = document.getElementById('start-screen');
const startGameBtn = document.getElementById('startGameBtn');

// --- PONTO CRÍTICO: DECLARAÇÃO DE VARIÁVEIS GLOBAIS E INSTÂNCIA DO JOGADOR AQUI ---
// ELAS PRECISAM ESTAR AQUI EM CIMA PARA SEREM RECONHECIDAS
// ANTES DE QUALQUER FUNÇÃO OU EVENT LISTENER AS TENTAR USAR.

let gameStarted = false; // Estado do jogo: true se iniciado, false caso contrário
let gameOver = false;    // Estado do jogo: true se Game Over, false caso contrário
let enemies = [];        // Lista para guardar os inimigos
let gameFrame = 0;       // Contador de frames para spawn de inimigos e poderes

// Instância do jogador. Ela é declarada aqui, mas suas propriedades serão resetadas
// no `initializeGame` para garantir um novo começo.
let player; // Declara `player` aqui. A instância `new Player()` será criada em `initializeGame`.

// 4. Teclas Pressionadas - Sistema de Input
const keys = {}; // Declara 'keys' aqui também, antes de ser usada no addEventListener

window.addEventListener('keydown', (e) => {
    // Agora 'gameStarted' e 'gameOver' já estarão definidas
    if (gameStarted && !gameOver) {
        keys[e.key.toLowerCase()] = true;
    }
});
window.addEventListener('keyup', (e) => {
    // Agora 'gameStarted' e 'gameOver' já estarão definidas
    if (gameStarted && !gameOver) {
        keys[e.key.toLowerCase()] = false;
    }
});

// 5. Variáveis Globais para Ataque do Jogador
let playerIsAttacking = false;
const ATTACK_COOLDOWN = 500;
let lastAttackTime = 0;

// --- AQUI VEM AS CLASSES (PLAYER, ENEMY, BOSS) ---
// Elas podem vir aqui, depois das variáveis globais, pois as classes não são "usadas"
// antes de serem instanciadas (com `new Player()`).

// CLASSE DO JOGADOR
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = 40;
        this.baseSpeed = 3;
        this.speed = this.baseSpeed;

        this.level = 1;
        this.currentHp = 100;
        this.maxHp = 100;
        this.currentXp = 0;
        this.xpToNextLevel = 100;

        this.attributePoints = 0;
        this.strength = 1;
        this.defense = 1;
        this.vitality = 1;

        this.attackRange = 60;
        this.baseAttackDamage = 10;
    }

    // ... (restante dos métodos da classe Player) ...
    calculateMaxHp() { /* ... */ }
    levelUp() { /* ... */ }
    addXp(amount) { /* ... */ }
    takeDamage(amount) { /* ... */ }
    attack() { /* ... */ }
    update() { /* ... */ }
    draw() { /* ... */ }
}

// CLASSE DO INIMIGO
class Enemy {
    constructor(x, y, level = 1) { /* ... */ }
    // ... (restante dos métodos da classe Enemy) ...
}

// CLASSE DO BOSS
class Boss extends Enemy {
    constructor(x, y, level) { /* ... */ }
    // ... (restante dos métodos da classe Boss) ...
}


// --- FUNÇÕES DE GERENCIAMENTO DE INIMIGOS E BOSS ---
// Estas funções também precisam das variáveis globais já declaradas
const ENEMY_SPAWN_INTERVAL = 300; // Constante aqui para ser usada na função de spawn
const BOSS_LEVEL = 5;

function spawnEnemy() { /* ... */ }
function spawnBoss() { /* ... */ }


// --- FUNÇÕES DE EVENTO PARA BOTÕES DE ATRIBUTO ---
// Estes listeners também precisam que `player` e `addStrengthBtn` etc. já existam
addStrengthBtn.addEventListener('click', () => {
    // ...
});
addDefenseBtn.addEventListener('click', () => {
    // ...
});
addVitalityBtn.addEventListener('click', () => {
    // ...
});

// --- FUNÇÃO PARA ATUALIZAR A INTERFACE DO USUÁRIO (UI) ---
function updateUI() {
    // ...
}

// --- FUNÇÃO PARA REINICIAR O JOGO E INICIALIZAR ---
function initializeGame() {
    // Agora `player` será definido como uma nova instância de Player
    player = new Player(); 
    player.calculateMaxHp();
    
    enemies = [];
    gameFrame = 0;
    gameOver = false;
    gameStarted = true;

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    updateUI();
    // Não chame requestAnimationFrame aqui, pois o gameLoop já está agendado globalmente
}

// --- Listener para o botão de iniciar jogo ---
// Este listener precisa de `startGameBtn` e `initializeGame` definidos
startGameBtn.addEventListener('click', initializeGame);


// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    // Agora `gameStarted` e `gameOver` estarão definidas quando esta função for chamada
    if (!gameStarted || gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (player) { // Adiciona uma verificação para garantir que player existe antes de desenhar
             player.draw();
        }
        updateUI();
        requestAnimationFrame(gameLoop);
        return;
    }

    gameFrame++;

    if (player.level < BOSS_LEVEL && gameFrame % ENEMY_SPAWN_INTERVAL === 0) {
        spawnEnemy();
    }

    enemies = enemies.filter(enemy => enemy.isAlive);

    player.update();
    enemies.forEach(enemy => enemy.update());

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    enemies.forEach(enemy => enemy.draw());

    updateUI();

    requestAnimationFrame(gameLoop);
}

// --- INICIAR O CICLO DO LOOP DE ANIMAÇÃO ---
// Esta é a única chamada inicial ao gameLoop para começar o ciclo de requestAnimationFrame.
// Ela precisa vir DEPOIS de TUDO o que `gameLoop` e `initializeGame` usam.
requestAnimationFrame(gameLoop);
