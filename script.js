// --- State Management ---
let currentUserLevel = 0;
let textStreamerInterval;

// --- Journey Map Component Script ---
const originalLevelPositions = [
    { x: 50, y: 550 }, { x: 80, y: 520 }, { x: 60, y: 470 }, { x: 90, y: 420 },
    { x: 130, y: 390 }, { x: 110, y: 340 }, { x: 150, y: 300 }, { x: 200, y: 280 },
    { x: 250, y: 260 }, { x: 230, y: 210 }, { x: 270, y: 170 }, { x: 310, y: 140 },
    { x: 290, y: 90 }, { x: 330, y: 60 }, { x: 360, y: 40 }, { x: 380, y: 20 }
];

const levelPositions = originalLevelPositions.filter((_, index) => index % 2 === 0);

function createCurvePath() {
    let path = `M ${levelPositions[0].x} ${levelPositions[0].y}`;
    for (let i = 1; i < levelPositions.length; i++) {
        const prev = levelPositions[i - 1];
        const curr = levelPositions[i];
        const next = levelPositions[i + 1] || curr;
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y + (curr.y - prev.y) * 0.5;
        const cp2x = curr.x - (next.x - curr.x) * 0.3;
        const cp2y = curr.y - (next.y - curr.y) * 0.3;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return path;
}

function initializeJourneyMap(containerId, pathId, level, starsCount) {
    const journeyPath = document.getElementById(containerId);
    if (!journeyPath) return;

    journeyPath.innerHTML = `<svg class="path-svg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet"><path class="path-line" id="${pathId}" /></svg>`;

    const pathElement = document.getElementById(pathId);
    if (!pathElement) return;

    pathElement.setAttribute('d', createCurvePath());

    requestAnimationFrame(() => {
        const svgElement = pathElement.ownerSVGElement;
        if (!svgElement) return;

        const pathLength = pathElement.getTotalLength();
        if (pathLength === 0) return;

        const journeyPathRect = journeyPath.getBoundingClientRect();
        const svgViewBox = svgElement.viewBox.baseVal;
        if (!svgViewBox) return;

        const scaleX = journeyPathRect.width / svgViewBox.width;
        const scaleY = journeyPathRect.height / svgViewBox.height;
        const scale = Math.min(scaleX, scaleY);

        const offsetX = (journeyPathRect.width - svgViewBox.width * scale) / 2;
        const offsetY = (journeyPathRect.height - svgViewBox.height * scale) / 2;

        const existingDots = journeyPath.querySelectorAll('.level-dot, .location-marker, .stars-container, .next-level-button');
        existingDots.forEach(el => el.remove());

        for (let i = 0; i < levelPositions.length; i++) {
            const distance = (pathLength / (levelPositions.length - 1)) * i;
            const point = pathElement.getPointAtLength(distance);

            const dot = document.createElement('div');
            dot.className = 'level-dot';
            if (i > level) dot.classList.add('inactive');
            else if (i === level) dot.classList.add('current');

            dot.textContent = i + 1;
            dot.style.left = `${offsetX + point.x * scale}px`;
            dot.style.top = `${offsetY + point.y * scale}px`;
            journeyPath.appendChild(dot);
        }

        const currentDistance = (pathLength / (levelPositions.length - 1)) * level;
        const currentPoint = pathElement.getPointAtLength(currentDistance);

        const marker = document.createElement('div');
        marker.className = 'location-marker';
        marker.style.left = `${offsetX + currentPoint.x * scale}px`;
        marker.style.top = `${offsetY + currentPoint.y * scale}px`;
        marker.innerHTML = `<svg viewBox="0 0 24 36" fill="#4169E1"><path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/></svg>`;
        journeyPath.appendChild(marker);

        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        starsContainer.style.left = `${offsetX + currentPoint.x * scale}px`;
        starsContainer.style.top = `${offsetY + currentPoint.y * scale}px`;
        for (let i = 0; i < starsCount; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '⭐';
            starsContainer.appendChild(star);
        }
        journeyPath.appendChild(starsContainer);
    });
}

function streamText(element, text, callback) {
    clearInterval(textStreamerInterval);
    element.textContent = '';
    let i = 0;
    textStreamerInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(textStreamerInterval);
            if (callback) callback();
        }
    }, 50);
}

function startJourneyAnimation(containerId, pathId, startLevel, endLevel, starsCount) {
    initializeJourneyMap(containerId, pathId, startLevel, starsCount);

    const continueButton = document.getElementById('continue-button-feedback');
    const finishButton = document.getElementById('finish-button-feedback');
    const titleElement = document.getElementById('feedback-title');

    if (continueButton) continueButton.classList.add('hidden');
    if (finishButton) finishButton.classList.add('hidden');
    if (titleElement) titleElement.textContent = '';

    setTimeout(() => {
        const journeyPath = document.getElementById(containerId);
        const pathElement = document.getElementById(pathId);
        if (!journeyPath || !pathElement) return;

        const svgElement = pathElement.ownerSVGElement;
        if (!svgElement) return;

        const pathLength = pathElement.getTotalLength();
        if (pathLength === 0) return;

        const journeyPathRect = journeyPath.getBoundingClientRect();
        const svgViewBox = svgElement.viewBox.baseVal;
        if (!svgViewBox) return;

        const scaleX = journeyPathRect.width / svgViewBox.width;
        const scaleY = journeyPathRect.height / svgViewBox.height;
        const scale = Math.min(scaleX, scaleY);
        const offsetX = (journeyPathRect.width - svgViewBox.width * scale) / 2;
        const offsetY = (journeyPathRect.height - svgViewBox.height * scale) / 2;

        const marker = journeyPath.querySelector('.location-marker');
        const stars = journeyPath.querySelector('.stars-container');
        const dots = journeyPath.querySelectorAll('.level-dot');

        const endDistance = (pathLength / (levelPositions.length - 1)) * endLevel;
        const endPoint = pathElement.getPointAtLength(endDistance);

        if (marker && endPoint) {
            marker.style.left = `${offsetX + endPoint.x * scale}px`;
            marker.style.top = `${offsetY + endPoint.y * scale}px`;
        }

        setTimeout(() => {
            if (!stars || !titleElement || !journeyPath) return;
            const titleRect = titleElement.getBoundingClientRect();
            const journeyPathRect = journeyPath.getBoundingClientRect();
            const targetX = (titleRect.left + titleRect.width / 2) - journeyPathRect.left;
            const targetY = titleRect.bottom - journeyPathRect.top + 25; // Lowered stars
            stars.style.left = `${targetX}px`;
            stars.style.top = `${targetY}px`;
            stars.style.transform = 'translate(-50%, 0) scale(2)';
        }, 500);

        if (dots[startLevel]) dots[startLevel].classList.remove('current');
        if (dots[endLevel]) {
            dots[endLevel].classList.remove('inactive');
            dots[endLevel].classList.add('current');
        }

        setTimeout(() => {
            streamText(titleElement, 'יופי, התקדמנו עוד קצת.', () => {
                setTimeout(() => {
                    streamText(titleElement, 'שנמשיך לשלב הבא?', () => {
                        if (continueButton) {
                            continueButton.classList.remove('hidden');
                            continueButton.classList.add('flex');
                        }
                        if (finishButton) {
                            finishButton.classList.remove('hidden');
                            finishButton.classList.add('flex');
                        }

                        const nextLevelButton = document.createElement('button');
                        nextLevelButton.className = 'next-level-button';
                        nextLevelButton.onclick = () => showScreen('screen-instructor');
                        nextLevelButton.innerHTML = `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>`;
                        if(endPoint) {
                            nextLevelButton.style.left = `${offsetX + endPoint.x * scale}px`;
                            nextLevelButton.style.top = `${offsetY + endPoint.y * scale}px`;
                        }
                        journeyPath.appendChild(nextLevelButton);
                    });
                }, 1000);
            });
        }, 1200);

    }, 1000);
}

// --- App Navigation Script ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) activeScreen.classList.add('active');

    if (screenId === 'screen-feedback-1') {
        const startLevel = currentUserLevel;
        currentUserLevel = (currentUserLevel + 1) % levelPositions.length;

        startJourneyAnimation('journeyPath1', 'curvePath1', startLevel, currentUserLevel, 3);
    }

    if (screenId === 'screen-start') {
        currentUserLevel = 0; // Reset level when starting over
    }
}
