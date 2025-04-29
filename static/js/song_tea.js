/**
 * 宋代团茶工艺 - 交互功能脚本
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化时间轴导航
    initTimelineNav();
    
    // 初始化交互模拟器
    initSteamingSimulator();
    initGrindingSimulator();
    initMoldingSimulator();
    
    // 初始化茶器博物馆
    initTeaWareMuseum();
    
    // 初始化诗词弹幕
    initPoetryWall();
    
    // 初始化节气信息
    showSeasonalInfo();
    
    // 初始化视频播放器
    initVideoPlayers();
    
    // 添加页面动画效果
    addAnimationEffects();
    
    // 页面加载1秒后检查各模块是否正确初始化
    setTimeout(checkModulesInitialization, 1000);
});

/**
 * 检查各模块是否正确初始化
 */
function checkModulesInitialization() {
    // 检查研膏模块
    const grindCanvas = document.getElementById('grind-canvas');
    if (grindCanvas && grindCanvas.offsetParent !== null) {
        // 检查是否在可见的步骤3中
        const stepDetails3 = document.getElementById('step-details-3');
        if (stepDetails3 && window.getComputedStyle(stepDetails3).display !== 'none') {
            // 如果研磨模块可见，确保重新初始化
            if (typeof initGrindingSimulator === 'function') {
                initGrindingSimulator();
            }
        }
    }
    
    // 检查弹幕模块
    const poetryContainer = document.querySelector('.poetry-container');
    if (poetryContainer && poetryContainer.children.length === 0) {
        // 如果弹幕容器为空，重新初始化弹幕
        if (typeof initPoetryWall === 'function') {
            initPoetryWall();
        }
    }
}

/**
 * 初始化时间轴导航
 */
function initTimelineNav() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    
    timelineSteps.forEach(step => {
        step.addEventListener('click', function() {
            // 移除所有激活状态
            timelineSteps.forEach(s => s.classList.remove('active'));
            
            // 添加激活状态
            this.classList.add('active');
            
            // 获取步骤ID
            const stepId = this.getAttribute('data-step');
            
            // 显示对应步骤内容
            showStepContent(stepId);
            
            // 滚动到内容区域 - 支持新旧两种类名
            const targetContent = document.getElementById(`step-details-${stepId}`);
            if (targetContent) {
                targetContent.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 默认显示第一个步骤
    if (timelineSteps.length > 0) {
        timelineSteps[0].classList.add('active');
        const firstStepId = timelineSteps[0].getAttribute('data-step');
        showStepContent(firstStepId);
    }
}

/**
 * 显示特定步骤的内容
 * @param {string} stepId - 步骤ID
 */
function showStepContent(stepId) {
    // 隐藏所有步骤内容 (同时兼容step-details和step-content类名)
    const allStepContents = document.querySelectorAll('.step-details, .step-content');
    allStepContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // 显示选中的步骤内容
    const targetContent = document.getElementById(`step-details-${stepId}`);
    if (targetContent) {
        targetContent.style.display = 'flex';
        
        // 特殊处理研膏模块
        if (stepId === '3') {
            // 确保研膏Canvas正确初始化
            const grindCanvas = document.getElementById('grind-canvas');
            if (grindCanvas) {
                // 触发Canvas重绘
                const event = new Event('resize');
                window.dispatchEvent(event);
                
                // 如果研磨模拟器已初始化，重新加载图像
                if (typeof initGrindingSimulator === 'function') {
                    initGrindingSimulator();
                }
            }
        }
        
        // 添加动画效果
        targetContent.classList.add('float-up');
        setTimeout(() => {
            targetContent.classList.remove('float-up');
        }, 800);
    }
}

/**
 * 初始化蒸茶模拟器
 */
function initSteamingSimulator() {
    const steamSlider = document.getElementById('steam-level');
    const steamValue = document.getElementById('steam-value');
    const steamParticles = document.querySelector('.steam-particles');
    
    if (!steamSlider) return;
    
    // 添加茶叶元素和蒸制效果显示区域
    const steamPot = document.querySelector('.steam-pot');
    if (steamPot) {
        // 添加茶叶元素
        const teaLeaves = document.createElement('div');
        teaLeaves.classList.add('tea-leaves-container');
        teaLeaves.innerHTML = `
            <div class="tea-leaves-visual"></div>
            <div class="tea-moisture-indicator">
                <div class="moisture-level" style="width: 100%"></div>
            </div>
        `;
        steamPot.appendChild(teaLeaves);
        
        // 添加火焰效果
        const fireContainer = document.createElement('div');
        fireContainer.classList.add('fire-container');
        fireContainer.innerHTML = `
            <div class="fire-base"></div>
            <div class="flames">
                <div class="flame flame-1"></div>
                <div class="flame flame-2"></div>
                <div class="flame flame-3"></div>
                <div class="flame flame-4"></div>
                <div class="flame flame-5"></div>
            </div>
        `;
        steamPot.after(fireContainer);
        
        // 添加蒸制完成度指示器
        const simulatorContainer = document.querySelector('.simulator-container');
        const completionIndicator = document.createElement('div');
        completionIndicator.classList.add('steaming-completion');
        completionIndicator.innerHTML = `
            <div class="completion-track">
                <div class="completion-progress" style="width: 0%"></div>
            </div>
            <div class="completion-label">蒸制进度: <span id="completion-value">0%</span></div>
            <div class="steaming-result">茶叶状态: <span id="tea-status">未蒸制</span></div>
        `;
        simulatorContainer.appendChild(completionIndicator);
    }
    
    // 蒸制状态变量
    let steamingActive = false;
    let steamingProgress = 0;
    let steamingInterval = null;
    let moistureLevel = 100; // 初始水分含量100%
    
    // 更新蒸汽效果
    function updateSteamEffect(value) {
        // 根据滑块值更新蒸汽效果
        let intensity = value / 100; // 0-1的强度值
        
        // 更新蒸汽粒子数量和速度
        steamParticles.innerHTML = ''; // 清除现有粒子
        
        // 创建新粒子
        const particleCount = Math.floor(intensity * 20) + 5; // 5-25个粒子
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('steam-particle');
            
            // 随机位置
            particle.style.left = `${Math.random() * 100}%`;
            
            // 随机大小 (2-6px)
            const size = (Math.random() * 4 + 2) * intensity;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机动画延迟
            particle.style.animationDelay = `${Math.random() * 2}s`;
            
            // 动画持续时间 (快慢取决于强度)
            const duration = (4 - intensity * 2); // 2-4秒
            particle.style.animationDuration = `${duration}s`;
            
            steamParticles.appendChild(particle);
        }
        
        // 更新火焰效果
        updateFireEffect(value);
        
        // 更新显示值
        let displayText = '适中';
        if (value < 30) displayText = '弱火';
        else if (value > 70) displayText = '猛火';
        
        steamValue.textContent = displayText;
        
        // 更新蒸制速度（如果蒸制过程正在进行）
        if (steamingActive) {
            updateSteamingRate(value);
        }
    }
    
    // 更新火焰效果
    function updateFireEffect(value) {
        const flames = document.querySelectorAll('.flame');
        const fireBase = document.querySelector('.fire-base');
        
        if (!flames.length || !fireBase) return;
        
        // 火候强度 (0-1)
        const intensity = value / 100;
        
        // 更新火焰底座颜色
        const baseColor = intensity < 0.3 ? 
            'rgba(255, 140, 0, 0.7)' : 
            (intensity > 0.7 ? 'rgba(255, 50, 0, 0.9)' : 'rgba(255, 80, 0, 0.8)');
        fireBase.style.backgroundColor = baseColor;
        
        // 更新火焰尺寸和动画速度
        flames.forEach((flame, index) => {
            // 根据火候调整火焰高度
            const baseHeight = 30 + (index * 5); // 基础高度
            const heightMultiplier = 0.7 + (intensity * 0.6); // 高度倍率
            flame.style.height = `${baseHeight * heightMultiplier}px`;
            
            // 根据火候调整火焰宽度
            const baseWidth = 15 + (index * 3); // 基础宽度
            const widthMultiplier = 0.8 + (intensity * 0.4); // 宽度倍率
            flame.style.width = `${baseWidth * widthMultiplier}px`;
            
            // 根据火候调整火焰颜色
            if (intensity < 0.3) {
                // 弱火: 橙色偏黄
                flame.style.backgroundColor = `rgba(255, ${150 + (index * 20)}, 0, 0.${7 - index})`;
            } else if (intensity > 0.7) {
                // 强火: 红色偏蓝
                flame.style.backgroundColor = `rgba(255, ${100 - (index * 10)}, ${index * 15}, 0.${8 - index})`;
            } else {
                // 中火: 标准橙黄
                flame.style.backgroundColor = `rgba(255, ${120 + (index * 15)}, 0, 0.${7 - index})`;
            }
            
            // 根据火候调整火焰动画速度
            const animationDuration = intensity < 0.3 ? 3 - (index * 0.2) : (intensity > 0.7 ? 1.5 - (index * 0.1) : 2 - (index * 0.15));
            flame.style.animationDuration = `${animationDuration}s`;
        });
    }
    
    // 添加开始蒸制按钮
    const controlsArea = document.querySelector('.slider-control');
    if (controlsArea) {
        const startButton = document.createElement('button');
        startButton.id = 'start-steaming';
        startButton.className = 'interactive-button';
        startButton.textContent = '开始蒸制';
        controlsArea.after(startButton);
        
        // 绑定开始/停止蒸制事件
        startButton.addEventListener('click', function() {
            if (!steamingActive) {
                startSteaming();
                this.textContent = '停止蒸制';
            } else {
                stopSteaming();
                this.textContent = '开始蒸制';
            }
        });
    }
    
    // 开始蒸制过程
    function startSteaming() {
        if (steamingActive) return;
        
        steamingActive = true;
        steamingProgress = 0;
        moistureLevel = 100;
        updateSteamingDisplay();
        
        // 根据当前火候设置蒸制速度
        updateSteamingRate(steamSlider.value);
    }
    
    // 停止蒸制过程
    function stopSteaming() {
        if (!steamingActive) return;
        
        steamingActive = false;
        if (steamingInterval) {
            clearInterval(steamingInterval);
            steamingInterval = null;
        }
        
        // 显示最终状态
        evaluateTeaQuality();
    }
    
    // 更新蒸制速度
    function updateSteamingRate(value) {
        // 清除现有间隔
        if (steamingInterval) {
            clearInterval(steamingInterval);
        }
        
        // 计算蒸制速度 - 火候适中时速度最佳
        let steamingSpeed;
        if (value >= 40 && value <= 60) {
            // 最佳火候范围
            steamingSpeed = 30; // 毫秒
        } else if (value < 40) {
            // 火候不足
            steamingSpeed = 50 + (40 - value); // 速度变慢
        } else {
            // 火候过猛
            steamingSpeed = 40 + (value - 60) * 0.5; // 速度稍微变慢
        }
        
        // 设置新的间隔
        steamingInterval = setInterval(updateSteamingProgress, steamingSpeed);
    }
    
    // 更新蒸制进度
    function updateSteamingProgress() {
        if (!steamingActive) return;
        
        // 增加进度
        steamingProgress += 0.2;
        
        // 更新水分含量
        if (steamSlider.value > 70) {
            // 火候过猛，水分流失更快
            moistureLevel -= 0.3;
        } else if (steamSlider.value < 30) {
            // 火候不足，水分流失更慢
            moistureLevel -= 0.1;
        } else {
            // 火候适中，正常水分流失
            moistureLevel -= 0.2;
        }
        
        // 限制范围
        moistureLevel = Math.max(0, moistureLevel);
        
        // 更新显示
        updateSteamingDisplay();
        
        // 检查是否完成
        if (steamingProgress >= 100 || moistureLevel <= 0) {
            stopSteaming();
        }
    }
    
    // 更新蒸制显示
    function updateSteamingDisplay() {
        // 更新进度条
        const progressBar = document.querySelector('.completion-progress');
        const progressValue = document.getElementById('completion-value');
        if (progressBar && progressValue) {
            const progress = Math.min(100, steamingProgress);
            progressBar.style.width = `${progress}%`;
            progressValue.textContent = `${Math.round(progress)}%`;
        }
        
        // 更新水分指示器
        const moistureBar = document.querySelector('.moisture-level');
        if (moistureBar) {
            moistureBar.style.width = `${moistureLevel}%`;
            moistureBar.style.backgroundColor = getMoistureColor(moistureLevel);
        }
        
        // 更新茶叶颜色
        const teaLeavesVisual = document.querySelector('.tea-leaves-visual');
        if (teaLeavesVisual) {
            const greenness = Math.max(0, Math.min(100, 120 - steamingProgress));
            teaLeavesVisual.style.backgroundColor = `rgb(${120 - greenness * 0.4}, ${100 + greenness}, ${20})`;
        }
        
        // 更新茶叶状态描述
        updateTeaStatus();
    }
    
    // 根据水分含量获取颜色
    function getMoistureColor(level) {
        if (level > 70) return '#3498db'; // 蓝色 - 水分充足
        if (level > 40) return '#2ecc71'; // 绿色 - 水分适中
        if (level > 20) return '#f39c12'; // 橙色 - 水分偏低
        return '#e74c3c'; // 红色 - 水分不足
    }
    
    // 更新茶叶状态描述
    function updateTeaStatus() {
        const teaStatus = document.getElementById('tea-status');
        if (!teaStatus) return;
        
        if (steamingProgress < 20) {
            teaStatus.textContent = '开始变软';
        } else if (steamingProgress < 40) {
            teaStatus.textContent = '香气开始释放';
        } else if (steamingProgress < 60) {
            teaStatus.textContent = '叶色变深';
        } else if (steamingProgress < 80) {
            teaStatus.textContent = '形态稳定';
        } else if (steamingProgress < 100) {
            teaStatus.textContent = '即将完成';
        } else {
            teaStatus.textContent = '蒸制完成';
        }
    }
    
    // 评估茶叶质量
    function evaluateTeaQuality() {
        const teaStatus = document.getElementById('tea-status');
        if (!teaStatus) return;
        
        // 根据火候和蒸制进度评估质量
        const fireLevel = parseInt(steamSlider.value);
        
        if (steamingProgress < 60) {
            teaStatus.textContent = '蒸制不足，茶性未稳';
            teaStatus.style.color = '#e74c3c';
        } else if (steamingProgress > 95) {
            if (fireLevel >= 40 && fireLevel <= 60) {
                teaStatus.textContent = '蒸制完美，色香俱佳';
                teaStatus.style.color = '#27ae60';
            } else if (fireLevel > 60) {
                teaStatus.textContent = '火候过猛，香气流失';
                teaStatus.style.color = '#e67e22';
            } else {
                teaStatus.textContent = '火候不足，未能去青';
                teaStatus.style.color = '#f1c40f';
            }
        } else {
            teaStatus.textContent = '蒸制基本完成';
            teaStatus.style.color = '#3498db';
        }
    }
    
    // 初始更新
    updateSteamEffect(steamSlider.value);
    
    // 监听滑块变化
    steamSlider.addEventListener('input', function() {
        updateSteamEffect(this.value);
    });
}

/**
 * 初始化研磨模拟器
 */
function initGrindingSimulator() {
    const grindCanvas = document.getElementById('grind-canvas');
    const startGrindBtn = document.getElementById('start-grind');
    const pressureLevels = document.querySelectorAll('.pressure-level .level');
    
    if (!grindCanvas || !startGrindBtn) return;
    
    const ctx = grindCanvas.getContext('2d');
    let isGrinding = false;
    let particles = [];
    let currentPressure = 2; // 默认中等压力
    let grindStoneImg = null;
    let teaLeavesImg = null;
    let imagesLoaded = 0;
    
    // 设置画布大小
    function resizeCanvas() {
        const parent = grindCanvas.parentElement;
        grindCanvas.width = parent.clientWidth;
        grindCanvas.height = 300;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化研磨工具图像
    function loadImages() {
        grindStoneImg = new Image();
        grindStoneImg.src = '/static/images/grind-stone.png';
        grindStoneImg.onload = imageLoaded;
        grindStoneImg.onerror = function() {
            console.error('无法加载研磨石图像');
            // 创建一个默认图像作为备用
            createDefaultStoneImage();
            imageLoaded();
        };
        
        teaLeavesImg = new Image();
        teaLeavesImg.src = '/static/images/tea-leaves.png';
        teaLeavesImg.onload = imageLoaded;
        teaLeavesImg.onerror = function() {
            console.error('无法加载茶叶图像');
            // 创建一个默认图像作为备用
            createDefaultLeavesImage();
            imageLoaded();
        };
    }
    
    // 创建默认的研磨石图像
    function createDefaultStoneImage() {
        grindStoneImg = document.createElement('canvas');
        grindStoneImg.width = 160;
        grindStoneImg.height = 160;
        const stoneCtx = grindStoneImg.getContext('2d');
        stoneCtx.fillStyle = '#8d6e5d';
        stoneCtx.beginPath();
        stoneCtx.arc(80, 80, 70, 0, Math.PI * 2);
        stoneCtx.fill();
        stoneCtx.fillStyle = '#6d4c41';
        stoneCtx.beginPath();
        stoneCtx.arc(80, 80, 50, 0, Math.PI * 2);
        stoneCtx.fill();
    }
    
    // 创建默认的茶叶图像
    function createDefaultLeavesImage() {
        teaLeavesImg = document.createElement('canvas');
        teaLeavesImg.width = 200;
        teaLeavesImg.height = 200;
        const leavesCtx = teaLeavesImg.getContext('2d');
        leavesCtx.fillStyle = '#4d3229';
        
        // 绘制一些随机形状的"茶叶"
        for (let i = 0; i < 20; i++) {
            leavesCtx.beginPath();
            leavesCtx.ellipse(
                100 + (Math.random() - 0.5) * 80,
                100 + (Math.random() - 0.5) * 80,
                10 + Math.random() * 20,
                5 + Math.random() * 10,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            leavesCtx.fill();
        }
    }
    
    // 图像加载完成计数
    function imageLoaded() {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            // 两张图片都加载完成，初始化画布
            initCanvas();
        }
    }
    
    // 初始化画布
    function initCanvas() {
        // 清除画布
        ctx.clearRect(0, 0, grindCanvas.width, grindCanvas.height);
        
        // 绘制背景
        ctx.fillStyle = '#f5f1e6';
        ctx.fillRect(0, 0, grindCanvas.width, grindCanvas.height);
        
        // 绘制茶叶
        ctx.drawImage(
            teaLeavesImg, 
            grindCanvas.width / 2 - 100,
            grindCanvas.height / 2 - 100,
            200, 
            200
        );
        
        // 绘制研磨工具
        ctx.drawImage(
            grindStoneImg,
            grindCanvas.width / 2 - 80,
            grindCanvas.height / 2 - 80,
            160,
            160
        );
    }
    
    // 设置压力等级
    pressureLevels.forEach(level => {
        level.addEventListener('click', function() {
            // 移除所有激活状态
            pressureLevels.forEach(l => l.classList.remove('active'));
            
            // 添加激活状态
            this.classList.add('active');
            
            // 设置当前压力
            currentPressure = parseInt(this.getAttribute('data-level'));
        });
    });
    
    // 默认选中中等压力
    pressureLevels[1].classList.add('active');
    
    // 粒子类
    class TeaParticle {
        constructor() {
            this.x = grindCanvas.width / 2 + (Math.random() - 0.5) * 100;
            this.y = grindCanvas.height / 2 + (Math.random() - 0.5) * 100;
            this.size = Math.random() * 5 + 2;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size -= 0.05;
            this.opacity -= 0.01;
        }
        
        draw() {
            ctx.fillStyle = `rgba(109, 76, 65, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 开始研磨
    startGrindBtn.addEventListener('click', function() {
        if (isGrinding) return;
        
        isGrinding = true;
        this.textContent = '正在研磨...';
        this.disabled = true;
        
        // 清除现有粒子
        particles = [];
        
        // 开始动画循环
        animate();
        
        // 研磨完成后重置
        setTimeout(() => {
            isGrinding = false;
            this.textContent = '开始研磨';
            this.disabled = false;
        }, 5000);
    });
    
    // 动画循环
    function animate() {
        if (!isGrinding) return;
        
        // 清除画布
        ctx.clearRect(0, 0, grindCanvas.width, grindCanvas.height);
        
        // 绘制背景
        ctx.fillStyle = '#f5f1e6';
        ctx.fillRect(0, 0, grindCanvas.width, grindCanvas.height);
        
        // 绘制茶叶
        if (teaLeavesImg) {
            ctx.drawImage(
                teaLeavesImg, 
                grindCanvas.width / 2 - 100,
                grindCanvas.height / 2 - 100,
                200, 
                200
            );
        }
        
        // 绘制研磨工具
        if (grindStoneImg) {
            ctx.drawImage(
                grindStoneImg,
                grindCanvas.width / 2 - 80 + Math.sin(Date.now() / 200) * 10,
                grindCanvas.height / 2 - 80 + Math.cos(Date.now() / 200) * 10,
                160,
                160
            );
        }
        
        // 根据压力添加粒子
        if (Math.random() < 0.3 * currentPressure) {
            const particleCount = currentPressure * 2;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new TeaParticle());
            }
        }
        
        // 更新和绘制粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            // 移除过小或透明度过低的粒子
            if (particles[i].size <= 0.5 || particles[i].opacity <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // 继续动画循环
        requestAnimationFrame(animate);
    }
    
    // 加载图像并初始化
    loadImages();
}

/**
 * 初始化模具成型模拟器
 */
function initMoldingSimulator() {
    const moldButtons = document.querySelectorAll('.mold-btn');
    const moldPreview = document.querySelector('.mold-preview');
    
    if (!moldButtons.length || !moldPreview) return;
    
    moldButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有激活状态
            moldButtons.forEach(b => b.classList.remove('active'));
            
            // 添加激活状态
            this.classList.add('active');
            
            // 获取模具类型
            const moldType = this.getAttribute('data-mold');
            
            // 更新预览图
            updateMoldPreview(moldType);
        });
    });
    
    // 更新模具预览
    function updateMoldPreview(moldType) {
        // 添加淡出效果
        moldPreview.classList.add('fade-out');
        
        // 等待淡出完成后更新图片并淡入
        setTimeout(() => {
            moldPreview.style.backgroundImage = `url('/static/images/mold-${moldType}.jpg')`;
            moldPreview.classList.remove('fade-out');
            moldPreview.classList.add('fade-in');
            
            // 移除淡入效果
            setTimeout(() => {
                moldPreview.classList.remove('fade-in');
            }, 500);
        }, 300);
    }
}

/**
 * 初始化茶器博物馆
 */
function initTeaWareMuseum() {
    const museumNavButtons = document.querySelectorAll('.museum-nav-btn');
    const teaWareItems = document.querySelectorAll('.tea-ware-item');
    
    if (!museumNavButtons.length) return;
    
    museumNavButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有激活状态
            museumNavButtons.forEach(b => b.classList.remove('active'));
            
            // 添加激活状态
            this.classList.add('active');
            
            // 获取类别
            const category = this.getAttribute('data-category');
            
            // 筛选显示对应类别的茶器
            filterTeaWares(category);
        });
    });
    
    // 筛选茶器
    function filterTeaWares(category) {
        teaWareItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

/**
 * 初始化诗词弹幕
 */
function initPoetryWall() {
    const poetryContainer = document.querySelector('.poetry-container');
    const poetryForm = document.querySelector('.poetry-form');
    const poetryInput = document.querySelector('.poetry-input');
    
    if (!poetryContainer) return;
    
    // 预设诗词
    const defaultPoems = [
        "蒙茸出雾缥渺间，玉腕春风捋翠翾。",
        "玉芽初采色相鲜，蒸之复焙味悠然。",
        "轻研慢点新芽嫩，玉瓯香浮雪乳妍。",
        "细雨微风春日长，杏花村里采茶忙。",
        "龙团雀舌贡春官，百衲轻罗称上竿。",
        "千团捣尽方钤印，独赐鸾觞不等闲。"
    ];
    
    // 清空容器中可能存在的旧弹幕
    poetryContainer.innerHTML = '';
    
    // 添加预设诗词
    let delay = 1000;
    defaultPoems.forEach((poem, index) => {
        setTimeout(() => {
            addPoetryItem(poem);
        }, delay * (index + 1));
    });
    
    // 提交新诗词
    if (poetryForm) {
        poetryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const poem = poetryInput.value.trim();
            if (poem) {
                addPoetryItem(poem);
                poetryInput.value = '';
            }
        });
    }
    
    // 添加诗词项目
    function addPoetryItem(text) {
        if (!text || !poetryContainer) return;
        
        const item = document.createElement('div');
        item.classList.add('poetry-item');
        item.textContent = text;
        
        // 随机垂直位置
        const topPosition = Math.random() * (poetryContainer.clientHeight - 40);
        item.style.top = `${topPosition}px`;
        
        // 随机动画速度（10-20秒）
        const speed = 10 + Math.random() * 10;
        item.style.animationDuration = `${speed}s`;
        
        // 随机起始延迟（0-2秒）
        const delay = Math.random() * 2;
        item.style.animationDelay = `${delay}s`;
        
        // 确保不同弹幕的z-index不同，以避免重叠问题
        item.style.zIndex = Math.floor(Math.random() * 10) + 2;
        
        // 添加到容器
        poetryContainer.appendChild(item);
        
        // 动画结束后移除
        setTimeout(() => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, (speed + delay) * 1000 + 500); // 额外增加500ms确保完全移出视图
    }
    
    // 每隔一段时间检查弹幕数量，如果太少则添加随机弹幕
    setInterval(() => {
        const currentItems = poetryContainer.querySelectorAll('.poetry-item');
        if (currentItems.length < 3) {
            const randomIndex = Math.floor(Math.random() * defaultPoems.length);
            addPoetryItem(defaultPoems[randomIndex]);
        }
    }, 5000);
}

/**
 * 显示当前节气信息
 */
function showSeasonalInfo() {
    const seasonalInfo = document.querySelector('.seasonal-info');
    if (!seasonalInfo) return;
    
    // 定义24节气
    const solarTerms = [
        { name: "立春", startDate: "2月3-5日", icon: "🌱", teaActivity: "春茶筹备期，准备茶园除草与施肥" },
        { name: "雨水", startDate: "2月18-20日", icon: "🌧️", teaActivity: "茶树芽苞初展，开始检查茶园状况" },
        { name: "惊蛰", startDate: "3月5-7日", icon: "⚡", teaActivity: "北苑茶园开始准备采茶工具" },
        { name: "春分", startDate: "3月20-22日", icon: "☯️", teaActivity: "宋代皇家茶园举行祭茶神仪式" },
        { name: "清明", startDate: "4月4-6日", icon: "🌿", teaActivity: "早春茶采摘开始，龙井、碧螺春等名茶采制" },
        { name: "谷雨", startDate: "4月19-21日", icon: "☔", teaActivity: "茶采摘黄金期，宫廷开始选茶" },
        { name: "立夏", startDate: "5月5-7日", icon: "☀️", teaActivity: "春茶采摘接近尾声，开始制作龙团凤饼" },
        { name: "小满", startDate: "5月20-22日", icon: "🌾", teaActivity: "春茶完全采摘完毕，开始贡茶选制" },
        { name: "芒种", startDate: "6月5-7日", icon: "🌞", teaActivity: "贡茶完成，开始向宫廷运送" },
        { name: "夏至", startDate: "6月21-22日", icon: "🔥", teaActivity: "夏茶采制，以粗老叶为主，多制成普通饼茶" },
        { name: "小暑", startDate: "7月6-8日", icon: "🥵", teaActivity: "茶园修剪整理，为秋茶生长创造条件" },
        { name: "大暑", startDate: "7月22-24日", icon: "🔥", teaActivity: "茶园夏季管理，防暑防虫" },
        { name: "立秋", startDate: "8月7-9日", icon: "🍂", teaActivity: "秋茶准备期，检查茶树生长情况" },
        { name: "处暑", startDate: "8月22-24日", icon: "🍃", teaActivity: "开始采摘秋茶，品质次于春茶" },
        { name: "白露", startDate: "9月7-9日", icon: "💧", teaActivity: "秋茶采摘高峰期，白露茶品质佳" },
        { name: "秋分", startDate: "9月22-24日", icon: "⚖️", teaActivity: "秋茶继续采收，开始准备存茶" },
        { name: "寒露", startDate: "10月8-9日", icon: "❄️", teaActivity: "秋茶采摘结束，宋代开始煮茶品饮" },
        { name: "霜降", startDate: "10月23-24日", icon: "🌫️", teaActivity: "茶园冬季养护开始，修剪茶树" },
        { name: "立冬", startDate: "11月7-8日", icon: "⛄", teaActivity: "茶事休整期，整理贮存今年茶叶" },
        { name: "小雪", startDate: "11月22-23日", icon: "🌨️", teaActivity: "茶园施肥，准备来年茶事" },
        { name: "大雪", startDate: "12月6-8日", icon: "❄️", teaActivity: "茶园防寒保护，宋代文人饮茶赏雪" },
        { name: "冬至", startDate: "12月21-23日", icon: "☃️", teaActivity: "冬至茶会，品尝陈年好茶" },
        { name: "小寒", startDate: "1月5-7日", icon: "🥶", teaActivity: "宋代茶人以茶会友，研讨茶艺" },
        { name: "大寒", startDate: "1月20-21日", icon: "❄️", teaActivity: "茶园保暖，准备迎接新一年茶事" }
    ];
    
    // 获取当前日期
    const now = new Date();
    const month = now.getMonth() + 1; // 月份从0开始
    const day = now.getDate();
    
    // 简单判断当前节气（实际应该用更精确的计算方法）
    let currentTerm;
    
    if ((month === 2 && day >= 3) || (month === 2 && day < 18)) {
        currentTerm = solarTerms[0]; // 立春
    } else if ((month === 2 && day >= 18) || (month === 3 && day < 5)) {
        currentTerm = solarTerms[1]; // 雨水
    } else if ((month === 3 && day >= 5) || (month === 3 && day < 20)) {
        currentTerm = solarTerms[2]; // 惊蛰
    } else if ((month === 3 && day >= 20) || (month === 4 && day < 4)) {
        currentTerm = solarTerms[3]; // 春分
    } else if ((month === 4 && day >= 4) || (month === 4 && day < 19)) {
        currentTerm = solarTerms[4]; // 清明
    } else if ((month === 4 && day >= 19) || (month === 5 && day < 5)) {
        currentTerm = solarTerms[5]; // 谷雨
    } else if ((month === 5 && day >= 5) || (month === 5 && day < 20)) {
        currentTerm = solarTerms[6]; // 立夏
    } else if ((month === 5 && day >= 20) || (month === 6 && day < 5)) {
        currentTerm = solarTerms[7]; // 小满
    } else if ((month === 6 && day >= 5) || (month === 6 && day < 21)) {
        currentTerm = solarTerms[8]; // 芒种
    } else if ((month === 6 && day >= 21) || (month === 7 && day < 6)) {
        currentTerm = solarTerms[9]; // 夏至
    } else if ((month === 7 && day >= 6) || (month === 7 && day < 22)) {
        currentTerm = solarTerms[10]; // 小暑
    } else if ((month === 7 && day >= 22) || (month === 8 && day < 7)) {
        currentTerm = solarTerms[11]; // 大暑
    } else if ((month === 8 && day >= 7) || (month === 8 && day < 22)) {
        currentTerm = solarTerms[12]; // 立秋
    } else if ((month === 8 && day >= 22) || (month === 9 && day < 7)) {
        currentTerm = solarTerms[13]; // 处暑
    } else if ((month === 9 && day >= 7) || (month === 9 && day < 22)) {
        currentTerm = solarTerms[14]; // 白露
    } else if ((month === 9 && day >= 22) || (month === 10 && day < 8)) {
        currentTerm = solarTerms[15]; // 秋分
    } else if ((month === 10 && day >= 8) || (month === 10 && day < 23)) {
        currentTerm = solarTerms[16]; // 寒露
    } else if ((month === 10 && day >= 23) || (month === 11 && day < 7)) {
        currentTerm = solarTerms[17]; // 霜降
    } else if ((month === 11 && day >= 7) || (month === 11 && day < 22)) {
        currentTerm = solarTerms[18]; // 立冬
    } else if ((month === 11 && day >= 22) || (month === 12 && day < 6)) {
        currentTerm = solarTerms[19]; // 小雪
    } else if ((month === 12 && day >= 6) || (month === 12 && day < 21)) {
        currentTerm = solarTerms[20]; // 大雪
    } else if ((month === 12 && day >= 21) || (month === 1 && day < 5)) {
        currentTerm = solarTerms[21]; // 冬至
    } else if ((month === 1 && day >= 5) || (month === 1 && day < 20)) {
        currentTerm = solarTerms[22]; // 小寒
    } else {
        currentTerm = solarTerms[23]; // 大寒
    }
    
    // 更新节气信息
    seasonalInfo.innerHTML = `
        <div class="seasonal-title">
            <span class="seasonal-icon">${currentTerm.icon}</span>
            <span class="seasonal-name">当前节气：${currentTerm.name} (${currentTerm.startDate})</span>
        </div>
        <div class="seasonal-activity">
            <strong>宋代茶事：</strong>${currentTerm.teaActivity}
        </div>
    `;
}

/**
 * 添加页面动画效果
 */
function addAnimationEffects() {
    // 监听滚动以触发淡入动画
    const fadeElements = document.querySelectorAll('.fade-in');
    const floatElements = document.querySelectorAll('.float-up');
    
    function checkScrollPosition() {
        const triggerPosition = window.innerHeight * 0.8;
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerPosition) {
                element.classList.add('visible');
            }
        });
        
        floatElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerPosition) {
                element.classList.add('visible');
            }
        });
    }
    
    // 初始检查
    checkScrollPosition();
    
    // 滚动时检查
    window.addEventListener('scroll', checkScrollPosition);
}

/**
 * 初始化视频播放器
 */
function initVideoPlayers() {
    const videoPlayers = document.querySelectorAll('.video-player');
    
    videoPlayers.forEach(player => {
        const video = player.querySelector('video');
        if (!video) return;
        
        // 设置视频预加载策略
        video.preload = 'metadata';
        
        // 添加视频加载事件监听
        video.addEventListener('loadedmetadata', function() {
            console.log('视频元数据已加载:', video.src);
            // 确保视频尺寸与容器匹配
            player.style.height = 'auto';
        });
        
        // 添加视频播放错误处理
        video.addEventListener('error', function() {
            console.error('视频加载失败:', video.src);
            // 显示错误信息
            const errorMessage = document.createElement('div');
            errorMessage.className = 'video-error';
            errorMessage.textContent = '视频加载失败，请刷新页面重试';
            player.appendChild(errorMessage);
        });
        
        // 添加播放完成事件处理
        video.addEventListener('ended', function() {
            console.log('视频播放完成:', video.src);
            // 可以在这里添加播放完成后的逻辑，比如显示重播按钮等
        });
    });
} 