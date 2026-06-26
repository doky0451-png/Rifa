// Configuración del juego
const TOTAL_NUMBERS = 50; 
const REQUIRED_SELECTIONS = 6; 

let selectedNumbers = [];

// Elementos de la interfaz
const board = document.getElementById('board');
const userBallsContainer = document.getElementById('user-balls');
const btnDraw = document.getElementById('btn-draw');
const resultsSection = document.getElementById('results');
const winnerBallsContainer = document.getElementById('winner-balls');
const prizeResult = document.getElementById('prize-result');

// 1. Generar el tablero interactivo de 50 números
function createBoard() {
    if (!board) return; // Seguridad si el elemento no carga
    board.innerHTML = ''; // Limpiar antes de crear
    for (let i = 1; i <= TOTAL_NUMBERS; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('btn-number');
        button.setAttribute('data-number', i); 
        button.addEventListener('click', () => handleNumberClick(i, button));
        board.appendChild(button);
    }
}

// 2. Gestionar la selección del jugador
function handleNumberClick(number, button) {
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
    
    if (btnDraw) {
        btnDraw.disabled = selectedNumbers.length !== REQUIRED_SELECTIONS;
    }
}

// 3. Actualizar esferas del usuario
function updateUserBalls() {
    if (!userBallsContainer) return;
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

// 4. Generar jugada ganadora
function generateWinningNumbers() {
    const numbersPool = Array.from({length: TOTAL_NUMBERS}, (_, i) => i + 1);
    const winners = [];
    for (let i = 0; i < REQUIRED_SELECTIONS; i++) {
        const randomIndex = Math.floor(Math.random() * numbersPool.length);
        winners.push(numbersPool.splice(randomIndex, 1)[0]);
    }
    return winners.sort((a, b) => a - b);
}

// 5. Evaluar los aciertos en Soles
function checkResults(userNumbers, winningNumbers) {
    const matches = userNumbers.filter(num => winningNumbers.includes(num));
    const hits = matches.length;

    let message = `<div style="font-size: 1.3rem; margin-bottom: 10px;">🎯 Lograste <strong>${hits} aciertos</strong></div>`;

    switch (hits) {
        case 3: message += "<span style='color: #27ae60;'><b>¡Ganaste 15 Soles!</b></span>"; break;
        case 4: message += "<span style='color: #27ae60;'><b>¡Ganaste 30 Soles!</b></span>"; break;
        case 5: message += "<span style='color: #e67e22;'><b>¡Ganaste 70 Soles!</b></span>"; break;
        case 6: message += "<span style='color: #d32f2f; font-size: 1.3rem;'><b>👑 ¡Ganaste 100 Soles! Premio Mayor.</b></span>"; break;
        default: message += "<span style='color: #7f8c8d;'>❌ No ganaste. ¡Suerte para la próxima!</span>"; break;
    }
    if (prizeResult) prizeResult.innerHTML = message;
}

// 6. Aplicar congelamiento de interfaz
function aplicarBloqueoInterfaz() {
    if (btnDraw) {
        btnDraw.disabled = true;
        btnDraw.innerText = "Sorteo Finalizado 🔒";
    }
    document.querySelectorAll('.btn-number').forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.6';
    });
}

// 7. Evento del botón de lanzar sorteo
if (btnDraw) {
    btnDraw.addEventListener('click', () => {
        const winningNumbers = generateWinningNumbers();
        
        renderWinnerBalls(winningNumbers);
        checkResults(selectedNumbers, winningNumbers);
        if (resultsSection) resultsSection.style.display = 'block';
        aplicarBloqueoInterfaz();

        sessionStorage.setItem('rifa_finalizada', 'true');
        sessionStorage.setItem('numeros_usuario', JSON.stringify(selectedNumbers));
        sessionStorage.setItem('numeros_ganadores', JSON.stringify(winningNumbers));

        activarBloqueoRecarga();
    });
}

function renderWinnerBalls(winningNumbers) {
    if (!winnerBallsContainer) return;
    winnerBallsContainer.innerHTML = '';
    winningNumbers.forEach(num => {
        const ball = document.createElement('div');
        ball.classList.add('ball', 'winner-selected');
        ball.innerText = num;
        winnerBallsContainer.appendChild(ball);
    });
}

// Bloqueo de recarga seguro
function activarBloqueoRecarga() {
    window.onbeforeunload = function() {
        return "¡Sorteo finalizado!";
    };
    window.addEventListener('keydown', function(e) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.shiftKey && e.key === 'R')) {
            e.preventDefault();
        }
    });
}

// Inicialización limpia de la página
document.addEventListener("DOMContentLoaded", () => {
    createBoard(); 

    if (sessionStorage.getItem('rifa_finalizada') === 'true') {
        selectedNumbers = JSON.parse(sessionStorage.getItem('numeros_usuario')) || [];
        const winningNumbers = JSON.parse(sessionStorage.getItem('numeros_ganadores')) || [];

        selectedNumbers.forEach(num => {
            const btn = document.querySelector(`.btn-number[data-number='${num}']`);
            if (btn) btn.classList.add('active');
        });

        updateUserBalls();
        renderWinnerBalls(winningNumbers);
        checkResults(selectedNumbers, winningNumbers);
        if (resultsSection) resultsSection.style.display = 'block';
        aplicarBloqueoInterfaz();
        activarBloqueoRecarga();
    }
});