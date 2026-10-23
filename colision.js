const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Dimensiones de la ventana
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
        this.originalColor = color; // Atributo POO: guarda el color original para restaurarlo tras flashear
        this.text = text;
        this.speed = speed;
        
        // Asignación de dirección con ángulo aleatorio
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

        // Actualizar posición X
        this.posX += this.dx;
        // Rebote en bordes X
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Actualizar posición Y
        this.posY += this.dy;
        // Rebote en bordes Y
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }
    }

    // Método POO: calcula la distancia entre los centros de dos círculos
    getDistance(other) {
        let xDistance = other.posX - this.posX;
        let yDistance = other.posY - this.posY;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    // Método POO: evalúa si existe colisión
    isColliding(other) {
        let distance = this.getDistance(other);
        return distance < (this.radius + other.radius);
    }

    // Método POO: resuelve la colisión con vectores (rebote en dirección opuesta al impacto y flasheo azul)
    resolveCollision(other) {
        // 1. Activar "flasheo" azul
        this.color = "#0000FF";
        other.color = "#0000FF";

        // 2. Vector normal entre los dos centros
        let dx = other.posX - this.posX;
        let dy = other.posY - this.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return; // Evita división entre cero

        // Vector unitario normal del impacto
        let nx = dx / distance;
        let ny = dy / distance;

        // Velocidad relativa
        let kx = this.dx - other.dx;
        let ky = this.dy - other.dy;

        // Producto punto entre la velocidad relativa y la normal
        let p = nx * kx + ny * ky;

        // Rebote: se invierten las componentes sobre la línea de impacto
        if (p > 0) {
            this.dx -= p * nx;
            this.dy -= p * ny;
            other.dx += p * nx;
            other.dy += p * ny;
        }

        // 3. Separación de traslape para evitar que queden atascados
        let overlap = (this.radius + other.radius) - distance;
        if (overlap > 0) {
            this.posX -= nx * (overlap / 2);
            this.posY -= ny * (overlap / 2);
            other.posX += nx * (overlap / 2);
            other.posY += ny * (overlap / 2);
        }
    }
}

// Array de almacenamiento
let circles = [];

// Función para generar 20 círculos sin que aparezcan colisionados desde el inicio
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let speed = Math.random() * 4 + 1;    // Velocidad entre 1 y 5 unidades
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        let text = `C${i + 1}`;

        let x, y, overlapping;

        // Intenta posicionar el círculo en una coordenada sin encimarse con los existentes
        do {
            overlapping = false;
            x = Math.random() * (window_width - radius * 2) + radius;
            y = Math.random() * (window_height - radius * 2) + radius;

            for (let j = 0; j < circles.length; j++) {
                let dx = x - circles[j].posX;
                let dy = y - circles[j].posY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < radius + circles[j].radius) {
                    overlapping = true;
                    break;
                }
            }
        } while (overlapping);

        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Bucle de animación
function animate() {
    ctx.clearRect(0, 0, window_width, window_height);

    // Restablecer el color original en cada fotograma antes de evaluar colisiones
    circles.forEach(circle => {
        circle.color = circle.originalColor;
    });

    // Detectar y resolver colisiones entre todos los pares
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].isColliding(circles[j])) {
                circles[i].resolveCollision(circles[j]);
            }
        }
    }

    // Dibujar y actualizar círculos
    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate);
}

// Inicialización de la versión 3.0
generateCircles(20);
animate();