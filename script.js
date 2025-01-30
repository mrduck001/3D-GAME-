// إعدادات اللعبة
const settings = {
    playerSpeed: 0.1,
    enemySpeed: 0.05,
    shootDistance: 5,
    enemySpawnRate: 0.01,
    coinsPerTreasure: 50,
    stageCost: 50,
    shapeCost: 30,
    colorCost: 30,
};

// العناصر الأساسية
let scene, camera, renderer, player, treasure, enemies = [];
let controls = { up: false, down: false, left: false, right: false, shoot: false };
let gameStarted = false;
let currentStage = 1;
let coins = 0;
let purchasedStages = [1]; // المرحلة الأولى متاحة افتراضيًا
let purchasedShapes = [1]; // الشكل الأول متاح افتراضيًا
let purchasedColors = [1]; // اللون الأول متاح افتراضيًا

// مؤثرات صوتية
const sounds = {
    win: new Audio('assets/win-sound.mp3'),
    lose: new Audio('assets/lose-sound.mp3'),
    shoot: new Audio('assets/shoot-sound.mp3'),
};

// تهيئة اللعبة
function init() {
    try {
        // إنشاء المشهد، الكاميرا، والرندرر
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // إضافة إضاءة
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5).normalize();
        scene.add(light);

        // إعداد التحكم باللمس
        setupControls();

        // إعداد Cutscene
        setupCutscene();

        // إعداد Main Menu
        setupMainMenu();

        // بدء دورة التصيير
        animate();
    } catch (error) {
        console.error('حدث خطأ أثناء تهيئة اللعبة:', error);
    }
}

// إعداد التحكم باللمس
function setupControls() {
    const controlButtons = ['up', 'down', 'left', 'right', 'shoot'];
    controlButtons.forEach(button => {
        const element = document.getElementById(button);
        if (element) {
            element.addEventListener('touchstart', () => controls[button] = true);
            element.addEventListener('touchend', () => controls[button] = false);
        }
    });
}

// إعداد Cutscene
function setupCutscene() {
    const cutscene = document.getElementById('cutscene');
    const skipCutsceneButton = document.getElementById('skipCutscene');
    const cutsceneVideo = document.getElementById('cutsceneVideo');

    if (skipCutsceneButton && cutsceneVideo) {
        skipCutsceneButton.addEventListener('click', () => {
            cutscene.style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        });

        cutsceneVideo.addEventListener('ended', () => {
            cutscene.style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        });
    }
}

// إعداد Main Menu
function setupMainMenu() {
    const storeButton = document.getElementById('storeButton');
    const stagesButton = document.getElementById('stagesButton');
    const startGameButton = document.getElementById('startGameButton');

    if (storeButton) {
        storeButton.addEventListener('click', () => {
            document.getElementById('mainMenu').style.display = 'none';
            document.getElementById('storeScreen').style.display = 'flex';
            updateStore();
        });
    }

    if (stagesButton) {
        stagesButton.addEventListener('click', () => {
            document.getElementById('mainMenu').style.display = 'none';
            document.getElementById('stagesScreen').style.display = 'flex';
            updateStages();
        });
    }

    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            document.getElementById('mainMenu').style.display = 'none';
            startGame();
        });
    }
}

// تحديث المتجر
function updateStore() {
    const shapesContainer = document.getElementById('shapesContainer');
    const colorsContainer = document.getElementById('colorsContainer');

    if (shapesContainer) {
        shapesContainer.innerHTML = '';
        for (let i = 1; i <= 7; i++) {
            const button = document.createElement('button');
            button.textContent = `شراء الشكل ${i} (${settings.shapeCost} عملة)`;
            button.addEventListener('click', () => buyItem('shape', i));
            shapesContainer.appendChild(button);
        }
    }

    if (colorsContainer) {
        colorsContainer.innerHTML = '';
        for (let i = 1; i <= 8; i++) {
            const button = document.createElement('button');
            button.textContent = `شراء اللون ${i} (${settings.colorCost} عملة)`;
            button.addEventListener('click', () => buyItem('color', i));
            colorsContainer.appendChild(button);
        }
    }
}

// تحديث المراحل
function updateStages() {
    const stagesContainer = document.getElementById('stagesContainer');

    if (stagesContainer) {
        stagesContainer.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const button = document.createElement('button');
            button.textContent = `المرحلة ${i} (${settings.stageCost} عملة)`;
            button.addEventListener('click', () => selectStage(i));
            stagesContainer.appendChild(button);
        }
    }
}

// شراء عنصر (شكل أو لون)
function buyItem(type, value) {
    const cost = type === 'shape' ? settings.shapeCost : settings.colorCost;
    if (coins >= cost) {
        coins -= cost;
        if (type === 'shape') {
            purchasedShapes.push(value);
        } else if (type === 'color') {
            purchasedColors.push(value);
        }
        updateStore();
        updateCoins();
    } else {
        alert('لا تملك عملات كافية!');
    }
}

// اختيار مرحلة
function selectStage(stage) {
    if (purchasedStages.includes(stage)) {
        currentStage = stage;
        document.getElementById('stagesScreen').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        updateStageBackground();
    } else {
        alert('يجب شراء هذه المرحلة أولاً!');
    }
}

// تحديث خلفية المرحلة في Main Menu
function updateStageBackground() {
    const stageBackground = document.getElementById('stageBackground');
    if (stageBackground) {
        stageBackground.style.backgroundImage = `url('assets/stage${currentStage}.jpg')`;
    }
}

// بدء اللعبة
function startGame() {
    gameStarted = true;
    setupGameScene();
}

// إعداد مشهد اللعبة
function setupGameScene() {
    // تنظيف المشهد
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // إضافة خلفية المرحلة
    const stageBackground = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/stage${currentStage}.jpg`) })
    );
    stageBackground.rotation.x = -Math.PI / 2;
    stageBackground.position.y = -10;
    scene.add(stageBackground);

    // إضافة شخصية اللاعب
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    scene.add(player);

    // إضافة كنز
    const treasureGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const treasureMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
    treasure = new THREE.Mesh(treasureGeometry, treasureMaterial);
    treasure.position.set(5, 0, 0);
    scene.add(treasure);

    // إضافة أعداء
    for (let i = 0; i < 3; i++) {
        createEnemy();
    }

    // وضع الكاميرا
    camera.position.set(0, 5, 10);
    camera.lookAt(player.position);
}

// دورة التصيير (الرندر)
function animate() {
    try {
        if (!gameStarted) {
            requestAnimationFrame(animate);
            return;
        }

        requestAnimationFrame(animate);

        // تحريك الشخصية
        movePlayer();

        // تحريك الكاميرا مع اللاعب
        camera.position.set(player.position.x, 5, player.position.z + 10);
        camera.lookAt(player.position);

        // التحقق من الفوز أو الخسارة
        checkWinOrLose();

        // تحريك الأعداء
        moveEnemies();

        // إطلاق النار
        if (controls.shoot) {
            shoot();
        }

        // زيادة عدد الأعداء مع الوقت
        if (Math.random() < settings.enemySpawnRate) {
            createEnemy();
        }

        renderer.render(scene, camera);
    } catch (error) {
        console.error('حدث خطأ أثناء التصيير:', error);
    }
}

// تحريك الشخصية
function movePlayer() {
    if (controls.up) player.position.z -= settings.playerSpeed;
    if (controls.down) player.position.z += settings.playerSpeed;
    if (controls.left) player.position.x -= settings.playerSpeed;
    if (controls.right) player.position.x += settings.playerSpeed;
}

// تحريك الأعداء
function moveEnemies() {
    enemies.forEach(enemy => {
        const direction = new THREE.Vector3(
            player.position.x - enemy.position.x,
            player.position.y - enemy.position.y,
            player.position.z - enemy.position.z
        ).normalize();
        enemy.position.add(direction.multiplyScalar(settings.enemySpeed));
    });
}

// إطلاق النار
function shoot() {
    sounds.shoot.play();
    controls.shoot = false;
    enemies.forEach((enemy, index) => {
        if (player.position.d
