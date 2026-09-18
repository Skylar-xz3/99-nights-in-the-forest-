const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const juego = document.getElementById("juego");
const gameOver = document.getElementById("gameOver");

const botonJugar = document.getElementById("botonJugar");
const botonReiniciar = document.getElementById("reiniciar");

const vidaTexto = document.getElementById("vida");
const hambreTexto = document.getElementById("hambre");
const maderaTexto = document.getElementById("madera");
const nocheTexto = document.getElementById("numeroNoche");
const mensaje = document.getElementById("mensaje");

let jugando = false;
let teclas = {};

const mundo = {
    ancho: 3000,
    alto: 3000
};

const jugador = {
    x: 1500,
    y: 1650,
    radio: 18,
    velocidad: 4,
    vida: 100,
    hambre: 100,
    madera: 0
};

const fogata = {
    x: 1500,
    y: 1500
};

const camara = {
    x: 0,
    y: 0
};

let arboles = [];


// ===============================
// CANVAS
// ===============================

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", ajustarCanvas);

ajustarCanvas();


// ===============================
// CREAR BOSQUE
// ===============================

function crearBosque() {

    arboles = [];

    for (let i = 0; i < 150; i++) {

        let x;
        let y;
        let distancia;

        do {

            x = Math.random() * mundo.ancho;
            y = Math.random() * mundo.alto;

            distancia = Math.hypot(
                x - fogata.x,
                y - fogata.y
            );

        } while (distancia < 300);

        arboles.push({
            x: x,
            y: y
        });
    }
}


// ===============================
// BOTÓN JUGAR
// ===============================

botonJugar.addEventListener("click", function () {

    menu.style.display = "none";
    gameOver.style.display = "none";
    juego.style.display = "block";

    jugando = true;

    jugador.x = 1500;
    jugador.y = 1650;

    crearBosque();

    actualizarHUD();

    requestAnimationFrame(bucle);

});


// ===============================
// REINICIAR
// ===============================

botonReiniciar.addEventListener("click", function () {

    location.reload();

});


// ===============================
// TECLADO
// ===============================

window.addEventListener("keydown", function (evento) {

    teclas[evento.key.toLowerCase()] = true;

});


window.addEventListener("keyup", function (evento) {

    teclas[evento.key.toLowerCase()] = false;

});


// ===============================
// MOVIMIENTO
// ===============================

function moverJugador() {

    let dx = 0;
    let dy = 0;

    if (teclas["w"] || teclas["arrowup"]) {
        dy -= 1;
    }

    if (teclas["s"] || teclas["arrowdown"]) {
        dy += 1;
    }

    if (teclas["a"] || teclas["arrowleft"]) {
        dx -= 1;
    }

    if (teclas["d"] || teclas["arrowright"]) {
        dx += 1;
    }

    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    jugador.x += dx * jugador.velocidad;
    jugador.y += dy * jugador.velocidad;

    jugador.x = Math.max(
        20,
        Math.min(mundo.ancho - 20, jugador.x)
    );

    jugador.y = Math.max(
        20,
        Math.min(mundo.alto - 20, jugador.y)
    );
}


// ===============================
// CÁMARA
// ===============================

function actualizarCamara() {

    camara.x =
        jugador.x - canvas.width / 2;

    camara.y =
        jugador.y - canvas.height / 2;

}


// ===============================
// HUD
// ===============================

function actualizarHUD() {

    vidaTexto.textContent = jugador.vida;
    hambreTexto.textContent = jugador.hambre;
    maderaTexto.textContent = jugador.madera;
    nocheTexto.textContent = 1;

}


// ===============================
// DIBUJAR SUELO
// ===============================

function dibujarSuelo() {

    ctx.fillStyle = "#172519";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // pequeñas plantas

    ctx.fillStyle = "#263b28";

    for (let x = 0; x < canvas.width; x += 80) {

        for (let y = 0; y < canvas.height; y += 80) {

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }
}


// ===============================
// DIBUJAR ÁRBOLES
// ===============================

function dibujarArboles() {

    for (const arbol of arboles) {

        const x = arbol.x - camara.x;
        const y = arbol.y - camara.y;

        if (
            x < -80 ||
            y < -100 ||
            x > canvas.width + 80 ||
            y > canvas.height + 100
        ) {
            continue;
        }


        // sombra

        ctx.fillStyle = "rgba(0,0,0,0.35)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 22,
            25,
            10,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // tronco

        ctx.fillStyle = "#604127";

        ctx.fillRect(
            x - 7,
            y,
            14,
            35
        );


        // copa inferior

        ctx.fillStyle = "#173c24";

        ctx.beginPath();

        ctx.moveTo(x, y - 75);
        ctx.lineTo(x - 35, y + 10);
        ctx.lineTo(x + 35, y + 10);

        ctx.closePath();

        ctx.fill();


        // copa superior

        ctx.fillStyle = "#255632";

        ctx.beginPath();

        ctx.moveTo(x, y - 100);
        ctx.lineTo(x - 28, y - 30);
        ctx.lineTo(x + 28, y - 30);

        ctx.closePath();

        ctx.fill();
    }
}


// ===============================
// DIBUJAR FOGATA
// ===============================

function dibujarFogata() {

    const x = fogata.x - camara.x;
    const y = fogata.y - camara.y;


    // luz

    const luz = ctx.createRadialGradient(
        x,
        y,
        10,
        x,
        y,
        160
    );

    luz.addColorStop(
        0,
        "rgba(255,160,50,0.4)"
    );

    luz.addColorStop(
        1,
        "rgba(255,100,20,0)"
    );

    ctx.fillStyle = luz;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        160,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // madera

    ctx.strokeStyle = "#6b4527";
    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(
        x - 18,
        y + 10
    );

    ctx.lineTo(
        x + 18,
        y - 5
    );

    ctx.moveTo(
        x + 18,
        y + 10
    );

    ctx.lineTo(
        x - 18,
        y - 5
    );

    ctx.stroke();


    // llama roja

    ctx.fillStyle = "#ff6b20";

    ctx.beginPath();

    ctx.moveTo(
        x,
        y - 45
    );

    ctx.quadraticCurveTo(
        x + 28,
        y - 5,
        x,
        y + 8
    );

    ctx.quadraticCurveTo(
        x - 28,
        y - 5,
        x,
        y - 45
    );

    ctx.fill();


    // llama amarilla

    ctx.fillStyle = "#ffd45c";

    ctx.beginPath();

    ctx.moveTo(
        x,
        y - 28
    );

    ctx.quadraticCurveTo(
        x + 14,
        y,
        x,
        y + 5
    );

    ctx.quadraticCurveTo(
        x - 14,
        y,
        x,
        y - 28
    );

    ctx.fill();
}


// ===============================
// DIBUJAR JUGADOR
// ===============================

function dibujarJugador() {

    const x = jugador.x - camara.x;
    const y = jugador.y - camara.y;


    // sombra

    ctx.fillStyle = "rgba(0,0,0,0.4)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 22,
        16,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // piernas

    ctx.fillStyle = "#252d33";

    ctx.fillRect(
        x - 10,
        y + 7,
        8,
        20
    );

    ctx.fillRect(
        x + 2,
        y + 7,
        8,
        20
    );


    // cuerpo

    ctx.fillStyle = "#4e7288";

    ctx.fillRect(
        x - 14,
        y - 17,
        28,
        29
    );


    // cabeza

    ctx.fillStyle = "#d9ae87";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 29,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // cabello

    ctx.fillStyle = "#35261d";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 33,
        13,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // mochila

    ctx.fillStyle = "#5b4028";

    ctx.fillRect(
        x - 18,
        y - 10,
        6,
        20
    );
}


// ===============================
// OSCURIDAD
// ===============================

function dibujarOscuridad() {

    ctx.fillStyle =
        "rgba(2, 7, 5, 0.28)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


// ===============================
// DIBUJAR TODO
// ===============================

function dibujar() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    dibujarSuelo();

    dibujarArboles();

    dibujarFogata();

    dibujarJugador();

    dibujarOscuridad();
}


// ===============================
// BUCLE DEL JUEGO
// ===============================

function bucle() {

    if (!jugando) {
        return;
    }

    moverJugador();

    actualizarCamara();

    dibujar();

    requestAnimationFrame(bucle);
}


// ===============================
// MENSAJE INICIAL
// ===============================

mensaje.textContent =
    "Explora el bosque con WASD";
