const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color; // Guarda el color original
        this.text = text;
        this.speed = speed;
        
        // Dirección inicial aleatoria en X e Y (-1 o 1)
        let angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);

        // Actualizar la posición X
        this.posX += this.dx;
        // Cambiar la dirección si el círculo llega al borde del canvas en X
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar la posición Y
        this.posY += this.dy;
        // Cambiar la dirección si el círculo llega al borde del canvas en Y
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }

    // Método para calcular la distancia entre los centros de dos círculos
    getDistance(other) {
        let xDistance = other.posX - this.posX;
        let yDistance = other.posY - this.posY;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    // Método que verifica si existe colisión con otro círculo
    isColliding(other) {
        let distance = this.getDistance(other);
        return distance < (this.radius + other.radius);
    }

    // Método para manejar la respuesta a la colisión (rebote y cambio de color)
    resolveCollision(other) {
        // 1. Cambiar a color azul temporalmente por el impacto ("flasheo")
        this.color = "#0000FF";
        other.color = "#0000FF";

        // 2. Intercambiar las velocidades/direcciones para rebotar opuestamente
        let tempDx = this.dx;
        let tempDy = this.dy;
        this.dx = other.dx;
        this.dy = other.dy;
        other.dx = tempDx;
        other.dy = tempDy;

        // 3. Corregir superposición de los círculos para evitar que se "psequence/atoren"
        let distance = this.getDistance(other);
        let overlap = (this.radius + other.radius) - distance;
        
        if (overlap > 0 && distance > 0) {
            let dx = (other.posX - this.posX) / distance;
            let dy = (other.posY - this.posY) / distance;

            // Separar ambos círculos la mitad de la distancia traslapada
            this.posX -= dx * (overlap / 2);
            this.posY -= dy * (overlap / 2);
            other.posX += dx * (overlap / 2);
            other.posY += dy * (overlap / 2);
        }
    }
}

// Array para almacenar N círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5 unidades
        let text = `C${i + 1}`; // Etiqueta del círculo
        
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas

    // Restablecer los círculos a su color original en cada fotograma
    circles.forEach(circle => {
        circle.color = circle.originalColor;
    });

    // Detectar colisiones entre cada par de círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].isColliding(circles[j])) {
                // Resolver el rebote y activar el flasheo azul
                circles[i].resolveCollision(circles[j]);
            }
        }
    }

    // Dibujar y actualizar la posición de todos los círculos
    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate); // Repetir animación
}

// Generar 20 círculos y comenzar la animación
generateCircles(20);
animate();