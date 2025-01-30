// العناصر الأساسية
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// إضاءة
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// خلفية (سماء وأرض)
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -10;
scene.add(ground);

// إنشاء شخصية (مكعب)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// إنشاء كنز (كرة)
const treasureGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const treasureMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
const treasure = new THREE.Mesh(treasureGeometry, treasureMaterial);
treasure.position.set(5, 0, 0);
scene.add(treasure);

// إنشاء أعداء (كرات حمراء)
const enemies = [];
const enemyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const enemyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

function createEnemy() {
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
    scene.add(enemy);
    enemies.push(enemy);
}

// وضع الكاميرا
camera.position.set(0, 5, 10);
camera.lookAt(player.position);

// التحكم باللمس
const playerSpeed = 0.1;
const controls = {
    up: false,
    down: false,
    left: false,
    right: false
};

document.getElementById('up').addEventListener('touchstart', () => controls.up = true);
document.getElementById('up').addEventListener('touchend', () => controls.up = false);
document.getElementById('down').addEventListener('touchstart', () => controls.down = true);
document.getElementById('down').addEventListener('touchend', () => controls.down = false);
document.getElementById('left').addEventListener('touchstart', () => controls.left = true);
document.getElementById('left').addEventListener('touchend', () => controls.left = false);
document.getElementById('right').addEventListener('touchstart', () => controls.right = true);
document.getElementById('right').addEventListener('touchend', () => controls.right = false);

// مؤثرات صوتية
const winSound = new Audio('assets/win-sound.mp3'); // صوت عند الفوز
const loseSound = new Audio('assets/lose-sound.mp3'); // صوت عند الخسارة

// Cutscene
const cutscene = document.getElementById('cutscene');
const cutsceneText = document.getElementById('cutsceneText');
const skipCutsceneButton = document.getElementById('skipCutscene');

skipCutsceneButton.addEventListener('click', () => {
    cutscene.style.display = 'none';
    startScreen.style.display = 'flex';
});

// شاشة البداية والفوز والخسارة
const startScreen = document.getElementById('startScreen');
const winScreen = document.getElementById('winScreen');
const loseScreen = document.getElementById('loseScreen');
let gameStarted = false;

document.getElementById('startButton').addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameStarted = true;
    animate(); // بدء دورة التصيير بعد الضغط على "ابدأ اللعبة"
});

document.getElementById('restartButton').addEventListener('click', () => {
    winScreen.style.display = 'none';
    resetGame();
});

document.getElementById('restartButtonLose').addEventListener('click', () => {
    loseScreen.style.display = 'none';
    resetGame();
});

// إعادة تعيين اللعبة
function resetGame() {
    treasure.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
    player.position.set(0, 0, 0);
    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;
    gameStarted = true;
}

// دورة التصيير (الرندر)
function animate() {
    if (!gameStarted) return;

    requestAnimationFrame(animate);

    // تحريك الشخصية بناءً على التحكم
    if (controls.up) player.position.z -= playerSpeed;
    if (controls.down) player.position.z += playerSpeed;
    if (controls.left) player.position.x -= playerSpeed;
    if (controls.right) player.position.x += playerSpeed;

    // التحقق إذا وصلت الشخصية للكنز
    if (player.position.distanceTo(treasure.position) < 1) {
        winSound.play();
        winScreen.style.display = 'flex';
        gameStarted = false;
    }

    // تحريك الأعداء بشكل عشوائي
    enemies.forEach(enemy => {
        enemy.position.x += (Math.random() - 0.5) * 0.1;
        enemy.position.z += (Math.random() - 0.5) * 0.1;

        // التحقق إذا لمس اللاعب عدوًا
        if (player.position.distanceTo(enemy.position) < 1) {
            loseSound.play();
            loseScreen.style.display = 'flex';
            gameStarted = false;
        }
    });

    // زيادة عدد الأعداء مع الوقت
    if (Math.random() < 0.01) {
        createEnemy();
    }

    renderer.render(scene, camera);
}
