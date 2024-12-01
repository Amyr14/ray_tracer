import * as linear_alg from "./linear_alg.js";

const WIDTH = 500;
const HEIGHT = 500;
const FOCAL_LENGTH = 30;
const MAX_STEPS = 10;
const LIGHTS = []
const FOCAL_POINT = [0, 0, 0]

function cast_ray(start, direction, steps) {

    // Verificar se existe sombra
        // Se sim, retornar preto
        // Se não, prosseguir para o próximo passo
    
    // Verificar se o raio intersecta um objeto
        // Se sim, calcular iluminação nesse ponto
        // Se não, retornar a cor preta
    
    // Castar raio de reflexão e somar suas contribuições
    // Retornar a cor
}

// Calcula e casta raios para cada pixel da câmera
function calculate_light() {
    const pixels = Array(HEIGHT).fill(Array(WIDTH).fill([0, 0, 0]));
    
    for(let i = 0; i < HEIGHT; i++) {
        for(let j = 0; j < WIDTH; j++) {

            // Coordenadas dos pixels no espaço
            let x = j - WIDTH/2;
            let y = i + HEIGHT/2;
            let direction = linear_alg.normalize([x, y, FOCAL_LENGTH])

            color = cast_ray(FOCAL_POINT, direction, MAX_STEPS);
            pixels[i][j] = color;
        }
    }
    
    return pixels;
}
