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
const startScreen = document.getElementById('start-screen'); // Elemento da tela de início
const startGameBtn = document.getElementById('startGameBtn'); // Botão de iniciar

// 3. Variáveis Globais do Jogo
let gameStarted = false; // Estado do jogo: true se iniciado, false caso contrário
let gameOver = false;    // Estado do jogo: true se Game Over, false caso contrário
let enemies = [];
let gameFrame = 0;       // Contador de frames para spawn de inimigos e poderes
const ENEMY_SPAWN_INTERVAL = 300; // Um inimigo novo a cada X frames
const BOSS_LEVEL = 5;    // O nível em que o boss aparece

// 4. Teclas Pressionadas - Sistema de Input
const keys = {};
window.addEventListener('keydown', (e) => {
    if (gameStarted && !gameOver) { // Apenas registra teclas se o jogo já começou E NÃO estiver em game over
        keys[e.key.toLowerCase()] = true;
    }
});
window.addEventListener('keyup', (e) => {
    if (gameStarted && !gameOver) { // Apenas registra teclas se o jogo já começou E NÃO estiver em game over
        keys[e.key.toLowerCase()] = false;
    }
});

// 5. Variáveis Globais para Ataque do Jogador
let playerIsAttacking = false;
const ATTACK_COOLDOWN = 500; // 500 milissegundos = 0.5 segundos de cooldown
let lastAttackTime = 0;

// --- CLASSE DO JOGADOR ---
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.size = 40; // Tamanho do jogador (largura e altura)
        this.baseSpeed = 3;
        this.speed = this.baseSpeed;

        this.level = 1;
        this.currentHp = 100;
        this.maxHp = 100;
        this.currentXp = 0;
        this.xpToNextLevel = 100;

        this.attributePoints = 0;
        this.strength = 1;     // Afeta o dano da espada
        this.defense = 1;      // Reduz o dano que o jogador recebe
        this.vitality = 1;     // Aumenta o HP máximo

        this.attackRange = 60; // Distância que a espada atinge
        this.baseAttackDamage = 10; // Dano base do ataque do jogador
    }

    // Calcula o HP máximo do jogador com base no nível e vitalidade
    calculateMaxHp() {
        // HP base + (nível * 10) + (vitalidade * 20)
        this.maxHp = Math.floor(100 + (this.level * 10) + (this.vitality * 20));
        // Garante que o HP atual não ultrapasse o máximo se for aumentado
        if (this.currentHp > this.maxHp) {
            this.currentHp = this.maxHp;
        }
    }

    // Lógica para subir de nível
    levelUp() {
        this.level++;
        this.attributePoints += 1; // Ganha 1 ponto de atributo por nível
        this.calculateMaxHp();     // Recalcula o HP máximo
        this.currentHp = this.maxHp; // Cura total ao subir de nível
        
        // Aumenta o XP necessário para o próximo nível (cada nível fica 25% mais longo)
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.25);
        this.currentXp = 0; // Zera o XP

        console.log(`Parabéns! Você subiu para o Nível ${this.level}!`);
        if (this.level === BOSS_LEVEL) {
            spawnBoss(); // Invoca o boss no nível 5
        }
    }

    // Adiciona XP ao jogador e verifica se ele sobe de nível
    addXp(amount) {
        this.currentXp += amount;
        if (this.currentXp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    // Lógica para o jogador receber dano
    takeDamage(amount) {
        // Dano recebido = Dano do ataque - (Defesa * 2)
        const damageTaken = Math.max(0, amount - (this.defense * 2));
        this.currentHp -= damageTaken;
        if (this.currentHp <= 0) {
            this.currentHp = 0;
            gameOver = true;
            gameOverScreen.style.display = 'flex'; // Mostra a tela de Game Over
            console.log("GAME OVER!");
        }
    }

    // Lógica de ataque do jogador com a espada
    attack() {
        const currentTime = Date.now();
        if (currentTime - lastAttackTime < ATTACK_COOLDOWN) {
            return; // Ainda está em cooldown
        }

        lastAttackTime = currentTime; // Reseta o tempo do último ataque

        // Define que o jogador está atacando para desenhar a animação/feedback
        playerIsAttacking = true;
        setTimeout(() => {
            playerIsAttacking = false;
        }, 100); // Ex: animação de ataque dura 100ms

        // Calcular dano da espada: Dano base + (Força * 5)
        const totalDamage = this.baseAttackDamage + (this.strength * 5);

        // Itera sobre todos os inimigos para verificar se estão no alcance
        enemies.forEach(enemy => {
            // Calcula a distância entre o centro do jogador e o centro do inimigo
            const dx = enemy.x + enemy.size / 2 - (this.x + this.size / 2);
            const dy = enemy.y + enemy.size / 2 - (this.y + this.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Verifica se o inimigo está dentro do alcance de ataque
            if (distance < (this.size / 2) + this.attackRange) { // Colisão de círculo simples
                const enemyDied = enemy.takeDamage(totalDamage);
                if (enemyDied) {
                    this.addXp(enemy.xpDrop); // Ganha XP se o inimigo morreu
                }
            }
        });
    }

    // Atualiza a lógica do jogador (movimento, ataque)
    update() {
        if (gameOver) return; // Se o jogo acabou, não atualiza mais

        // Movimento do jogador com base nas teclas
        this.speed = this.baseSpeed + (this.level * 0.2); // Velocidade aumenta um pouco com o nível
        if (keys['w']) this.y -= this.speed;
        if (keys['s']) this.y += this.speed;
        if (keys['a']) this.x -= this.speed;
        if (keys['d']) this.x += this.speed;

        // Limitar jogador dentro das bordas do canvas
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.size) this.x = canvas.width - this.size;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.size) this.y = canvas.height - this.size;

        // Ataque (se a tecla 'f' for pressionada)
        if (keys['f']) {
            this.attack();
        }
    }

    // Desenha o jogador na tela
    draw() {
        ctx.fillStyle = 'blue'; // Cor do jogador
        ctx.fillRect(this.x, this.y, this.size, this.size); // Desenha o quadrado do jogador

        // Feedback visual da espada quando o jogador ataca
        if (playerIsAttacking) {
            ctx.strokeStyle = 'gold'; // Cor da espada
            ctx.lineWidth = 4;
            ctx.beginPath();
            const playerCenterX = this.x + this.size / 2;
            const playerCenterY = this.y + this.size / 2;
            // Desenha um arco para simular o balançar da espada
            // Exemplo: arco de ataque para a direita (você pode melhorar isso para todas as direções)
            ctx.arc(playerCenterX, playerCenterY, this.size + 10, -Math.PI / 4, Math.PI / 4);
            ctx.stroke();
        }

        // Desenhar barra de HP acima do jogador
        ctx.fillStyle = 'red';
        const hpBarWidth = this.size;
        const hpBarHeight = 5;
        const currentHpBarWidth = (this.currentHp / this.maxHp) * hpBarWidth;
        ctx.fillRect(this.x, this.y - hpBarHeight - 2, currentHpBarWidth, hpBarHeight);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y - hpBarHeight - 2, hpBarWidth, hpBarHeight);
    }
}

// --- CLASSE DO INIMIGO ---
class Enemy {
    constructor(x, y, level = 1) { // Inimigo recebe o nível do jogador para escalar dificuldade
        this.x = x;
        this.y = y;
        this.size = 25 + (level * 2); // Tamanho aumenta com o nível
        this.color = 'red';
        this.hp = 50 + (level * 15); // HP aumenta com o nível
        this.maxHp = this.hp;
        this.damage = 10 + (level * 3); // Dano aumenta com o nível
        this.xpDrop = 15; // Todos os inimigos dão 15 XP
        this.speed = 1 + (level * 0.1); // Velocidade aumenta um pouco
        this.isAlive = true; // Para saber se o inimigo está vivo ou morto
        this.attackCooldown = 1000; // Inimigo ataca a cada 1 segundo
        this.lastAttackTime = 0;
    }

    // Lógica para o inimigo receber dano
    takeDamage(amount) {
        if (!this.isAlive) return false; // Não causa dano em inimigo morto

        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false; // Marca como morto
            console.log("Inimigo derrotado!");
            return true; // Retorna true se o inimigo morreu
        }
        return false; // Retorna false se o inimigo não morreu
    }

    // Atualiza a lógica do inimigo (movimento, ataque)
    update() {
        if (!this.isAlive || gameOver) return; // Não atualiza inimigos mortos ou se o jogo acabou

        // Movimento de perseguição ao jogador
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) { // Para evitar divisão por zero se estiver em cima do jogador
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Lógica de ataque do inimigo ao jogador (se estiver perto e fora do cooldown)
        const currentTime = Date.now();
        const attackDistance = this.size / 2 + player.size / 2 + 5; // Distância para o inimigo atacar
        if (distance < attackDistance && currentTime - this.lastAttackTime > this.attackCooldown) {
             player.takeDamage(this.damage); // Causa dano ao jogador
             this.lastAttackTime = currentTime; // Reseta o cooldown do ataque do inimigo
        }
    }

    // Desenha o inimigo na tela
    draw() {
        if (!this.isAlive) return; // Não desenha inimigos mortos

        ctx.fillStyle = this.color; // Cor do inimigo
        ctx.fillRect(this.x, this.y, this.size, this.size); // Desenha o quadrado do inimigo

        // Desenhar barra de HP do inimigo
        ctx.fillStyle = 'red';
        const hpBarWidth = this.size;
        const hpBarHeight = 3;
        const currentHpBarWidth = (this.hp / this.maxHp) * hpBarWidth;
        ctx.fillRect(this.x, this.y - hpBarHeight - 2, currentHpBarWidth, hpBarHeight);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y - hpBarHeight - 2, hpBarWidth, hpBarHeight);
    }
}

// --- CLASSE DO BOSS (HERDA DE INIMIGO) ---
class Boss extends Enemy { // Boss é um tipo especial de Enemy
    constructor(x, y, level) {
        super(x, y, level); // Chama o construtor do Enemy para herdar propriedades básicas
        this.size = 80; // Boss é maior
        this.color = 'purple'; // Cor do boss
        this.hp = 1200; // HP do boss
        this.maxHp = this.hp;
        this.damage = 30; // Dano do ataque normal do boss
        this.xpDrop = 500; // XP grande ao derrotar o boss
        this.speed = 0.5; // Boss é mais lento

        this.summonCooldown = 5000; // Invoca a cada 5 segundos
        this.lastSummonTime = 0;

        this.lightningCooldown = 3000; // Lança raio a cada 3 segundos
        this.lastLightningTime = 0;
        this.lightningDuration = 200; // Duração visual do raio
        this.isCastingLightning = false; // Se está lançando raio
        this.lightningTargetX = 0; // Posição X onde o raio vai atingir
        this.lightningTargetY = 0; // Posição Y onde o raio vai atingir
    }

    update() {
        super.update(); // Chama o método update da classe Enemy (perseguição, dano normal)
        if (!this.isAlive || gameOver) return;

        const currentTime = Date.now();

        // Lógica de Invocação de Inimigos
        // Invoca um inimigo se o cooldown passou e há menos de 10 inimigos na tela
        if (currentTime - this.lastSummonTime > this.summonCooldown && enemies.length < 10) {
            this.summonEnemy();
            this.lastSummonTime = currentTime;
        }

        // Lógica de Raio Especial do Boss
        if (currentTime - this.lastLightningTime > this.lightningCooldown) {
            this.castLightning();
            this.lastLightningTime = currentTime;
            this.isCastingLightning = true;
            // O raio mira na posição atual do jogador
            this.lightningTargetX = player.x + player.size / 2;
            this.lightningTargetY = player.y + player.size / 2;

            // Define um tempo para a animação do raio terminar e causar dano
            setTimeout(() => {
                this.isCastingLightning = false; // Termina a animação do raio
                // Causa dano no jogador se ele ainda estiver na área do raio
                const dx = player.x + player.size / 2 - this.lightningTargetX;
                const dy = player.y + player.size / 2 - this.lightningTargetY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const lightningRadius = 50; // Área de efeito do raio
                if (distance < lightningRadius) {
                    player.takeDamage(50); // Dano do raio do boss
                }
            }, this.lightningDuration);
        }
    }

    // Invoca um novo inimigo perto do boss
    summonEnemy() {
        const offset = 50; // Pequeno deslocamento para o inimigo não nascer exatamente em cima do boss
        enemies.push(new Enemy(this.x + Math.random() * offset - offset / 2, this.y + Math.random() * offset - offset / 2, player.level));
        console.log("Boss invocou um inimigo!");
    }

    // Apenas para console, a lógica de dano e visual está no update e draw
    castLightning() {
        console.log("Boss lançou um raio!");
    }

    // Desenha o boss e o efeito do raio
    draw() {
        super.draw(); // Desenha o corpo do boss usando o método draw do Enemy
        if (!this.isAlive) return;

        // Desenhar visual do raio se estiver ativo
        if (this.isCastingLightning) {
            ctx.strokeStyle = 'cyan'; // Cor do raio
            ctx.lineWidth = 5;
            ctx.beginPath();
            // Desenha um raio simples do boss para o alvo
            ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
            ctx.lineTo(this.lightningTargetX, this.lightningTargetY);
            ctx.stroke();
            // Desenha uma área de efeito no alvo
            ctx.arc(this.lightningTargetX, this.lightningTargetY, 50, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}


// --- INSTÂNCIAS DOS PERSONAGENS E OBJETOS DO JOGO ---
// Declarar o player aqui, mas inicializar suas propriedades no initializeGame para resetar
let player = new Player();


// --- FUNÇÕES DE GERENCIAMENTO DE INIMIGOS E BOSS ---
// Spawna um inimigo em uma das bordas da tela
function spawnEnemy() {
    // Apenas spawna se o jogo tiver começado e não estiver em Game Over
    if (!gameStarted || gameOver || player.level >= BOSS_LEVEL) return; 

    const side = Math.floor(Math.random() * 4); // 0: topo, 1: direita, 2: baixo, 3: esquerda
    let spawnX, spawnY;

    // Define as coordenadas de spawn fora da tela
    if (side === 0) { // Topo
        spawnX = Math.random() * canvas.width;
        spawnY = -50;
    } else if (side === 1) { // Direita
        spawnX = canvas.width + 50;
        spawnY = Math.random() * canvas.height;
    } else if (side === 2) { // Baixo
        spawnX = Math.random() * canvas.width;
        spawnY = canvas.height + 50;
    } else { // Esquerda
        spawnX = -50;
        spawnY = Math.random() * canvas.height;
    }
    enemies.push(new Enemy(spawnX, spawnY, player.level)); // Spawna inimigo com o nível atual do jogador
}

// Spawna o Boss e remove os inimigos normais
function spawnBoss() {
    if (!gameStarted || gameOver) return; // Garante que o boss só apareça se o jogo estiver ativo
    enemies = []; // Remove todos os inimigos normais da tela
    enemies.push(new Boss(canvas.width / 2, 100, player.level)); // Spawna o boss no centro superior
    console.log("O BOSS APARECEU!");
}


// --- FUNÇÕES DE EVENTO PARA BOTÕES DE ATRIBUTO ---
addStrengthBtn.addEventListener('click', () => {
    if (player.attributePoints > 0) {
        player.strength++;
        player.attributePoints--;
        updateUI(); // Atualiza a UI para mostrar a mudança
    }
});

addDefenseBtn.addEventListener('click', () => {
    if (player.attributePoints > 0) {
        player.defense++;
        player.attributePoints--;
        updateUI(); // Atualiza a UI
    }
});

addVitalityBtn.addEventListener('click', () => {
    if (player.attributePoints > 0) {
        player.vitality++;
        player.attributePoints--;
        player.calculateMaxHp(); // Vitalidade afeta o HP máximo, então recalcula
        player.currentHp += 20; // Pequeno bônus de cura ao adicionar vitalidade
        if (player.currentHp > player.maxHp) player.currentHp = player.maxHp; // Garante que não exceda o máximo
        updateUI(); // Atualiza a UI
    }
});


// --- FUNÇÃO PARA ATUALIZAR A INTERFACE DO USUÁRIO (UI) ---
function updateUI() {
    playerHpEl.textContent = Math.floor(player.currentHp);
    playerMaxHpEl.textContent = player.maxHp;
    playerXpEl.textContent = player.currentXp;
    playerXpToNextLevelEl.textContent = player.xpToNextLevel;
    playerLevelEl.textContent = player.level;
    playerAttributePointsEl.textContent = player.attributePoints;
    playerStrengthEl.textContent = player.strength;
    playerDefenseEl.textContent = player.defense;
    playerVitalityEl.textContent = player.vitality;

    // Desabilitar/habilitar botões de atributo com base nos pontos disponíveis
    addStrengthBtn.disabled = player.attributePoints === 0;
    addDefenseBtn.disabled = player.attributePoints === 0;
    addVitalityBtn.disabled = player.attributePoints === 0;
}

// --- FUNÇÃO PARA REINICIAR O JOGO E INICIALIZAR ---
// Esta função é chamada quando o botão "INICIAR JOGO" é clicado, ou para reiniciar.
function initializeGame() {
    // Resetar TODAS as propriedades do jogador para o estado inicial
    player = new Player(); // Cria uma NOVA instância de jogador, resetando tudo
    player.calculateMaxHp(); // Garante que o HP máximo inicial seja calculado corretamente
    
    // Resetar variáveis de estado do jogo
    enemies = []; // Limpa a lista de inimigos
    gameFrame = 0;
    gameOver = false;
    gameStarted = true; // Marca que o jogo começou!

    // Esconder telas de interface (se estiverem visíveis)
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    updateUI(); // Atualiza a UI com os valores iniciais do jogo

    // O loop já está rodando via requestAnimationFrame,
    // mas agora que gameStarted é true, ele começará a processar a lógica do jogo.
}

// --- Listener para o botão de iniciar jogo ---
startGameBtn.addEventListener('click', initializeGame);

// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    // CRÍTICO: Este IF garante que NENHUMA LÓGICA DE JOGO ACONTEÇA se o jogo não estiver iniciado
    if (!gameStarted || gameOver) {
        // Se o jogo não começou ou já terminou, apenas desenha o player parado no centro
        // e atualiza a UI com os valores iniciais.
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        player.draw(); // Desenha o jogador na tela de "pausa"
        updateUI(); // Mantém a UI com valores iniciais/estáticos

        // Continua chamando o gameLoop para que o botão de início possa ser clicado.
        requestAnimationFrame(gameLoop);
        return; // Sai da função, impedindo que o resto da lógica do jogo seja executada.
    }

    // Se chegamos aqui, o jogo está ativo (gameStarted é true e gameOver é false)!
    gameFrame++;

    // Spawna inimigos regularmente, mas não se for o nível do boss
    if (player.level < BOSS_LEVEL && gameFrame % ENEMY_SPAWN_INTERVAL === 0) {
        spawnEnemy();
    }

    // Filtrar inimigos mortos (e o boss, se ele for derrotado) da lista
    enemies = enemies.filter(enemy => enemy.isAlive);

    // 1. ATUALIZAÇÃO DA LÓGICA DO JOGO
    player.update(); // Atualiza o jogador
    enemies.forEach(enemy => enemy.update()); // Atualiza todos os inimigos

    // 2. DESENHO NA TELA
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas inteiro

    player.draw(); // Desenha o jogador
    enemies.forEach(enemy => enemy.draw()); // Desenha todos os inimigos

    // 3. ATUALIZAÇÃO DA INTERFACE (UI)
    updateUI();

    // Requisita o próximo frame para continuar o loop
    requestAnimationFrame(gameLoop);
}

// --- INICIAR O CICLO DO LOOP DE ANIMAÇÃO ---
// Esta é a única chamada inicial ao gameLoop para começar o ciclo de requestAnimationFrame.
// Ele começará no estado "não iniciado", esperando o clique do botão.
requestAnimationFrame(gameLoop);

// Nenhuma outra linha de código deve estar aqui abaixo no game.js
