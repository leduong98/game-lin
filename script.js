const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

// Thiết lập kích thước canvas
canvas.width = 400;
canvas.height = 600;

// Tải hình ảnh chim
const birdImg = new Image();
birdImg.src = 'mo.jpg'; // Ảnh local của bạn

// Tải hình ảnh trái tim cho cột
const heartImg = new Image();
heartImg.src = 'mo.jpg';

// Đối tượng chim
const bird = {
    x: 50,
    y: 300,
    width: 40,
    height: 30,
    gravity: 0.6,
    lift: -8,
    velocity: 0
};

// Mảng chứa các cột
let pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const heartHeight = 20;

let score = 0;
let gameOver = false;
let frames = 0;

// Điều khiển chim bay lên (máy tính)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        bird.velocity = bird.lift;
    }
});

// Điều khiển chim bay lên (điện thoại)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameOver) {
        bird.velocity = bird.lift;
    }
});

// Tạo cột mới
function createPipe() {
    const pipeY = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
    pipes.push({
        x: canvas.width,
        y: pipeY
    });
}

// Kiểm tra va chạm
function collision(bird, pipe) {
    return (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipeWidth &&
            (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap));
}

// Vẽ cột bằng các trái tim
function drawPipe(pipe) {
    for (let i = 0; i < pipe.y; i += heartHeight) {
        ctx.drawImage(heartImg, pipe.x, i, pipeWidth, heartHeight);
    }
    for (let i = pipe.y + pipeGap; i < canvas.height; i += heartHeight) {
        ctx.drawImage(heartImg, pipe.x, i, pipeWidth, heartHeight);
    }
}

// Reset game
function resetGame() {
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    frames = 0;
    restartButton.style.display = 'none'; // Ẩn button khi chơi lại
    gameLoop(); // Bắt đầu lại game
}

// Xử lý nút chơi lại
restartButton.addEventListener('click', resetGame);
restartButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
});

// Hàm chính của game
function gameLoop() {
    if (gameOver) {
        ctx.font = '40px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Mô con đã rơi', canvas.width / 2 - 100, canvas.height / 2);
        ctx.fillText(`Mô đã bay qua: ${score} cột`, canvas.width / 2 - 70, canvas.height / 2 + 50);
        restartButton.style.display = 'block'; // Hiển thị button khi game over
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cập nhật vị trí chim
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    if (bird.y + bird.height > canvas.height) bird.y = canvas.height - bird.height;
    if (bird.y < 0) bird.y = 0;

    // Vẽ chim
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Quản lý cột
    if (frames % 100 === 0) createPipe();
    pipes.forEach((pipe, index) => {
        pipe.x -= 2;
        drawPipe(pipe);

        if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
            score++;
            pipe.passed = true;
        }

        if (collision(bird, pipe)) {
            gameOver = true;
        }

        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Vẽ điểm số
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 30);

    frames++;
    requestAnimationFrame(gameLoop);
}

birdImg.onload = () => {
    heartImg.onload = () => {
        gameLoop();
    };
};