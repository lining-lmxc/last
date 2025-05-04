// 茶饼压制模拟器功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化茶饼压制互动功能
    initTeaPressingSimulation();
    
    // 初始化生产流程时间线
    initProductionTimeline();
    
    // 初始化画廊查看器
    initGalleryViewer();
    
    // 初始化页面滚动动画
    initScrollAnimations();
});

// 茶饼压制模拟器
function initTeaPressingSimulation() {
    const startButton = document.getElementById('startPressBtn');
    if (!startButton) return;
    
    const pressTop = document.querySelector('.press-top');
    const teaLeaves = document.querySelector('.tea-leaves');
    const teaCake = document.querySelector('.tea-cake');
    const gaugeFill = document.querySelector('.gauge-fill');
    const gaugeValue = document.querySelector('.gauge-value');
    const progressFill = document.querySelector('.progress-fill');
    const progressStatus = document.querySelector('.progress-status');
    
    let isPressing = false;
    let pressProgress = 0;
    let pressureLevel = 0;
    
    // 当点击开始按钮时
    startButton.addEventListener('click', function() {
        if (isPressing) return;
        
        // 重置状态
        resetPressSimulation();
        
        // 开始压制过程
        isPressing = true;
        startButton.disabled = true;
        startButton.textContent = '正在压制...';
        progressStatus.textContent = '正在准备茶叶...';
        
        // 模拟压制过程
        simulatePressing();
    });
    
    // 重置模拟器状态
    function resetPressSimulation() {
        pressTop.style.transform = 'translateX(-50%)';
        teaLeaves.style.height = '140px';
        teaCake.classList.remove('visible');
        gaugeFill.style.width = '0%';
        gaugeValue.textContent = '0%';
        progressFill.style.width = '0%';
        progressStatus.textContent = '准备就绪';
        pressProgress = 0;
        pressureLevel = 0;
    }
    
    // 模拟压制过程
    function simulatePressing() {
        const totalSteps = 100;
        const interval = 100; // 每100毫秒更新一次
        
        const pressInterval = setInterval(() => {
            pressProgress += 1;
            
            // 更新进度条
            progressFill.style.width = `${pressProgress}%`;
            
            // 根据进度更新不同阶段的显示
            updatePressingStage(pressProgress);
            
            // 更新压力值
            if (pressProgress <= 70) {
                pressureLevel = Math.min(100, Math.floor(pressProgress * 1.4));
                gaugeFill.style.width = `${pressureLevel}%`;
                gaugeValue.textContent = `${pressureLevel}%`;
            }
            
            // 压制完成
            if (pressProgress >= totalSteps) {
                clearInterval(pressInterval);
                finishPressing();
            }
        }, interval);
    }
    
    // 根据进度更新不同阶段的显示
    function updatePressingStage(progress) {
        if (progress < 20) {
            // 准备阶段
            progressStatus.textContent = '正在准备茶叶...';
        } else if (progress < 40) {
            // 加热蒸汽阶段
            progressStatus.textContent = '加热蒸汽，软化茶叶...';
        } else if (progress < 60) {
            // 开始压制
            progressStatus.textContent = '开始压制茶叶...';
            const topPosition = 50 + (progress - 40) * 1.5;
            pressTop.style.transform = `translateX(-50%) translateY(${topPosition - 50}px)`;
            teaLeaves.style.height = `${140 - (progress - 40) * 2}px`;
        } else if (progress < 80) {
            // 持续压制
            progressStatus.textContent = '持续施加压力...';
            const topPosition = 80;
            pressTop.style.transform = `translateX(-50%) translateY(${topPosition - 50}px)`;
            teaLeaves.style.height = `${80 - (progress - 60) * 1.5}px`;
        } else {
            // 完成压制
            progressStatus.textContent = '压制完成，冷却中...';
            pressTop.style.transform = `translateX(-50%) translateY(${80 - 50}px)`;
            teaLeaves.style.height = `${50 - (progress - 80) * 0.5}px`;
        }
    }
    
    // 完成压制过程
    function finishPressing() {
        isPressing = false;
        startButton.disabled = false;
        startButton.textContent = '开始新的压制';
        
        // 显示茶饼
        setTimeout(() => {
            teaLeaves.style.height = '0';
            teaCake.classList.add('visible');
            progressStatus.textContent = '茶饼压制成功！';
        }, 500);
    }
}

// 初始化生产流程时间线
function initProductionTimeline() {
    const steps = document.querySelectorAll('.process-step');
    if (steps.length === 0) return;
    
    // 使步骤图标可点击
    steps.forEach(step => {
        // 确保步骤点击区域包含整个步骤
        step.style.cursor = 'pointer';
        
        const icon = step.querySelector('.step-icon');
        if (icon) {
            icon.style.cursor = 'pointer';
        }
    });
    
    // 添加动画效果，每个步骤依次高亮显示
    let delay = 500;
    steps.forEach((step, index) => {
        setTimeout(() => {
            const icon = step.querySelector('.step-icon');
            if (icon) {
                icon.classList.add('highlighted');
                
                // 移除上一个步骤的高亮效果（保持最后一个高亮）
                if (index > 0 && index < steps.length - 1) {
                    setTimeout(() => {
                        const prevIcon = steps[index - 1].querySelector('.step-icon');
                        if (prevIcon) {
                            prevIcon.classList.remove('highlighted');
                        }
                    }, 1000);
                }
            }
        }, delay * (index + 1));
    });
    
    // 点击步骤时添加高亮效果
    steps.forEach(step => {
        step.addEventListener('click', function() {
            // 移除所有高亮
            steps.forEach(s => {
                const icon = s.querySelector('.step-icon');
                if (icon) icon.classList.remove('highlighted');
            });
            
            // 添加当前步骤高亮
            const icon = step.querySelector('.step-icon');
            if (icon) icon.classList.add('highlighted');
            
            // 滚动到这个步骤的详细描述（如果有的话）
            const stepName = step.querySelector('h3').textContent;
            const detailSection = document.querySelector(`[data-step="${stepName}"]`);
            if (detailSection) {
                detailSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// 画廊图片查看器
function initGalleryViewer() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;
    
    // 实现图片点击放大效果
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const imgAlt = this.querySelector('img').alt || '茶叶生产工艺图';
            
            const modal = document.createElement('div');
            modal.className = 'gallery-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <img src="${imgSrc}" alt="${imgAlt}">
                    <div class="modal-caption">${imgAlt}</div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 添加关闭功能
            modal.querySelector('.close-modal').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // 点击模态框背景关闭
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
            
            // 按ESC键关闭
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.querySelector('.gallery-modal')) {
                    document.body.removeChild(modal);
                }
            });
        });
    });
}

// 页面滚动效果
function initScrollAnimations() {
    // 初始检查
    checkElementsInViewport();
    
    // 滚动时检查
    window.addEventListener('scroll', checkElementsInViewport);
    
    function checkElementsInViewport() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.75) {
                section.classList.add('visible');
            }
        });
        
        // 检查所有带有fade-in类的元素
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.85) {
                element.classList.add('visible');
            }
        });
    }
} 