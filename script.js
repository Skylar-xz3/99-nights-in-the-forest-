// ==========================================
// 99 NOCHES EN EL BOSQUE
// V0.1
// ==========================================


// ==========================================
// ELEMENTOS HTML
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
// CONFIGURACIÓN DEL MUNDO
// ==========================================

const MUNDO_ANCHO = 3000;
const MUNDO_ALTO = 3000;

// Cada ciclo dura 60 segundos por ahora.
// Luego podemos cambiarlo.
const DURACION_CICLO = 60;

let juegoActivo = false;
let teclas = {};

let ultimaHora = 0;

let noche = 1;
let tiempoDia = 0;

let temporizadorMensaje;


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

    radioLuz: 280

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

            resistencia: 3,

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


window.addEventListener(
    "resize",
    ajustarCanvas
);


ajustarCanvas();


// ==========================================
// TECLADO
// ==========================================

window.addEventListener(
    "keydown",
    function (event) {

        const tecla = event.key.toLowerCase();

        teclas[tecla] = true;


        if (
            tecla === "arrowup" ||
            tecla === "arrowdown" ||
            tecla === "arrowleft" ||
            tecla === "arrowright"
        ) {

            event.preventDefault();

        }


        // E = golpear / recoger árbol

        if (
            tecla === "e" &&
            !event.repeat
        ) {

            interactuar();

        }


        // F = poner madera en fogata

        if (
            tecla === "f" &&
            !event.repeat
        ) {

            alimentarFogata();

        }

    }
);


window.addEventListener(
    "keyup",
    function (event) {

        teclas[event.key.toLowerCase()] = false;

    }
);


// ==========================================
// BOTONES
// ==========================================

botonJugar.addEventListener(
    "click",
    iniciarJuego
);


botonReiniciar.addEventListener(
    "click",
    iniciarJuego
);


// ==========================================
// INICIAR JUEGO
// ==========================================

function iniciarJuego() {

    menu.style.display = "none";

    gameOverPantalla.style.display = "none";

    juego.style.display = "block";


    // Restaurar texto de Game Over

    const tituloGameOver =
        document.querySelector(
            ".game-over-contenido h1"
        );

    const textoGameOver =
        document.querySelector(
            ".game-over-contenido p:first-child"
        );


    tituloGameOver.textContent =
        "GAME OVER";

    tituloGameOver.style.color =
        "#b74646";

    textoGameOver.textContent =
        "EL BOSQUE TE ATRAPÓ";


    // Reiniciar jugador

    jugador.x =
        MUNDO_ANCHO / 2;

    jugador.y =
        MUNDO_ALTO / 2 + 170;

    jugador.vida = 100;

    jugador.hambre = 100;

    jugador.madera = 0;


    // Reiniciar fogata

    fogata.combustible = 100;


    // Reiniciar tiempo

    noche = 1;

    tiempoDia = 0;


    // Crear bosque nuevo

    generarArboles();


    juegoActivo = true;

    ultimaHora =
        performance.now();


    actualizarCamara();

    actualizarHUD();


    mostrarMensaje(
        "WASD = moverte | E = cortar árbol | F = alimentar fogata"
    );


    requestAnimationFrame(
        bucle
    );

}


// ==========================================
// BUCLE PRINCIPAL
// ==========================================

function bucle(tiempoActual) {

    if (!juegoActivo) {

        return;

    }


    let delta =
        (tiempoActual - ultimaHora) / 1000;


    ultimaHora =
        tiempoActual;


    // Evita saltos enormes al cambiar de pestaña

    delta =
        Math.min(delta, 0.05);


    actualizar(delta);

    dibujar();


    requestAnimationFrame(
        bucle
    );

}


// ==========================================
// ACTUALIZAR JUEGO
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


    if (
        teclas["w"] ||
        teclas["arrowup"]
    ) {

        dy -= 1;

    }


    if (
        teclas["s"] ||
        teclas["arrowdown"]
    ) {

        dy += 1;

    }


    if (
        teclas["a"] ||
        teclas["arrowleft"]
    ) {

        dx -= 1;

    }


    if (
        teclas["d"] ||
        teclas["arrowright"]
    ) {

        dx += 1;

    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const longitud =
            Math.hypot(dx, dy);


        dx /= longitud;
        dy /= longitud;


        jugador.direccionX = dx;
        jugador.direccionY = dy;


        jugador.x +=
            dx *
            jugador.velocidad *
            delta;


        jugador.y +=
            dy *
            jugador.velocidad *
            delta;

    }


    // Límites del mapa

    jugador.x =
        Math.max(
            jugador.radio,
            Math.min(
                MUNDO_ANCHO - jugador.radio,
                jugador.x
            )
        );


    jugador.y =
        Math.max(
            jugador.radio,
            Math.min(
                MUNDO_ALTO - jugador.radio,
                jugador.y
            )
        );

}


// ==========================================
// CÁMARA
// ==========================================

function actualizarCamara() {

    camara.x =
        jugador.x -
        canvas.width / 2;


    camara.y =
        jugador.y -
        canvas.height / 2;


    const maxX =
        Math.max(
            0,
            MUNDO_ANCHO - canvas.width
        );


    const maxY =
        Math.max(
            0,
            MUNDO_ALTO - canvas.height
        );


    camara.x =
        Math.max(
            0,
            Math.min(
                maxX,
                camara.x
            )
        );


    camara.y =
        Math.max(
            0,
            Math.min(
                maxY,
                camara.y
            )
        );

}


// ==========================================
// SUPERVIVENCIA
// ==========================================

function actualizarSupervivencia(delta) {

    // Hambre baja lentamente

    jugador.hambre -=
        0.35 * delta;


    if (jugador.hambre <= 0) {

        jugador.hambre = 0;

        jugador.vida -=
            4 * delta;

    }


    // La fogata pierde combustible

    fogata.combustible -=
        0.65 * delta;


    fogata.combustible =
        Math.max(
            0,
            fogata.combustible
        );

}


// ==========================================
// CICLO DE NOCHES
// ==========================================

function actualizarCiclo(delta) {

    tiempoDia += delta;


    if (
        tiempoDia >= DURACION_CICLO
    ) {

        tiempoDia = 0;

        noche++;


        if (noche > 99) {

            ganarJuego();

            return;

        }


        mostrarMensaje(
            "NOCHE " +
            noche +
            " — algo se mueve entre los árboles..."
        );

    }

}


// ==========================================
// INTERACTUAR CON ÁRBOLES
// ==========================================

function interactuar() {

    if (!juegoActivo) {

        return;

    }


    let arbolMasCercano = null;

    let distanciaMenor = 90;


    for (
        const arbol of arboles
    ) {

        if (!arbol.vivo) {

            continue;

        }


        const distancia =
            Math.hypot(

                jugador.x - arbol.x,
                jugador.y - arbol.y

            );


        if (
            distancia < distanciaMenor
        ) {

            distanciaMenor =
                distancia;

            arbolMasCercano =
                arbol;

        }

    }


    if (!arbolMasCercano) {

        mostrarMensaje(
            "No hay ningún árbol suficientemente cerca."
        );

        return;

    }


    arbolMasCercano.resistencia--;


    mostrarMensaje(
        "Golpeaste el árbol."
    );


    if (
        arbolMasCercano.resistencia <= 0
    ) {

        arbolMasCercano.vivo =
            false;


        jugador.madera += 3;


        mostrarMensaje(
            "Árbol cortado: +3 madera"
        );

    }

}


// ==========================================
// ALIMENTAR FOGATA
// ==========================================

function alimentarFogata() {

    if (!juegoActivo) {

        return;

    }


    const distancia =
        Math.hypot(

            jugador.x - fogata.x,
            jugador.y - fogata.y

        );


    if (distancia > 150) {

        mostrarMensaje(
            "Acércate más a la fogata."
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
        Math.min(
            100,
            fogata.combustible + 25
        );


    mostrarMensaje(
        "Añadiste madera a la fogata."
    );

}


// ==========================================
// HUD
// ==========================================

function actualizarHUD() {

    vidaTexto.textContent =
        Math.max(
            0,
            Math.ceil(jugador.vida)
        );


    hambreTexto.textContent =
        Math.max(
            0,
            Math.ceil(jugador.hambre)
        );


    maderaTexto.textContent =
        jugador.madera;


    nocheTexto.textContent =
        noche;

}


// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(texto) {

    mensajeTexto.textContent =
        texto;


    mensajeTexto.style.opacity =
        "1";


    clearTimeout(
        temporizadorMensaje
    );


    temporizadorMensaje =
        setTimeout(
            function () {

                mensajeTexto.style.opacity =
                    "0.4";

            },
            3000
        );

}


// ==========================================
// DIBUJAR TODO
// ==========================================

function dibujar() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    dibujarSuelo();

    dibujarLimites();

    dibujarFogata();

    dibujarArboles();

    dibujarJugador();

    dibujarOscuridad();

    dibujarIndicadorFogata();

}


// ==========================================
// SUELO
// ==========================================

function dibujarSuelo() {

    ctx.fillStyle =
        "#182619";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Patrón de pasto

    ctx.fillStyle =
        "#213421";


    const tamaño =
        90;


    const inicioX =
        Math.floor(
            camara.x / tamaño
        ) * tamaño;


    const inicioY =
        Math.floor(
            camara.y / tamaño
        ) * tamaño;


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
// LÍMITES DEL BOSQUE
// ==========================================

function dibujarLimites() {

    const izquierda =
        -camara.x;

    const arriba =
        -camara.y;


    ctx.strokeStyle =
        "#334b35";


    ctx.lineWidth =
        8;


    ctx.strokeRect(

        izquierda,
        arriba,

        MUNDO_ANCHO,
        MUNDO_ALTO

    );

}


// ==========================================
// ÁRBOLES
// ==========================================

function dibujarArboles() {

    for (
        const arbol of arboles
    ) {

        if (!arbol.vivo) {

            continue;

        }


        const x =
            arbol.x -
            camara.x;


        const y =
            arbol.y -
            camara.y;


        if (
            x < -80 ||
            y < -120 ||
            x > canvas.width + 80 ||
            y > canvas.height + 120
        ) {

            continue;

        }


        // Sombra

        ctx.fillStyle =
            "rgba(0,0,0,0.30)";


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


        // Tronco

        ctx.fillStyle =
            "#5a3c25";


        ctx.fillRect(

            x - 7,
            y - 4,

            14,
            42

        );


        // Copa inferior

        ctx.fillStyle =
            "#183b25";


        ctx.beginPath();


        ctx.moveTo(
            x,
            y - 70
        );


        ctx.lineTo(
            x - 35,
            y + 10
        );


        ctx.lineTo(
            x + 35,
            y + 10
        );


        ctx.closePath();

        ctx.fill();


        // Copa superior

        ctx.fillStyle =
            "#245332";


        ctx.beginPath();


        ctx.moveTo(
            x,
            y - 95
        );


        ctx.lineTo(
            x - 29,
            y - 25
        );


        ctx.lineTo(
            x + 29,
            y - 25
        );


        ctx.closePath();

        ctx.fill();

    }

}


// ==========================================
// FOGATA
// ==========================================

function dibujarFogata() {

    const x =
        fogata.x -
        camara.x;


    const y =
        fogata.y -
        camara.y;


    // Brillo de la fogata

    if (
        fogata.combustible > 0
    ) {

        const brillo =
            ctx.createRadialGradient(

                x,
                y,

                10,

                x,
                y,

                160

            );


        brillo.addColorStop(
            0,
            "rgba(255,170,70,0.40)"
        );


        brillo.addColorStop(
            1,
            "rgba(255,120,30,0)"
        );


        ctx.fillStyle =
            brillo;


        ctx.beginPath();


        ctx.arc(

            x,
            y,

            160,

            0,
            Math.PI * 2

        );


        ctx.fill();

    }


    // Troncos

    ctx.strokeStyle =
        "#5c3921";


    ctx.lineWidth =
        9;


    ctx.beginPath();


    ctx.moveTo(
        x - 20,
        y + 15
    );


    ctx.lineTo(
        x + 20,
        y - 5
    );


    ctx.moveTo(
        x + 20,
        y + 15
    );


    ctx.lineTo(
        x - 20,
        y - 5
    );


    ctx.stroke();


    if (
        fogata.combustible <= 0
    ) {

        // Fogata apagada

        ctx.fillStyle =
            "#5a5a5a";


        ctx.beginPath();


        ctx.arc(
            x,
            y - 3,
            7,
            0,
            Math.PI * 2
        );


        ctx.fill();


        return;
