# 中华茶文化数字可视化平台

这是一个用Flask搭建的中华茶文化数字可视化平台，展示了茶价演变、茶马古道、宋茶工艺和茶文化传播等内容。

## 功能特点

- 用户注册和登录系统
- 茶价历史演变数据可视化
- 茶马古道交易流向展示
- 宋代茶叶生产工艺流程展示
- 中华茶文化全球传播路线地图

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

在浏览器中访问 http://localhost:5000 即可看到应用界面。首次使用需要先注册账户。

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