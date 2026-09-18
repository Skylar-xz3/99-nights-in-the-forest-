// ==========================================
// 99 NOCHES EN EL BOSQUE
// V0.1 - MOTOR PRINCIPAL
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const juego = document.getElementById("juego");
const gameOverPantalla = document.getElementById("gameOver");

const botonJugar = document.getElementById("botonJugar");
const botonReiniciar = document.getElementById("reiniciar");

const vidaTexto = document.getElementById("vida");
const hambreTexto = document.getElementById("hambre");
const maderaTexto = document.getElementById("madera");
const nocheTexto = document.getElementById("numeroNoche");
const nocheFinalTexto = document.getElementById("nocheFinal");
const mensajeTexto = document.getElementById("mensaje");


// ==========================================
// CONFIGURACIÓN
// ==========================================

const MUNDO_ANCHO = 3000;
const MUNDO_ALTO = 3000;

let juegoActivo = false;

let teclas = {};

let ultimaHora = 0;

let noche = 1;

let tiempoDia = 0;

// Para probar rápido.
// Después haremos las noches más largas.
const DURACION_CICLO = 60;


// ==========================================
// JUGADOR
// ==========================================

const jugador = {

    x: MUNDO_ANCHO / 2,
    y: MUNDO_ALTO / 2 + 170,

    radio: 18,

    velocidad: 230,

    vida: 100,
    hambre: 100,

    madera: 0,

    direccionX: 0,
    direccionY: 1
};


// ==========================================
// FOGATA
// ==========================================

const fogata = {

    x: MUNDO_ANCHO / 2,
    y: MUNDO_ALTO / 2,

    combustible: 100,

    radioLuz: 270
};


// ==========================================
// CÁMARA
// ==========================================

const camara = {

    x: 0,
    y: 0

};


// ==========================================
// ÁRBOLES
// ==========================================

let arboles = [];

function generarArboles() {

    arboles = [];

    for (let i = 0; i < 180; i++) {

        let x;
        let y;
        let distanciaFogata;

        do {

            x = 80 + Math.random() * (MUNDO_ANCHO - 160);
            y = 80 + Math.random() * (MUNDO_ALTO - 160);

            distanciaFogata = Math.hypot(
                x - fogata.x,
                y - fogata.y
            );

        } while (distanciaFogata < 330);

        arboles.push({

            x: x,
            y: y,

            radio: 27,

            madera: 3,

            vivo: true
        });
    }
}


// ==========================================
// AJUSTAR CANVAS
// ==========================================

function ajustarCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", ajustarCanvas);

ajustarCanvas();


// ==========================================
// TECLADO
// ==========================================

window.addEventListener("keydown", function(event) {

    teclas[event.key.toLowerCase()] = true;


    // E = interactuar
    if (event.key.toLowerCase() === "e") {

        interactuar();

    }


    // F = alimentar fogata
    if (event.key.toLowerCase() === "f") {

        alimentarFogata();

    }

});


window.addEventListener("keyup", function(event) {

    teclas[event.key.toLowerCase()] = false;

});


// ==========================================
// INICIAR JUEGO
// ==========================================

botonJugar.addEventListener("click", iniciarJuego);

botonReiniciar.addEventListener("click", iniciarJuego);


function iniciarJuego() {

    menu.style.display = "none";

    gameOverPantalla.style.display = "none";

    juego.style.display = "block";


    jugador.x = MUNDO_ANCHO / 2;
    jugador.y = MUNDO_ALTO / 2 + 170;

    jugador.vida = 100;
    jugador.hambre = 100;
    jugador.madera = 0;


    fogata.combustible = 100;


    noche = 1;
    tiempoDia = 0;


    generarArboles();


    juegoActivo = true;

    ultimaHora = performance.now();


    mostrarMensaje(
        "Explora el bosque. E = recoger madera | F = alimentar fogata"
    );


    actualizarHUD();


    requestAnimationFrame(bucle);

}


// ==========================================
// BUCLE PRINCIPAL
// ==========================================

function bucle(tiempoActual) {

    if (!juegoActivo) {
        return;
    }


    let delta = (tiempoActual - ultimaHora) / 1000;

    ultimaHora = tiempoActual;


    // Evita saltos enormes si cambia de pestaña
    delta = Math.min(delta, 0.05);


    actualizar(delta);

    dibujar();


    requestAnimationFrame(bucle);

}


// ==========================================
// ACTUALIZACIÓN
// ==========================================

function actualizar(delta) {

    moverJugador(delta);

    actualizarCamara();

    actualizarSupervivencia(delta);

    actualizarCiclo(delta);

    actualizarHUD();


    if (jugador.vida <= 0) {

        terminarJuego();

    }

}


// ==========================================
// MOVIMIENTO
// ==========================================

function moverJugador(delta) {

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


    if (dx !== 0 || dy !== 0) {

        const longitud = Math.hypot(dx, dy);

        dx /= longitud;
        dy /= longitud;


        jugador.direccionX = dx;
        jugador.direccionY = dy;


        jugador.x += dx * jugador.velocidad * delta;

        jugador.y += dy * jugador.velocidad * delta;

    }


    jugador.x = Math.max(
        jugador.radio,
        Math.min(MUNDO_ANCHO - jugador.radio, jugador.x)
    );

    jugador.y = Math.max(
        jugador.radio,
        Math.min(MUNDO_ALTO - jugador.radio, jugador.y)
    );

}


// ==========================================
// CÁMARA
// ==========================================

function actualizarCamara() {

    camara.x =
        jugador.x - canvas.width / 2;

    camara.y =
        jugador.y - canvas.height / 2;


    camara.x = Math.max(
        0,
        Math.min(MUNDO_ANCHO - canvas.width, camara.x)
    );

    camara.y = Math.max(
        0,
        Math.min(MUNDO_ALTO - canvas.height, camara.y)
    );

}


// ==========================================
// SUPERVIVENCIA
// ==========================================

function actualizarSupervivencia(delta) {

    jugador.hambre -= 0.35 * delta;


    if (jugador.hambre <= 0) {

        jugador.hambre = 0;

        jugador.vida -= 4 * delta;

    }


    // La fogata se consume
    fogata.combustible -= 0.65 * delta;

    fogata.combustible =
        Math.max(0, fogata.combustible);

}


// ==========================================
// CICLO DÍA / NOCHE
// ==========================================

function actualizarCiclo(delta) {

    tiempoDia += delta;


    if (tiempoDia >= DURACION_CICLO) {

        tiempoDia = 0;

        noche++;


        if (noche > 99) {

            ganarJuego();

            return;

        }


        mostrarMensaje(
            "NOCHE " + noche + " — algo se mueve entre los árboles..."
        );

    }

}


// ==========================================
// INTERACTUAR
// ==========================================

function interactuar() {

    if (!juegoActivo) {
        return;
    }


    let arbolMasCercano = null;

    let distanciaMenor = 85;


    for (const arbol of arboles) {

        if (!arbol.vivo) {
            continue;
        }


        const distancia = Math.hypot(

            jugador.x - arbol.x,
            jugador.y - arbol.y

        );


        if (distancia < distanciaMenor) {

            distanciaMenor = distancia;

            arbolMasCercano = arbol;

        }

    }


    if (arbolMasCercano) {

        arbolMasCercano.madera--;


        mostrarMensaje(
            "Golpeaste el árbol..."
        );


        if (arbolMasCercano.madera <= 0) {

            arbolMasCercano.vivo = false;

            jugador.madera += 3;


            mostrarMensaje(
                "+3 madera"
            );

        }

    }

}


// ==========================================
// ALIMENTAR FOGATA
// ==========================================

function alimentarFogata() {

    if (!juegoActivo) {
        return;
    }


    const distancia = Math.hypot(

        jugador.x - fogata.x,
        jugador.y - fogata.y

    );


    if (distancia > 150) {

        mostrarMensaje(
            "Acércate a la fogata."
        );

        return;

    }


    if (jugador.madera <= 0) {

        mostrarMensaje(
            "No tienes madera."
        );

        return;

    }


    jugador.madera--;


    fogata.combustible =
        Math.min(100, fogata.combustible + 25);


    mostrarMensaje(
        "Añadiste madera a la fogata."
    );

}


// ==========================================
// HUD
// ==========================================

function actualizarHUD() {

    vidaTexto.textContent =
        Math.ceil(jugador.vida);

    hambreTexto.textContent =
        Math.ceil(jugador.hambre);

    maderaTexto.textContent =
        jugador.madera;

    nocheTexto.textContent =
        noche;

}


// ==========================================
// MENSAJES
// ==========================================

let temporizadorMensaje;

function mostrarMensaje(texto) {

    mensajeTexto.textContent = texto;

    mensajeTexto.style.opacity = "1";


    clearTimeout(temporizadorMensaje);


    temporizadorMensaje = setTimeout(function() {

        mensajeTexto.style.opacity = "0.35";

    }, 3000);

}


// ==========================================
// DIBUJAR MUNDO
// ==========================================

function dibujar() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    dibujarSuelo();

    dibujarFogata();

    dibujarArboles();

    dibujarJugador();

    dibujarOscuridad();

}


// ==========================================
// SUELO
// ==========================================

function dibujarSuelo() {

    ctx.fillStyle = "#182619";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // pequeñas manchas de pasto

    ctx.fillStyle = "#213421";


    const tamaño = 90;


    const inicioX =
        Math.floor(camara.x / tamaño) * tamaño;

    const inicioY =
        Math.floor(camara.y / tamaño) * tamaño;


    for (
        let x = inicioX;
        x < camara.x + canvas.width + tamaño;
        x += tamaño
    ) {

        for (
            let y = inicioY;
            y < camara.y + canvas.height + tamaño;
            y += tamaño
        ) {

            ctx.beginPath();

            ctx.arc(
                x - camara.x,
                y - camara.y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

}


// ==========================================
// ÁRBOLES
// ==========================================

function dibujarArboles() {

    for (const arbol of arboles) {

        if (!arbol.vivo) {
            continue;
        }


        const x =
            arbol.x - camara.x;

        const y =
            arbol.y - camara.y;


        if (
            x < -80 ||
            y < -100 ||
            x > canvas.width + 80 ||
            y > canvas.height + 100
        ) {
            continue;
        }


        // sombra

        ctx.fillStyle =
            "rgba(0,0,0,0.28)";

        ctx.beginPath();

        ctx.ellipse(
            x + 8,
            y + 22,
            28,
            13,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // tronco

        ctx.fillStyle = "#5a3c25";

        ctx.fillRect(
            x - 7,
            y - 4,
            14,
            42
        );


        // copa inferior

        ctx.fillStyle = "#183b25";

        ctx.beginPath();

        ctx.moveTo(x, y - 70);

        ctx.lineTo(x - 35, y + 10);

        ctx.lineTo(x + 35, y + 10);

        ctx.closePath();

        ctx.fill();


        // copa superior

        ctx.fillStyle = "#245332";

        ctx.beginPath();

        ctx.moveTo(x, y - 95);

        ctx.lineTo(x - 29, y - 25);

        ctx.lineTo(x + 29, y - 25);

        ctx.closePath();

        ctx.fill();

    }

}


// ==========================================
// FOGATA
// ==========================================

function dibujarFogata() {

    const x =
        fogata.x - camara.x;

    const y =
        fogata.y - camara.y;


    // brillo

    const brillo = ctx.createRadialGradient(

        x,
        y,
        10,

        x,
        y,
        150

    );


    brillo.addColorStop(
        0,
        "rgba(255,170,70,0.38)"
    );

    brillo.addColorStop(
        1,
        "rgba(255,120,30,0)"
    );


    ctx.fillStyle = brillo;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        150,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // troncos

    ctx.strokeStyle = "#5c3921";

    ctx.lineWidth = 9;


    ctx.beginPath();

    ctx.moveTo(x - 20, y + 15);

    ctx.lineTo(x + 20, y - 5);

    ctx.moveTo(x + 20, y + 15);

    ctx.lineTo(x - 20, y - 5);

    ctx.stroke();


    if (fogata.combustible > 0) {

        // llama exterior

        ctx.fillStyle = "#ff7a22";

        ctx.beginPath();

        ctx.moveTo(x, y - 48);

        ctx.quadraticCurveTo(
            x + 30,
            y - 5,
            x,
            y + 10
        );

        ctx.quadraticCurveTo(
            x - 30,
            y - 5,
            x,
            y - 48
        );

        ctx.fill();


        // llama interior

        ctx.fillStyle = "#ffd166";

        ctx.beginPath();

        ctx.moveTo(x, y - 28);

        ctx.quadraticCurveTo(
            x + 15,
            y,
            x,
            y + 8
        );

        ctx.quadraticCurveTo(
            x - 15,
            y,
            x,
            y - 28
        );

        ctx.fill();

    }

}


// ==========================================
// JUGADOR
// ==========================================

function dibujarJugador() {

    const x =
        jugador.x - camara.x;

    const y =
        jugador.y - camara.y;


    // sombra

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 19,
        17,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // cuerpo

    ctx.fillStyle = "#496a80";

    ctx.fillRect(
        x - 12,
        y - 12,
        24,
        31
    );


    // cabeza

    ctx.fillStyle = "#d7b08b";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 23,
        12,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // mochila

    ctx.fillStyle = "#4b3826";

    ctx.fillRect(
        x - 16,
        y - 8,
        7,
        22
    );

}


// ==========================================
// OSCURIDAD
// ==========================================

function dibujarOscuridad() {

    const progreso =
        tiempoDia / DURACION_CICLO;


    // Oscurece gradualmente
    const oscuridad =
        0.35 + progreso * 0.42;


    ctx.save();


    ctx.fillStyle =
        `rgba(3, 7, 8, ${oscuridad})`;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Luz alrededor de la fogata

    if (fogata.combustible > 0) {

        const x =
            fogata.x - camara.x;

        const y =
            fogata.y - camara.y;


        ctx.globalCompositeOperation =
            "destination-out";


        const luz =
            ctx.createRadialGradient(

                x,
                y,
                40,

                x,
                y,
                fogata.radioLuz

            );


        luz.addColorStop(
            0,
            "rgba(0,0,0,0.9)"
        );

        luz.addColorStop(
            0.55,
            "rgba(0,0,0,0.55)"
        );

        luz.addColorStop(
            1,
            "rgba(0,0,0,0)"
       
