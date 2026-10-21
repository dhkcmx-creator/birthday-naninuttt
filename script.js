// Pengaturan Multi-Playlist Backsound Audio
const playlist = ["lagu1.mp3", "lagu2.mp3"];
let currentTrack = 0;

const bgMusic = document.getElementById("bgMusic");
const musicSource = document.getElementById("musicSource");
const musicToggle = document.getElementById("musicToggle");

function startSurprise() {
    if (bgMusic) {
        bgMusic.play().catch(e => console.log("Audio autoplay blocked: " + e));
    }
    showSection("birthday");
}

function playNextTrack() {
    currentTrack++;
    if (currentTrack >= playlist.length) {
        currentTrack = 0;
    }
    musicSource.src = playlist[currentTrack];
    bgMusic.load();
    bgMusic.play();
}

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.innerText = "🎵";
    } else {
        bgMusic.pause();
        musicToggle.innerText = "🔇";
    }
}

// Sound Synthesizer Efek Game (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'pop') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g);
            g.connect(audioCtx.destination);
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.1);
            g.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.1 + 0.2);
            o.start(audioCtx.currentTime + idx * 0.1);
            o.stop(audioCtx.currentTime + idx * 0.1 + 0.2);
        });
    }
}

// Navigasi Utama Antar Section
function showSection(sectionClass) {
    const sections = document.querySelectorAll(".section");
    sections.forEach(sec => {
        sec.classList.remove("active");
        setTimeout(() => {
            if(!sec.classList.contains("active")) {
                sec.style.display = "none";
            }
        }, 800);
    });

    const targetSection = document.querySelector("." + sectionClass);
    if (targetSection) {
        targetSection.style.display = "flex";
        setTimeout(() => {
            targetSection.classList.add("active");
        }, 50);
    }

    if (sectionClass === 'game-hub') {
        initCatchGame();
    }
}

// Switch Tab Mini Game
function switchGame(gameType) {
    document.querySelectorAll(".sub-tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".game-view").forEach(view => view.classList.remove("active"));

    if (gameType === 'catch') {
        document.querySelectorAll(".sub-tab")[0].classList.add("active");
        document.getElementById("game-catch-wrapper").classList.add("active");
        initCatchGame();
    } else if (gameType === 'memory') {
        document.querySelectorAll(".sub-tab")[1].classList.add("active");
        document.getElementById("game-memory-wrapper").classList.add("active");
        initMemoryGame();
    } else if (gameType === 'scratch') {
        document.querySelectorAll(".sub-tab")[2].classList.add("active");
        document.getElementById("game-scratch-wrapper").classList.add("active");
        initScratchGame();
    }
}

// ==========================================
// GAME 1: BIKIN BUNGA BERTANGKAI (BOUQUET MAKER)
// ==========================================
let currentFlowers = [];
let currentRibbon = "🎀";
let currentPaperClass = "pink";

function addFlower(flowerEmoji, colorHex) {
    if (currentFlowers.length >= 5) {
        return;
    }
    playSound('pop');
    currentFlowers.push({ emoji: flowerEmoji, color: colorHex });
    renderBouquet();
}

function changeRibbon(ribbonType, paperStyle) {
    playSound('pop');
    currentRibbon = ribbonType;
    currentPaperClass = paperStyle;
    renderBouquet();
}

function renderBouquet() {
    const container = document.getElementById("flowersContainer");
    const ribbon = document.getElementById("ribbonDisplay");
    const paper = document.querySelector(".wrapper-cone");

    if (paper) {
        paper.className = "wrapper-cone " + currentPaperClass;
    }

    if (currentFlowers.length === 0) {
        container.innerHTML = `<span class="placeholder-text">Pilih bunga di bawah untuk merangkai buket ✨</span>`;
    } else {
        container.innerHTML = currentFlowers.map(f => `
            <div class="flower-item">
                <span class="flower-head">${f.emoji}</span>
                <div class="flower-stem"></div>
            </div>
        `).join("");
    }
    if (ribbon) ribbon.innerText = currentRibbon;
}

function resetBouquet() {
    playSound('pop');
    currentFlowers = [];
    currentRibbon = "🎀";
    currentPaperClass = "pink";
    renderBouquet();
}

function finishBouquet() {
    if (currentFlowers.length === 0) {
        return;
    }
    playSound('win');
    
    const modal = document.getElementById("bouquetModal");
    const preview = document.getElementById("modalBouquetPreview");
    
    const flowerList = currentFlowers.map(f => f.emoji).join(" ");
    preview.innerHTML = `<div>${flowerList}</div><div style="font-size:36px;">${currentRibbon}</div>`;
    
    modal.classList.add("show");
}

function closeBouquetModal() {
    playSound('pop');
    const modal = document.getElementById("bouquetModal");
    modal.classList.remove("show");
}

function initCatchGame() {
    renderBouquet();
}

// ==========================================
// GAME 2: MEMORY MATCH
// ==========================================
const memoryIcons = ["🎂", "💖", "🎁", "✨", "💌", "🌸"];
let memoryCards = [];
let flippedCards = [];
let memoryMoves = 0;
let memoryMatches = 0;
let isLockBoard = false;

function initMemoryGame() {
    const board = document.getElementById("memoryBoard");
    if (!board) return;
    board.innerHTML = "";
    flippedCards = [];
    memoryMoves = 0;
    memoryMatches = 0;
    isLockBoard = false;
    document.getElementById("memory-moves").innerText = memoryMoves;
    document.getElementById("memory-matches").innerText = `${memoryMatches} / 6`;

    memoryCards = [...memoryIcons, ...memoryIcons].sort(() => Math.random() - 0.5);

    memoryCards.forEach((icon, index) => {
        const card = document.createElement("div");
        card.classList.add("card-item");
        card.dataset.icon = icon;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">❓</div>
                <div class="card-back">${icon}</div>
            </div>
        `;

        card.onclick = () => flipCard(card);
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (isLockBoard) return;
    if (card.classList.contains("flipped")) return;

    playSound('pop');
    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        isLockBoard = true;
        memoryMoves++;
        document.getElementById("memory-moves").innerText = memoryMoves;

        if (flippedCards[0].dataset.icon === flippedCards[1].dataset.icon) {
            memoryMatches++;
            document.getElementById("memory-matches").innerText = `${memoryMatches} / 6`;
            flippedCards = [];
            isLockBoard = false;

            if (memoryMatches === 6) {
                setTimeout(() => {
                    playSound('win');
                    document.getElementById("memoryModal").classList.add("show");
                }, 400);
            }
        } else {
            setTimeout(() => {
                flippedCards[0].classList.remove("flipped");
                flippedCards[1].classList.remove("flipped");
                flippedCards = [];
                isLockBoard = false;
            }, 700);
        }
    }
}

function closeMemoryModal() {
    playSound('pop');
    document.getElementById("memoryModal").classList.remove("show");
}

// ==========================================
// GAME 3: SCRATCH SURPRISE
// ==========================================
function initScratchGame() {
    const canvas = document.getElementById("scratchCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#c0c0c0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#444444";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.fillText("✨ GOSOK DI SINI ✨", canvas.width / 2, canvas.height / 2 + 5);

    let isScratching = false;

    function scratch(e) {
        if (!isScratching) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();
    }

    canvas.onmousedown = (e) => { isScratching = true; scratch(e); };
    canvas.onmousemove = scratch;
    canvas.onmouseup = () => { isScratching = false; };

    canvas.ontouchstart = (e) => { isScratching = true; scratch(e); e.preventDefault(); };
    canvas.ontouchmove = (e) => { scratch(e); e.preventDefault(); };
    canvas.ontouchend = () => { isScratching = false; };
}

// ==========================================
// MAKE A WISH & TIUP LILIN LOGIC
// ==========================================
function sendWish() {
    const wishText = document.getElementById("userWish").value.trim();
    if (wishText === "") {
        playSound('pop');
        document.getElementById("emptyWishModal").classList.add("show");
        return;
    }
    playSound('win');
    document.getElementById("wishModal").classList.add("show");
}

function closeEmptyWishModal() {
    playSound('pop');
    document.getElementById("emptyWishModal").classList.remove("show");
}

function goToCandlePage() {
    playSound('pop');
    document.getElementById("wishModal").classList.remove("show");
    // Reset status lilin
    document.getElementById("cakeGraphic").innerText = "🎂";
    document.getElementById("candleStatusText").innerText = "Klik kue untuk tiup lilin 🕯️";
    showSection('candle-section');
}

function blowCandle() {
    playSound('win');
    document.getElementById("cakeGraphic").innerText = "🍰✨";
    document.getElementById("candleStatusText").innerText = "Hore! Lilin berhasil ditiup! 🎉";
    
    setTimeout(() => {
        document.getElementById("candleModal").classList.add("show");
    }, 600);
}

function finishAllExperience() {
    playSound('pop');
    document.getElementById("candleModal").classList.remove("show");
    document.getElementById("userWish").value = "";
    showSection('opening');
}

// ==========================================
// EFEK KELOPAK BUNGA JATUH
// ==========================================
function createPetals() {
    const container = document.getElementById("petals-container");
    if (!container) return;

    const petalEmojis = ["🌸", "🌺", "✨", "🌷", "💗"];
    const petalCount = 18;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement("div");
        petal.classList.add("petal");
        petal.innerText = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
        
        petal.style.left = Math.random() * 100 + "vw";
        petal.style.animationDuration = Math.random() * 5 + 6 + "s";
        petal.style.animationDelay = Math.random() * 5 + "s";
        petal.style.fontSize = Math.random() * 12 + 16 + "px";

        container.appendChild(petal);
    }
}

// JALANKAN SAAT HALAMAN DIMUAT
document.addEventListener("DOMContentLoaded", () => {
    showSection("opening");
    createPetals();
});