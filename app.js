// Configuración del juego según la estructura requerida
const TOTAL_NUMBERS = 50; // Números del 1 al 50
const REQUIRED_SELECTIONS = 6; // Se deben ingresar 6 números únicos

let selectedNumbers = [];

// Captura de elementos de la interfaz del HTML
const board = document.getElementById('board');
const userBallsContainer = document.getElementById('user-balls');
const btnDraw = document.getElementById('btn-draw');
const resultsSection = document.getElementById('results');
const winnerBallsContainer = document.getElementById('winner-balls');
const prizeResult = document.getElementById('prize-result');

// 1. Generar el tablero interactivo de 50 números
function createBoard() {
    for (let i = 1; i <= TOTAL_NUMBERS; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('btn-number');
        button.setAttribute('data-number', i); 
        button.addEventListener('click', () => handleNumberClick(i, button));
        board.appendChild(button);
    }
}

// 2. Gestionar la selección del jugador evitando repeticiones
function handleNumberClick(number, button) {
    // Si la rifa ya finalizó en esta sesión, no hacer nada
    if (sessionStorage.getItem('rifa_finalizada')) return;

    if (selectedNumbers.includes(number)) {
        selectedNumbers = selectedNumbers.filter(n => n !== number);
        button.classList.remove('active');
    } else {
        if (selectedNumbers.length >= REQUIRED_SELECTIONS) {
            alert("Ya has seleccionado el máximo de 6 números.");
            return;
        }
        selectedNumbers.push(number);
        button.classList.add('active');
    }

    selectedNumbers.sort((a, b) => a - b);
    updateUserBalls();
    
    btnDraw.disabled = selectedNumbers.length !== REQUIRED_SELECTIONS;
}

// 3. Actualizar los contenedores visuales de las esferas del usuario
function updateUserBalls() {
    userBallsContainer.innerHTML = '';
    for (let i = 0; i < REQUIRED_SELECTIONS; i++) {
        const ball = document.createElement('div');
        ball.classList.add('ball');
        if (selectedNumbers[i] !== undefined) {
            ball.innerText = selectedNumbers[i];
            ball.classList.add('user-selected');
        } else {
            ball.innerText = '-';
        }
        userBallsContainer.appendChild(ball);
    }
}

// 4. Generar jugada ganadora aleatoria sin repetición
function generateWinningNumbers() {
    const numbersPool = [];
    for (let i = 1; i <= TOTAL_NUMBERS; i++) {
        numbersPool.push(i);
    }

    const winners = [];
    for (let i = 0; i < REQUIRED_SELECTIONS; i++) {
        const randomIndex = Math.floor(Math.random() * numbersPool.length);
        const pulledNumber = numbersPool.splice(randomIndex, 1)[0];
        winners.push(pulledNumber);
    }
    
    return winners.sort((a, b) => a - b);
}

// 5. Evaluar los aciertos y asignar el premio exacto en Soles
function checkResults(userNumbers, winningNumbers) {
    const matches = userNumbers.filter(num => winningNumbers.includes(num));
    const hits = matches.length;

    let message = `<div style="font-size: 1.3rem; margin-bottom: 10px;">🎯 Lograste <strong>${hits} aciertos</strong></div>`;

    switch (hits) {
        case 3:
            message += "<span style='color: #27ae60; font-size: 1.2rem;'>🥉 <strong>¡Ganaste 15 Soles! Felicidades.</strong></span>";
            break;
        case 4:
            message += "<span style='color: #27ae60; font-size: 1.2rem;'>🥈 <strong>¡Ganaste 30 Soles! Felicidades.</strong></span>";
            break;
        case 5:
            message += "<span style='color: #e67e22; font-size: 1.2rem;'>🥇 <strong>¡Ganaste 70 Soles! Increíble.</strong></span>";
            break;
        case 6:
            message += "<span style='color: #d32f2f; font-size: 1.4rem; display: block;'>👑 <strong>¡Ganaste 100 Soles! Felicidades por ganar el premio mayor.</strong></span>";
            break;
        default:
            message += "<span style='color: #7f8c8d;'>❌ <strong>No ganaste. ¡Suerte para la próxima!</strong></span><br><small style='color: #95a5a6;'>Sorteo cerrado. Debes adquirir una nueva rifa.</small>";
            break;
    }

    prizeResult.innerHTML = message;
}

// 6. Aplicar congelamiento visual total de la interfaz
function aplicarBloqueoInterfaz() {
    btnDraw.disabled = true;
    btnDraw.innerText = "Sorteo Finalizado 🔒";
    btnDraw.style.boxShadow = "none";
    
    const allButtons = document.querySelectorAll('.btn-number');
    allButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });
}

// 7. Evento principal al presionar el botón de lanzar sorteo
btnDraw.addEventListener('click', () => {
    const winningNumbers = generateWinningNumbers();
    
    renderWinnerBalls(winningNumbers);
    checkResults(selectedNumbers, winningNumbers);
    resultsSection.style.display = 'block';
    aplicarBloqueoInterfaz();

    // Guardar el estado SOLO para la pestaña actual (sessionStorage)
    sessionStorage.setItem('rifa_finalizada', 'true');
    sessionStorage.setItem('numeros_usuario', JSON.stringify(selectedNumbers));
    sessionStorage.setItem('numeros_ganadores', JSON.stringify(winningNumbers));

    // ACTIVAR BLOQUEO DE ACTUALIZACIÓN DEL NAVEGADOR
    activarBloqueoRecarga();
});

function renderWinnerBalls(winningNumbers) {
    winnerBallsContainer.innerHTML = '';
    winningNumbers.forEach(num => {
        const ball = document.createElement('div');
        ball.classList.add('ball', 'winner-selected');
        ball.innerText = num;
        winnerBallsContainer.appendChild(ball);
    });
}

// =============================================================
// SECCIÓN DE BLOQUEO DE ACTUALIZACIÓN (ANTICUENTAS)
// =============================================================
function activarBloqueoRecarga() {
    // Bloquea el botón físico de recargar del navegador o cerrar pestaña accidentalmente
    window.onbeforeunload = function() {
        return "¡Sorteo finalizado! Si recargas o sales perderás el acceso a este boleto.";
    };

    // Bloquear combinación de teclas F5, Ctrl+R y Ctrl+Shift+R en el teclado
    window.addEventListener('keydown', function(e) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.shiftKey && e.key === 'R')) {
            e.preventDefault();
            alert("Acción bloqueada: No puedes actualizar la rifa después de jugar.");
        }
    });
}

// =============================================================
// VERIFICACIÓN INICIAL: Al cargar la página (F5)
// =============================================================
function verificarEstadoGuardado() {
    createBoard(); 

    // Si intenta forzar la recarga burlando el sistema, el navegador recuerda la sesión activa
    if (sessionStorage.getItem('rifa_finalizada') === 'true') {
        selectedNumbers = JSON.parse(sessionStorage.getItem('numeros_usuario'));
        const winningNumbers = JSON.parse(sessionStorage.getItem('numeros_ganadores'));

        selectedNumbers.forEach(num => {
            const btn = document.querySelector(`.btn-number[data-number='${num}']`);
            if (btn) btn.classList.add('active');
        });

        updateUserBalls();
        renderWinnerBalls(winningNumbers);
        checkResults(selectedNumbers, winningNumbers);
        resultsSection.style.display = 'block';
        aplicarBloqueoInterfaz();
        
        // Volver a amarrar los bloqueos de teclado
        activarBloqueoRecarga();
    }
}

// Arrancar la verificación
verificarEstadoGuardado();