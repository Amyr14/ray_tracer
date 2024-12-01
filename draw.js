
const canvas = document.getElementById("viewport");

function draw(canvas, pixels) {
    const HEIGHT = pixels.length;
    const WIDTH = pixels[0].length;
    const ctx = canvas.getContext("2d");
    
    // Trocar para image data depois
    for (let i = 0; i < HEIGHT; i++) {
        for(let j = 0; j < WIDTH; j++) {
            let color = pixels[i][j];
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]} ${color[2]})`;
            ctx.fillRect(i, j, 1, 1);
        }
    }
}

const pixels = Array(800).fill(Array(600).fill([0, 0, 0]));
draw(canvas, pixels);