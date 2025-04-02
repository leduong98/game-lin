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
heartImg.src = '123.jpg';

const cloudImg = new Image();
cloudImg.src = 'cloud.png'; // Đặt đường dẫn ảnh mây

let clouds = [];

function createCloud() {
    clouds.push({
        x: canvas.width,
        y: Math.random() * (canvas.height / 2),
        width: Math.random() * 80 + 50,
        height: Math.random() * 40 + 30,
        speed: Math.random() * 1.5 + 0.5
    });
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(cloudImg, cloud.x, cloud.y, cloud.width, cloud.height);
        ctx.globalAlpha = 1;
    });
}

function updateClouds() {
    clouds.forEach((cloud, index) => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) clouds.splice(index, 1);
    });

    if (frames % 200 === 0) createCloud();
}

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
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa màn hình game trước khi restart
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
        // Vẽ nền hình chữ nhật làm khung thông báo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Nền trắng gần như không trong suốt
        ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 50, 240, 120); // Hộp chứa nội dung

        // Vẽ viền
        ctx.strokeStyle = '#2f6397';
        ctx.lineWidth = 4;
        ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 - 50, 240, 120);

        // Vẽ chữ thông báo
        ctx.font = '19px "Fredoka", cursive';
        ctx.fillStyle = '#2f6397';
        ctx.textAlign = 'center';
        ctx.fillText('Mô con đã rơi', canvas.width / 2, canvas.height / 2 - 10);

        // Hiển thị và định vị nút restart bên trong hộp
        restartButton.style.display = 'block';
        restartButton.style.position = 'absolute';
        restartButton.style.top = `${canvas.offsetTop + canvas.height / 2 + 15}px`; // Dưới dòng chữ khoảng 30px
        restartButton.style.left = `${canvas.offsetLeft + canvas.width / 2 - restartButton.offsetWidth / 2}px`;

        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateClouds();  // Cập nhật vị trí mây
    drawClouds();    // Vẽ mây lên canvas

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

    // Vẽ nền điểm số (bo góc)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Nền trắng mờ
    ctx.roundRect(5, 5, 130, 40, 10); // Bo góc 10px
    ctx.fill();

// Vẽ viền xanh
    ctx.strokeStyle = '#2f6397';
    ctx.lineWidth = 3;
    ctx.stroke();

// Vẽ điểm số
    ctx.font = '19px "Fredoka", cursive';
    ctx.fillStyle = '#033c77';
    ctx.textAlign = "left";  // Fix lỗi bị lệch
    ctx.fillText(`Ăn: ${score} hộp pate`, 15, 30);
    frames++;
    requestAnimationFrame(gameLoop);
}

// Đảm bảo game luôn khởi chạy, ngay cả khi ảnh bị lỗi load
let imagesLoaded = 0;

function checkAndStartGame() {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        console.log("Game starting...");
        gameLoop();
    }
}

birdImg.onload = checkAndStartGame;
heartImg.onload = checkAndStartGame;
cloudImg.onload = checkAndStartGame;

// Nếu ảnh load lỗi, vẫn chạy game sau 1 giây
setTimeout(() => {
    if (imagesLoaded < 3) {
        console.warn("Image load timeout! Starting game anyway.");
        gameLoop();
    }
}, 1000);