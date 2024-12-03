import { calculatePixels } from "./rayTracer.js";

const canvas = document.getElementById("viewport");

function draw(pixels) {
    const height = pixels.length;
    const width = pixels[0].length;
    const ctx = canvas.getContext("2d");
    
    // Trocar para image data depois
    for (let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            let color = pixels[i][j];
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]} ${color[2]})`;
            ctx.fillRect(i, j, 1, 1);
        }
    }
}

draw(calculatePixels());