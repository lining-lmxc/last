# 中华茶文化数字可视化平台

这是一个用Flask搭建的中华茶文化数字可视化平台，展示了茶价演变、茶马古道、宋茶工艺和茶文化传播等内容。

## 功能特点

- 用户注册和登录系统
- 茶价历史演变数据可视化
- 茶马古道交易流向展示
- 宋代茶叶生产工艺流程展示
- 中华茶文化全球传播路线地图
- 历代茶具演变历程展示

## 技术栈

- 后端：Python/Flask
- 前端：HTML/CSS/JavaScript/ECharts
- 数据库：MySQL

## 安装说明

1. 克隆仓库到本地：

```bash
git clone <仓库地址>
cd 项目
```

2. 创建并激活虚拟环境(可选)：

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

3. 安装依赖：

```bash
pip install -r requirements.txt
```

4. 配置数据库：

确保MySQL服务已运行，并创建名为`user_information`的数据库。应用将自动创建所需的表。

5. 运行应用：

```bash
python app.py
```

6. 访问应用：

在浏览器中访问 http://localhost:9000 即可看到应用界面。首次使用需要先注册账户。

## 项目结构

- `/data` - 存放数据文件
- `/routes` - 路由处理模块
- `/static` - 静态资源(CSS、JS、图片等)
- `/templates` - HTML模板文件
- `app.py` - 应用入口文件

## 数据来源

- 中国历代茶政文献数字工程
- 《丝绸之路考古纪年》
- 《海疆通志》

## 宋代团茶工艺展示页面

这个项目展示了宋代团茶的制作工艺，通过交互式界面呈现传统茶文化的精髓。

### 主要特色

1. **时间轴导航**
   - 采用横向滚动时间轴展示六大制茶步骤：
   - 🌿采茶 → 🍃蒸青 → 🌀研膏 → 🎴印模 → 🔥焙干 → 🍵封存
   - 点击任意步骤可跳转到详细介绍

2. **互动体验**
   - 蒸茶火候模拟器：拖动滑块控制蒸制温度，观察效果
   - 研茶体验：模拟研磨过程，可调节研磨力度
   - 茶饼纹样选择：切换龙纹和凤纹模具查看效果，包含动画和详细说明

3. **可视化展示**
   - 茶器博物馆：展示宋代茶具的历史与用途，可按类别筛选
   - 诗词弹幕墙：欣赏宋代茶诗，并可提交自己知道的诗句
   - 节气提示：根据当前时间显示宋代对应节气的茶事活动

### 设计理念

- **配色方案**：青瓷色 + 米白 + 茶褐色 + 金箔色，呈现宋代文化的典雅与质朴
- **交互风格**：轻量动效，保证流畅体验
- **内容深度**：结合历史文献与现代解读，展示宋代茶文化的精髓

## 中华茶文化传播路线地图

本项目通过交互式地图呈现中国茶文化在世界范围内的传播历程。

### 主要特色

1. **朝代选择器**
   - 支持唐、宋、元、明、清五个朝代的茶叶传播路线展示
   - 每个朝代都有其独特路线和历史背景

2. **动态路线展示**
   - 采用ECharts实现动态流线效果
   - 不同路线用不同颜色区分，并添加时间标签
   - 支持地图缩放和漫游，查看详细路线

3. **历史背景信息**
   - 每个朝代的茶叶传播重要历史事件
   - 关键路线和节点的详细说明
   - 茶文化交流对世界影响的介绍

4. **历代茶具演变**
   - 展示从唐代到清代的茶具发展历程
   - 每个朝代的代表性茶具图片和说明
   - 茶具与茶文化、茶道仪式的关联

### 技术实现

- 前端：HTML5 + CSS3 + JavaScript (ES6) + ECharts
- 后端：Python Flask
- 数据源：JSON配置文件（`data/culture_spread.json`）

### 目录结构

```
├── app.py                     # 主应用入口
├── data/
│   ├── tea_process.json       # 茶工艺流程数据
│   └── culture_spread.json    # 茶文化传播数据
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│       ├── teaware/           # 茶具图片
│       └── mold-dragon.jpg    # 模具图片
└── templates/
    ├── song_tea_process.html  # 宋代团茶工艺模板
    └── culture_spread.html    # 茶文化传播模板
```

## 主要第三方依赖包

1. **Flask** - Web框架
   - 核心库: `flask`
   - 扩展模块: `flask-mysqldb`（MySQL连接）

2. **数据库相关**
   - `flask-mysqldb` - Flask的MySQL连接扩展
   - `pymysql` - Python的MySQL客户端库(作为备选驱动)

3. **数据处理**
   - `pandas` - 数据分析和操作库

4. **安全相关**
   - `bcrypt` - 密码加密
   - `python-dotenv` - 环境变量管理（推测用于管理配置）

5. **HTTP请求**
   - `requests` - HTTP库，用于API调用

## Python标准库

1. **Web和数据**
   - `json` - JSON数据处理
   - `time` - 时间相关函数
   - `logging` - 日志记录
   - `functools` (lru_cache) - 缓存装饰器

2. **文件和系统**
   - `os` - 操作系统接口
   - `pathlib` (Path) - 面向对象的文件系统路径
   - `shutil` - 高级文件操作

## 建议的requirements.txt内容

```
flask==3.0.3
flask-mysqldb==1.0.1
pandas==2.2.3
bcrypt==4.2.1
python-dotenv==1.0.0
requests==2.32.3
pymysql==1.1.0 