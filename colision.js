const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Dimensiones de la pantalla
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

// Fondo combinado/pastel llamativo
canvas.style.background = "linear-gradient(135deg, #fffde7 0%, #fff59d 100%)";

// Variable global para el contador de objetos eliminados
let score = 0;

class Flower {
    constructor() {
        this.radius = Math.random() * 12 + 18; // Tamaños variados
        this.petalColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        this.centerColor = "#fbc02d";
        this.reset();
    }

    // Reinicia la posición en la parte superior (caída libre)
    reset() {
        this.posX = Math.random() * (window_width - this.radius * 2) + this.radius;
        this.posY = -this.radius - Math.random() * 100; // Inicia arriba del marco superior

        // Física de movimiento y gravedad
        this.vx = (Math.random() - 0.5) * 3; // Velocidad horizontal ligera
        
        // Determinar velocidad según el contador (Reglas de velocidad)
        let baseSpeed = 2 + Math.random() * 2;
        if (score > 20) {
            baseSpeed *= 2.2; // Velocidad alta
        } else if (score > 10) {
            baseSpeed *= 1.6; // Velocidad media
        }

        this.vy = baseSpeed;
        this.gravity = 0.25;      // Fuerza de gravedad
        this.bounce = 0.65;       // Pérdida de fuerza en cada rebote (peso)
        this.isBouncing = false;
    }

    // Dibujar diseño de Flor en lugar de un círculo simple
    draw(context) {
        context.save();
        context.translate(this.posX, this.posY);

        // Pétalos (6 pétalos alrededor del centro)
        context.fillStyle = this.petalColor;
        for (let i = 0; i < 6; i++) {
            let angle = (i * Math.PI) / 3;
            let px = Math.cos(angle) * (this.radius * 0.7);
            let py = Math.sin(angle) * (this.radius * 0.7);
            
            context.beginPath();
            context.arc(px, py, this.radius * 0.55, 0, Math.PI * 2);
            context.fill();
            context.closePath();
        }

        // Centro de la flor
        context.fillStyle = this.centerColor;
        context.beginPath();
        context.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = 1.5;
        context.strokeStyle = "#ffffff";
        context.stroke();
        context.closePath();

        context.restore();
    }

    update(context) {
        // Aplicar gravedad
        this.vy += this.gravity;

        // Actualizar coordenadas
        this.posX += this.vx;
        this.posY += this.vy;

        // Rebote en paredes laterales (izq/der)
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.vx = -this.vx;
        }

        // Rebote en el suelo (parábola con pérdida de fuerza)
        if (this.posY + this.radius >= window_height) {
            this.posY = window_height - this.radius; // Corregir posición
            this.vy = -this.vy * this.bounce;        // Invertir velocidad con pérdida
            this.vx *= 0.95;                         // Fricción horizontal
            this.isBouncing = true;

            // Si el rebote se vuelve insignificante, reaparece en la parte superior
            if (Math.abs(this.vy) < 1.2) {
                this.reset();
            }
        }

        this.draw(context);
    }

    // Comprobar si las coordenadas (mouseX, mouseY) están dentro del objeto
    isClicked(mouseX, mouseY) {
        let dx = mouseX - this.posX;
        let dy = mouseY - this.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius * 1.1; // Margen de toque cómodo
    }
}

// Mantenemos siempre exactamente 25 objetos
let flowers = [];
function generateFlowers(n) {
    flowers = [];
    for (let i = 0; i < n; i++) {
        flowers.push(new Flower());
    }
}

// Dibujar el marcador superior derecho "Eliminadas: X"
function drawUI(context) {
    const text = `Eliminadas: ${score}`;
    context.font = "bold 20px Arial";
    
    // Ancho del recuadro
    const textWidth = context.measureText(text).width;
    const padding = 15;
    const rectX = window_width - textWidth - padding * 2 - 20;
    const rectY = 15;

    // Fondo translúcido en la esquina superior derecha
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    context.strokeStyle = "#d4e157";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(rectX, rectY, textWidth + padding * 2, 40, 8);
    context.fill();
    context.stroke();

    // Texto del contador
    context.fillStyle = "#333333";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(text, rectX + padding, rectY + 20);
}

// Evento de clic izquierdo para detectar mouseX y mouseY
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Recorremos de atrás hacia adelante para eliminar la que está dibujada arriba
    for (let i = flowers.length - 1; i >= 0; i--) {
        if (flowers[i].isClicked(mouseX, mouseY)) {
            score++;               // Incrementar el contador
            flowers[i].reset();    // Reaparecer arriba (mantiene siempre 25 elementos)
            break;                 // Eliminar un solo objeto por clic
        }
    }
});

// Bucle principal de animación
function animate() {
    ctx.clearRect(0, 0, window_width, window_height);

    // Actualizar y dibujar las 25 flores
    flowers.forEach(flower => {
        flower.update(ctx);
    });

    // Dibujar el panel de puntuación
    drawUI(ctx);

    requestAnimationFrame(animate);
}

// Generar exactamente 25 flores e iniciar
generateFlowers(25);
animate();