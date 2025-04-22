/**
 * 茶叶信息动态横向滚动效果
 * 此脚本用于实现历代茶政要录中茶叶信息的动态横向移动更新效果
 */
document.addEventListener('DOMContentLoaded', function() {
    // 为每个dynasty-row添加动态滚动效果
    setupTeaScroll();
    
    // 调整茶砖块的尺寸和布局，使显示更加统一
    standardizeBricks();
    
    // 添加历史背景信息到页面顶部
    addDynastyIntroduction();
    
    // 添加视图控制按钮
    addViewControls();
});

/**
 * 设置茶叶信息的横向滚动
 */
function setupTeaScroll() {
    // 获取所有朝代行
    const dynastyRows = document.querySelectorAll('.dynasty-row');
    
    dynastyRows.forEach(row => {
        // 创建滚动容器（如果不存在）
        if (!row.querySelector('.tea-brick-container')) {
            // 获取所有砖块
            const bricks = Array.from(row.querySelectorAll('.tea-brick'));
            
            // 创建滚动容器
            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'tea-brick-container';
            
            // 移动原始砖块到容器
            bricks.forEach(brick => {
                scrollContainer.appendChild(brick);
            });
            
            // 复制砖块以实现无缝滚动
            bricks.forEach(brick => {
                const clone = brick.cloneNode(true);
                
                // 为克隆的砖块添加点击事件
                clone.addEventListener('click', function() {
                    // 查找原始砖块并触发点击
                    const originalBrick = bricks.find(b => b.dataset.year === this.dataset.year);
                    if (originalBrick) {
                        originalBrick.click();
                    }
                });
                
                scrollContainer.appendChild(clone);
            });
            
            // 将滚动容器添加到行
            row.appendChild(scrollContainer);
        }
    });
    
    // 添加CSS样式
    addScrollStyles();
}

/**
 * 标准化茶砖块的显示，使所有朝代的茶叶信息显示统一美观
 */
function standardizeBricks() {
    // 获取所有茶砖块
    const teaBricks = document.querySelectorAll('.tea-brick');
    
    // 朝代对应的色彩方案 - 使用传统中国色彩
    const dynastyColors = {
        '汉': { from: '#e8c8a9', to: '#f0e1d0' },  // 浅米色/象牙白
        '唐': { from: '#94653d', to: '#c19b76' },  // 唐代金色/木棕
        '宋': { from: '#5d513c', to: '#9e8d6d' },  // 宋代青灰/古铜
        '元': { from: '#7a7374', to: '#bdb8b9' },  // 青灰/铅白
        '明': { from: '#9e2a2b', to: '#e16a57' },  // 朱红/珊瑚红
        '清': { from: '#495e74', to: '#8fb2c9' }   // 青黛/靛蓝
    };
    
    teaBricks.forEach(brick => {
        // 设置固定宽度以保持一致性
        brick.style.minWidth = '200px';
        brick.style.width = '200px';
        
        // 根据朝代设置背景颜色
        const dynastyText = brick.querySelector('.dynasty');
        if (dynastyText) {
            const dynasty = dynastyText.textContent.replace('代', '');
            if (dynastyColors[dynasty]) {
                brick.style.background = `linear-gradient(135deg, ${dynastyColors[dynasty].from}, ${dynastyColors[dynasty].to})`;
                
                // 设置文字颜色为深色或白色，取决于背景色深浅
                const isLightBackground = getColorBrightness(dynastyColors[dynasty].from) > 128;
                const textColor = isLightBackground ? '#333333' : '#ffffff';
                
                const allTexts = brick.querySelectorAll('.tea-type, .dynasty, .year, .price');
                allTexts.forEach(el => {
                    el.style.color = textColor;
                });
            }
        }
        
        // 调整内部元素居中对齐
        const teaType = brick.querySelector('.tea-type');
        const dynasty = brick.querySelector('.dynasty');
        const year = brick.querySelector('.year');
        const price = brick.querySelector('.price');
        
        if (teaType) {
            teaType.style.textAlign = 'center';
            teaType.style.overflow = 'hidden';
            teaType.style.textOverflow = 'ellipsis';
            teaType.style.whiteSpace = 'nowrap';
            teaType.style.display = 'block';
            teaType.style.marginBottom = '10px';
            teaType.style.fontWeight = 'bold';
        }
        
        if (dynasty) {
            dynasty.style.textAlign = 'center';
            dynasty.style.marginBottom = '5px';
        }
        
        if (year) {
            year.style.textAlign = 'center';
            year.style.marginBottom = '5px';
        }
        
        if (price) {
            price.style.textAlign = 'center';
            price.style.marginTop = '10px';
            price.style.fontWeight = 'bold';
        }
    });
}

/**
 * 获取颜色亮度，用于判断应该使用深色还是浅色文字
 * @param {string} color - 颜色代码，如 #123456
 * @return {number} 亮度值 (0-255)
 */
function getColorBrightness(color) {
    // 去掉 # 前缀
    const hex = color.replace('#', '');
    
    // 解析 RGB 值
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 使用亮度公式: (0.299*R + 0.587*G + 0.114*B)
    return (0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * 添加朝代历史茶文化背景简介
 */
function addDynastyIntroduction() {
    // 获取历史背景容器
    const historyContainer = document.querySelector('.historical-context');
    if (!historyContainer) return;
    
    // 创建朝代简介容器
    const introContainer = document.createElement('div');
    introContainer.className = 'dynasty-intro-container';
    
    // 朝代茶文化简介
    const dynastyIntros = {
        '汉': '汉朝(公元前202年-公元220年)茶文化萌芽期，《神农本草经》首次将茶作为药物记载，"神农尝百草，日遇七十二毒，得茶而解之"。主要饮用方式为煮散茶。',
        '唐': '唐朝(618年-907年)茶文化形成期，陆羽著《茶经》成为世界首部茶叶专著，茶道兴起，饮茶之风从宫廷贵族蔓延至平民百姓，形成"文人品茗"风尚。',
        '宋': '宋朝(960年-1279年)茶文化鼎盛期，点茶法兴盛，龙凤团茶成为珍品，宋徽宗赵佶著《大观茶论》，斗茶成为风雅活动，建立专门茶市。',
        '元': '元朝(1271年-1368年)茶叶贸易转向民营，茶马贸易兴盛，饮茶习俗深入少数民族地区，散茶取代团茶，饮茶方式趋于简化。',
        '明': '明朝(1368年-1644年)茶叶制作革命，炒青工艺取代蒸青，散茶成为主流，筑品红茶开始外销，饮茶器具更加精美，文人雅士饮茶风尚更加普及。',
        '清': '清朝(1644年-1911年)茶叶品种更加多样化，工夫茶法兴起，茶馆盛行，六大茶类基本形成，茶叶对外贸易迅速发展，成为国家重要经济作物。'
    };
    
    // 添加标题
    const introTitle = document.createElement('h3');
    introTitle.className = 'dynasty-intro-title';
    introTitle.textContent = '历代茶文化背景';
    introContainer.appendChild(introTitle);
    
    // 创建朝代简介卡片
    Object.entries(dynastyIntros).forEach(([dynasty, intro]) => {
        const card = document.createElement('div');
        card.className = 'dynasty-intro-card';
        card.setAttribute('data-dynasty', dynasty);
        
        // 获取对应的朝代背景色
        const dynastyColors = {
            '汉': { from: '#e8c8a9', to: '#f0e1d0' },
            '唐': { from: '#94653d', to: '#c19b76' },
            '宋': { from: '#5d513c', to: '#9e8d6d' },
            '元': { from: '#7a7374', to: '#bdb8b9' },
            '明': { from: '#9e2a2b', to: '#e16a57' },
            '清': { from: '#495e74', to: '#8fb2c9' }
        };
        
        // 设置背景色
        if (dynastyColors[dynasty]) {
            card.style.background = `linear-gradient(135deg, ${dynastyColors[dynasty].from}, ${dynastyColors[dynasty].to})`;
            
            // 判断文字颜色
            const isLightBackground = getColorBrightness(dynastyColors[dynasty].from) > 128;
            card.style.color = isLightBackground ? '#333333' : '#ffffff';
        }
        
        // 添加内容
        card.innerHTML = `
            <h4>${dynasty}朝茶文化</h4>
            <p>${intro}</p>
        `;
        
        introContainer.appendChild(card);
        
        // 点击朝代简介卡片，滚动到对应朝代茶砖块区域
        card.addEventListener('click', () => {
            const targetLabel = Array.from(document.querySelectorAll('.dynasty-label')).find(
                label => label.textContent.includes(dynasty)
            );
            if (targetLabel) {
                targetLabel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // 高亮显示该朝代所有茶砖块
                highlightDynastyBricks(dynasty);
            }
        });
    });
    
    // 在砖块容器之前插入朝代简介
    const brickContainer = document.getElementById('brick-container');
    if (brickContainer) {
        historyContainer.insertBefore(introContainer, brickContainer);
    }
}

/**
 * 高亮显示特定朝代的所有茶砖块
 * @param {string} dynasty - 朝代名称
 */
function highlightDynastyBricks(dynasty) {
    // 重置所有茶砖块的动画状态
    document.querySelectorAll('.tea-brick-container').forEach(container => {
        container.style.animationPlayState = 'running';
    });
    
    // 获取特定朝代的所有行
    const dynastyRows = Array.from(document.querySelectorAll('.dynasty-row')).filter(row => {
        const bricks = row.querySelectorAll('.tea-brick');
        return bricks.length > 0 && bricks[0].querySelector('.dynasty').textContent.includes(dynasty);
    });
    
    // 暂停该朝代的滚动动画
    dynastyRows.forEach(row => {
        const container = row.querySelector('.tea-brick-container');
        if (container) {
            container.style.animationPlayState = 'paused';
        }
    });
    
    // 添加高亮效果
    const allBricks = document.querySelectorAll('.tea-brick');
    allBricks.forEach(brick => {
        brick.classList.remove('highlight');
        const brickDynasty = brick.querySelector('.dynasty');
        if (brickDynasty && brickDynasty.textContent.includes(dynasty)) {
            brick.classList.add('highlight');
            setTimeout(() => {
                brick.classList.remove('highlight');
            }, 2000);
        }
    });
}

/**
 * 添加视图控制按钮和茶价对比功能
 */
function addViewControls() {
    // 获取历史背景容器
    const historyContainer = document.querySelector('.historical-context');
    if (!historyContainer) return;
    
    // 创建视图控制容器
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'view-controls';
    
    // 创建视图切换按钮
    const buttons = [
        { id: 'all-view', text: '全部朝代', active: true, icon: '📜' },
        { id: 'compare-view', text: '朝代茶价对比', icon: '📊' },
        { id: 'time-view', text: '时间轴视图', icon: '⏳' }
    ];
    
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.id = button.id;
        btn.className = button.active ? 'view-btn active' : 'view-btn';
        
        // 创建按钮内容，添加图标和文本
        const btnContent = document.createElement('span');
        btnContent.innerHTML = `${button.icon} ${button.text}`;
        btn.appendChild(btnContent);
        
        // 添加点击事件
        btn.addEventListener('click', () => {
            // 如果按钮已经是活跃状态，不执行任何操作
            if (btn.classList.contains('active')) return;
            
            // 添加按钮点击效果
            btn.classList.add('btn-clicked');
            setTimeout(() => {
                btn.classList.remove('btn-clicked');
            }, 300);
            
            // 移除所有按钮的活跃状态，添加淡出效果
            document.querySelectorAll('.view-btn').forEach(b => {
                b.classList.remove('active');
                b.style.opacity = '0.7';
            });
            
            // 延迟添加当前按钮的活跃状态，添加淡入效果
            setTimeout(() => {
                btn.classList.add('active');
                document.querySelectorAll('.view-btn').forEach(b => {
                    b.style.opacity = '1';
                });
                
                // 根据按钮ID切换视图
                switchView(button.id);
            }, 150);
        });
        
        controlsContainer.appendChild(btn);
    });
    
    // 在朝代简介之前插入控制按钮
    const introContainer = document.querySelector('.dynasty-intro-container');
    if (introContainer) {
        historyContainer.insertBefore(controlsContainer, introContainer);
    }
    
    // 创建茶价对比容器（默认隐藏）
    const compareContainer = document.createElement('div');
    compareContainer.id = 'price-compare-container';
    compareContainer.className = 'price-compare-container';
    compareContainer.style.display = 'none';
    
    // 创建时间轴视图（默认隐藏）
    const timelineContainer = document.createElement('div');
    timelineContainer.id = 'timeline-container';
    timelineContainer.className = 'timeline-container';
    timelineContainer.style.display = 'none';
    
    // 将对比容器添加到页面
    historyContainer.appendChild(compareContainer);
    historyContainer.appendChild(timelineContainer);
}

/**
 * 切换不同的视图模式
 * @param {string} viewId - 视图的ID
 */
function switchView(viewId) {
    // 获取所有视图容器
    const brickContainer = document.getElementById('brick-container');
    const compareContainer = document.getElementById('price-compare-container');
    const timelineContainer = document.getElementById('timeline-container');
    const introContainer = document.querySelector('.dynasty-intro-container');
    
    // 定义淡入淡出的动画效果
    const fadeOut = (element) => {
        if (!element) return;
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    };
    
    const fadeIn = (element, displayType = 'block') => {
        if (!element) return;
        element.style.opacity = '0';
        element.style.display = displayType;
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.5s ease';
        }, 50);
    };
    
    // 先淡出所有容器
    if (brickContainer) fadeOut(brickContainer);
    if (compareContainer) fadeOut(compareContainer);
    if (timelineContainer) fadeOut(timelineContainer);
    if (introContainer) fadeOut(introContainer);
    
    // 延迟后淡入选中的容器
    setTimeout(() => {
        switch(viewId) {
            case 'all-view':
                if (brickContainer) fadeIn(brickContainer, 'flex');
                if (introContainer) fadeIn(introContainer, 'flex');
                break;
                
            case 'compare-view':
                if (compareContainer) {
                    fadeIn(compareContainer);
                    createPriceCompareView();
                }
                break;
                
            case 'time-view':
                if (timelineContainer) {
                    fadeIn(timelineContainer);
                    createTimelineView();
                }
                break;
        }
    }, 350);
}

/**
 * 创建朝代茶价对比视图
 */
function createPriceCompareView() {
    // 获取价格数据
    var priceData = window.priceData || [];
    if (!priceData || priceData.length === 0) return;
    
    // 获取容器
    const container = document.getElementById('price-compare-container');
    if (!container) return;
    
    // 如果已经创建过，不再重复创建
    if (container.innerHTML !== '') return;
    
    // 按朝代分组计算平均价格
    const dynastyPrices = {};
    const dynastyColors = {
        '汉': '#e8c8a9',
        '唐': '#94653d',
        '宋': '#5d513c',
        '元': '#7a7374',
        '明': '#9e2a2b',
        '清': '#495e74'
    };
    
    priceData.forEach(item => {
        if (!dynastyPrices[item.dynasty]) {
            dynastyPrices[item.dynasty] = { totalPrice: 0, count: 0, teaTypes: {} };
        }
        
        dynastyPrices[item.dynasty].totalPrice += parseFloat(item.price_liang);
        dynastyPrices[item.dynasty].count++;
        
        // 记录每种茶叶的价格
        if (!dynastyPrices[item.dynasty].teaTypes[item.tea_type]) {
            dynastyPrices[item.dynasty].teaTypes[item.tea_type] = {
                totalPrice: 0,
                count: 0
            };
        }
        
        dynastyPrices[item.dynasty].teaTypes[item.tea_type].totalPrice += parseFloat(item.price_liang);
        dynastyPrices[item.dynasty].teaTypes[item.tea_type].count++;
    });
    
    // 计算朝代平均价格
    Object.keys(dynastyPrices).forEach(dynasty => {
        dynastyPrices[dynasty].avgPrice = dynastyPrices[dynasty].totalPrice / dynastyPrices[dynasty].count;
        
        // 计算每种茶的平均价格
        Object.keys(dynastyPrices[dynasty].teaTypes).forEach(teaType => {
            const teaData = dynastyPrices[dynasty].teaTypes[teaType];
            teaData.avgPrice = teaData.totalPrice / teaData.count;
        });
    });
    
    // 创建朝代茶价对比标题
    const title = document.createElement('h3');
    title.className = 'compare-title';
    title.textContent = '历代茶叶平均价格对比';
    container.appendChild(title);
    
    // 创建朝代价格图表
    const chartContainer = document.createElement('div');
    chartContainer.className = 'price-chart-container';
    
    // 创建朝代平均价格图表
    const avgChartDiv = document.createElement('div');
    avgChartDiv.className = 'chart-item';
    avgChartDiv.style.height = '400px';
    chartContainer.appendChild(avgChartDiv);
    
    // 创建常见茶类横向价格对比图表
    const teaTypeChartDiv = document.createElement('div');
    teaTypeChartDiv.className = 'chart-item';
    teaTypeChartDiv.style.height = '400px';
    chartContainer.appendChild(teaTypeChartDiv);
    
    container.appendChild(chartContainer);
    
    // 初始化平均价格图表
    const avgChart = echarts.init(avgChartDiv);
    const avgOption = {
        title: {
            text: '各朝代茶叶平均价格',
            left: 'center',
            textStyle: { 
                color: '#8B4513',
                fontSize: 18
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c} 两/斤'
        },
        xAxis: {
            type: 'category',
            data: Object.keys(dynastyPrices),
            axisLabel: {
                color: '#666'
            }
        },
        yAxis: {
            type: 'value',
            name: '价格(两/斤)',
            nameTextStyle: {
                color: '#666'
            }
        },
        series: [{
            data: Object.keys(dynastyPrices).map(dynasty => ({
                value: dynastyPrices[dynasty].avgPrice.toFixed(1),
                itemStyle: {
                    color: dynastyColors[dynasty]
                }
            })),
            type: 'bar',
            barWidth: '50%',
            label: {
                show: true,
                position: 'top',
                formatter: '{c} 两'
            }
        }]
    };
    avgChart.setOption(avgOption);
    
    // 收集所有茶类及其在不同朝代的价格
    const teaTypes = new Set();
    Object.values(dynastyPrices).forEach(dynastyData => {
        Object.keys(dynastyData.teaTypes).forEach(teaType => {
            teaTypes.add(teaType);
        });
    });
    
    // 选择一些常见的茶类进行对比 (最多5种)
    const commonTeaTypes = Array.from(teaTypes).filter(tea => {
        let dynastyCount = 0;
        Object.values(dynastyPrices).forEach(dynastyData => {
            if (dynastyData.teaTypes[tea]) dynastyCount++;
        });
        return dynastyCount >= 2;  // 至少在两个朝代都有记录
    }).slice(0, 5);
    
    // 准备茶类对比数据
    const teaTypeData = commonTeaTypes.map(teaType => {
        return {
            name: teaType,
            type: 'bar',
            data: Object.keys(dynastyPrices).map(dynasty => {
                return dynastyPrices[dynasty].teaTypes[teaType] 
                    ? dynastyPrices[dynasty].teaTypes[teaType].avgPrice.toFixed(1) 
                    : 0;
            })
        };
    });
    
    // 初始化茶类价格对比图表
    const teaTypeChart = echarts.init(teaTypeChartDiv);
    const teaTypeOption = {
        title: {
            text: '常见茶叶在各朝代价格对比',
            left: 'center',
            textStyle: { 
                color: '#8B4513',
                fontSize: 18
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                let result = params[0].name + '<br/>';
                params.forEach(param => {
                    if (param.value > 0) {
                        result += param.seriesName + ': ' + param.value + ' 两/斤<br/>';
                    }
                });
                return result;
            }
        },
        legend: {
            data: commonTeaTypes,
            bottom: 0
        },
        xAxis: {
            type: 'category',
            data: Object.keys(dynastyPrices),
            axisLabel: {
                color: '#666'
            }
        },
        yAxis: {
            type: 'value',
            name: '价格(两/斤)',
            nameTextStyle: {
                color: '#666'
            }
        },
        series: teaTypeData
    };
    teaTypeChart.setOption(teaTypeOption);
    
    // 调整大小
    window.addEventListener('resize', function() {
        avgChart.resize();
        teaTypeChart.resize();
    });
}

/**
 * 创建时间轴视图
 */
function createTimelineView() {
    // 获取价格数据
    var priceData = window.priceData || [];
    if (!priceData || priceData.length === 0) return;
    
    // 获取容器
    const container = document.getElementById('timeline-container');
    if (!container) return;
    
    // 如果已经创建过，不再重复创建
    if (container.innerHTML !== '') return;
    
    // 创建时间轴标题
    const title = document.createElement('h3');
    title.className = 'timeline-title';
    title.textContent = '茶叶价格发展时间轴';
    container.appendChild(title);
    
    // 创建时间轴容器
    const timelineDiv = document.createElement('div');
    timelineDiv.className = 'timeline-chart';
    timelineDiv.style.height = '600px';
    container.appendChild(timelineDiv);
    
    // 初始化时间轴图表
    const timelineChart = echarts.init(timelineDiv);
    
    // 按朝代和年份排序数据
    const sortedData = [...priceData].sort((a, b) => {
        return parseInt(a.year) - parseInt(b.year);
    });
    
    // 准备数据
    const timelineOption = {
        baseOption: {
            timeline: {
                axisType: 'category',
                autoPlay: true,
                playInterval: 2000,
                loop: true,
                data: ['汉', '唐', '宋', '元', '明', '清'],
                label: {
                    formatter: '{value}朝'
                },
                checkpointStyle: {
                    color: '#8B4513',
                    borderWidth: 2
                },
                controlStyle: {
                    showPlayBtn: true,
                    showPrevBtn: true,
                    showNextBtn: true,
                    color: '#8B4513',
                    borderColor: '#8B4513'
                }
            },
            title: {
                text: '历代茶价演变时间轴',
                subtext: '从汉朝到清朝的茶叶价格变化',
                left: 'center',
                textStyle: { 
                    color: '#8B4513',
                    fontSize: 20
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const param = params[0];
                    return `${param.name}年<br/>${param.seriesName}: ${param.value} 两/斤`;
                }
            },
            legend: {
                data: ['茶叶价格'],
                right: 10,
                top: 30
            },
            xAxis: {
                type: 'category',
                name: '年份',
                nameLocation: 'end',
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value',
                name: '价格(两/斤)',
                nameLocation: 'end'
            },
            series: [{
                name: '茶叶价格',
                type: 'line',
                symbol: 'circle',
                symbolSize: 10,
                lineStyle: {
                    width: 2
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                markLine: {
                    silent: true,
                    lineStyle: {
                        color: '#999'
                    },
                    data: [{
                        type: 'average',
                        name: '平均价格'
                    }]
                }
            }]
        },
        options: [
            // 汉朝数据
            createDynastyOption('汉', sortedData),
            // 唐朝数据
            createDynastyOption('唐', sortedData),
            // 宋朝数据
            createDynastyOption('宋', sortedData),
            // 元朝数据
            createDynastyOption('元', sortedData),
            // 明朝数据
            createDynastyOption('明', sortedData),
            // 清朝数据
            createDynastyOption('清', sortedData)
        ]
    };
    
    timelineChart.setOption(timelineOption);
    
    // 调整大小
    window.addEventListener('resize', function() {
        timelineChart.resize();
    });
}

/**
 * 创建每个朝代的数据选项
 * @param {string} dynasty - 朝代名称
 * @param {Array} data - 价格数据
 * @returns {Object} - 朝代数据选项
 */
function createDynastyOption(dynasty, data) {
    // 过滤该朝代的数据
    const dynastyData = data.filter(item => item.dynasty === dynasty);
    
    // 获取朝代的年份和价格
    const years = dynastyData.map(item => item.year);
    const prices = dynastyData.map(item => ({
        value: item.price_liang,
        teaType: item.tea_type,
        source: item.source
    }));
    
    // 设置朝代颜色
    const dynastyColors = {
        '汉': '#e8c8a9',
        '唐': '#94653d',
        '宋': '#5d513c',
        '元': '#7a7374',
        '明': '#9e2a2b',
        '清': '#495e74'
    };
    
    return {
        title: {
            text: `${dynasty}朝茶叶价格变化`,
            subtext: `${years[0]} - ${years[years.length-1]}年`
        },
        visualMap: {
            show: false,
            min: Math.min(...dynastyData.map(item => parseFloat(item.price_liang))),
            max: Math.max(...dynastyData.map(item => parseFloat(item.price_liang))),
            inRange: {
                color: ['#ddc492', dynastyColors[dynasty]]
            }
        },
        xAxis: {
            data: years
        },
        series: [{
            data: prices,
            itemStyle: {
                color: dynastyColors[dynasty]
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: dynastyColors[dynasty] + 'AA'
                    }, {
                        offset: 1,
                        color: dynastyColors[dynasty] + '22'
                    }]
                }
            }
        }]
    };
}

/**
 * 添加滚动所需的CSS样式
 */
function addScrollStyles() {
    // 检查是否已经添加了样式
    if (document.getElementById('tea-scroll-styles')) {
        return;
    }
    
    // 创建样式元素
    const styleEl = document.createElement('style');
    styleEl.id = 'tea-scroll-styles';
    styleEl.textContent = `
        .dynasty-row {
            overflow-x: hidden !important;
            position: relative !important;
            padding: 10px 0 !important;
            margin-bottom: 25px !important;
        }
        
        .tea-brick-container {
            display: flex;
            gap: 20px;
            min-width: 100%;
            animation: scrollBricks 40s linear infinite;
            padding: 5px 0;
        }
        
        @keyframes scrollBricks {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        
        .dynasty-row:hover .tea-brick-container {
            animation-play-state: paused;
        }
        
        .tea-brick {
            flex: 0 0 200px !important;
            min-width: 200px !important;
            height: 140px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            padding: 15px !important;
            box-sizing: border-box !important;
            transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s !important;
            position: relative;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15) !important;
            border-radius: 10px !important;
        }
        
        .tea-brick:hover {
            transform: translateY(-8px) !important;
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2) !important;
            z-index: 5 !important;
        }
        
        .tea-brick.active {
            transform: translateY(-8px) scale(1.05) !important;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25) !important;
            z-index: 10 !important;
        }
        
        .tea-brick.highlight {
            animation: pulse 0.6s infinite alternate;
            z-index: 5 !important;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
        }
        
        .tea-brick .tea-type {
            font-size: 18px !important;
            font-weight: bold !important;
            margin-bottom: 12px !important;
            text-align: center !important;
            width: 100% !important;
        }
        
        .tea-brick .dynasty, .tea-brick .year {
            margin-bottom: 5px !important;
            text-align: center !important;
            width: 100% !important;
        }
        
        .tea-brick .price {
            margin-top: 12px !important;
            text-align: center !important;
            width: 100% !important;
            font-weight: bold !important;
        }
        
        .dynasty-label {
            margin-bottom: 15px !important;
            padding-bottom: 5px !important;
            font-size: 24px !important;
            color: #8B4513 !important;
            border-bottom: 2px solid #D2B48C !important;
        }
        
        /* 朝代介绍样式 */
        .dynasty-intro-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 30px;
            padding: 0 20px;
        }
        
        .dynasty-intro-title {
            width: 100%;
            color: #8B4513;
            font-size: 22px;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #D2B48C;
        }
        
        .dynasty-intro-card {
            flex: 1 1 calc(33.333% - 15px);
            min-width: 300px;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .dynasty-intro-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .dynasty-intro-card h4 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .dynasty-intro-card p {
            margin: 0;
            line-height: 1.5;
        }
        
        @media (max-width: 768px) {
            .dynasty-intro-card {
                flex: 1 1 100%;
            }
        }
    `;
    
    // 添加到文档头部
    document.head.appendChild(styleEl);
} 