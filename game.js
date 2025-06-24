// game.js

// ... (todo o seu código de classes, variáveis, etc., que já te passei) ...

// --- FUNÇÃO PARA INICIAR O JOGO ---
function initializeGame() {
    // Resetar estado do jogo para garantir um início limpo
    player.currentHp = player.maxHp;
    player.currentXp = 0;
    player.level = 1;
    player.attributePoints = 0;
    player.strength = 1;
    player.defense = 1;
    player.vitality = 1;
    player.calculateMaxHp(); // Recalcula o HP máximo com os atributos base
    enemies = []; // Limpa a lista de inimigos
    gameFrame = 0;
    gameOver = false; // Garante que a flag de Game Over esteja falsa
    gameStarted = true; // Marca que o jogo começou!

    startScreen.style.display = 'none'; // Esconde a tela de início
    gameOverScreen.style.display = 'none'; // Garante que a tela de game over esteja escondida

    updateUI(); // Atualiza a UI com os valores iniciais do jogo
    requestAnimationFrame(gameLoop); // ***CHAMA O LOOP PRINCIPAL PELA PRIMEIRA VEZ AQUI***
}

// --- Listener para o botão de iniciar jogo ---
startGameBtn.addEventListener('click', initializeGame);

// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    // ESTA É A MUDANÇA MAIS CRÍTICA:
    // O loop só deve processar a lógica do jogo se gameStarted for true E não for gameOver.
    if (!gameStarted || gameOver) {
        // Se o jogo não começou OU já terminou, apenas redesenha o canvas (limpo ou com o jogador parado)
        // Isso impede que inimigos spawneem ou que a lógica do jogo avance.
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        player.draw(); // Desenha o jogador parado enquanto a tela de início está ativa (opcional, mas bom para feedback)
        updateUI(); // Mantém a UI atualizada com valores iniciais
        requestAnimationFrame(gameLoop); // Continua chamando para verificar o clique no botão
        return; // Sai da função gameLoop, impedindo que o resto do código seja executado.
    }

    // Se chegamos aqui, gameStarted é true e gameOver é false, então o jogo está rodando!
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

    player.draw(); // Desenha o jogador
    enemies.forEach(enemy => enemy.draw()); // Desenha todos os inimigos

    // 3. ATUALIZAÇÃO DA INTERFACE (UI)
    updateUI();

    // Requisita o próximo frame para continuar o loop
    requestAnimationFrame(gameLoop);
}

// --- CHAMADA INICIAL DO LOOP ---
// Chamar gameLoop UMA VEZ no início.
// Isso faz com que a função gameLoop entre no ciclo de requestAnimationFrame,
// mas ela só fará algo de fato quando gameStarted for true.
requestAnimationFrame(gameLoop);

// Nenhuma outra linha de código deve estar aqui abaixo no game.js
