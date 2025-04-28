from flask import Flask, render_template, jsonify, session, request, Response
import pandas as pd
import json
import logging
from pathlib import Path
import os
from flask_mysqldb import MySQL
import requests
from functools import lru_cache
import time

app = Flask(__name__)

# 配置密钥用于session
app.secret_key = os.urandom(24)

# MySQL配置
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '0909llll..'
app.config['MYSQL_DB'] = 'user_imformation'
mysql = MySQL(app)

# 将mysql实例添加到app.extensions中，以便在Blueprint中访问
app.extensions['mysql'] = mysql

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,  # 改为DEBUG级别以获取更多信息
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 配置静态文件目录
app.static_folder = 'static'

# 导入路由，避免循环导入问题
from routes import login_routes, register_routes, logout_route

# 注册Blueprint
app.register_blueprint(login_routes.bp)
app.register_blueprint(register_routes.bp)
app.register_blueprint(logout_route.bp)

# 全局数据缓存
_data_cache = None

# 创建数据库表函数
def create_tables():
    cur = None
    try:
        cur = mysql.connection.cursor()
        # 检查表是否存在
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL
            )
        ''')
        mysql.connection.commit()
        logger.info("数据库表创建成功")
    except Exception as e:
        logger.error(f"创建数据库表时出错: {str(e)}")
    finally:
        if cur:
            cur.close()

# 简化版JSON加载函数
def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"加载JSON文件失败 {path}: {str(e)}")
        return {}

# 简化版数据加载函数
def load_data():
    global _data_cache
    
    # 如果缓存存在，直接返回
    if _data_cache:
        logger.info("使用缓存数据")
        return _data_cache
    
    logger.info("加载数据开始...")
    try:
        data_dir = Path(__file__).parent / 'data'
        logger.debug(f"数据目录: {data_dir}, 是否存在: {os.path.exists(data_dir)}")

        # 初始化数据结构
        prices = []
        routes = {"nodes": [], "links": []}
        spread = {
            'title': "中华茶文化全球传播路线",
            'period': "7-19世纪",
            'data_source': "《丝绸之路考古纪年》+《海疆通志》",
            'nodes': [],
            'routes': [],
            'historical_events': []
        }
        song_production = []
        historical_tea_areas = {
            "title": "中国历史茶叶产区变迁与对比",
            "description": "从唐朝到现代的中国主要茶叶产区变化与特点对比",
            "dynasties": [],
            "comparison": {
                "area_expansion": "",
                "tea_types": "",
                "production_methods": "",
                "major_shifts": []
            },
            "visualization_data": {
                "map_coordinates": {}
            }
        }
        tea_process = []

        # 加载历史价格数据
        prices_file = data_dir / 'historical_prices.csv'
        if os.path.exists(prices_file):
            logger.debug(f"加载历史价格数据文件: {prices_file}")
            prices = pd.read_csv(prices_file, encoding='utf-8').to_dict('records')
            logger.info(f"成功加载历史价格数据: {len(prices)}条记录")

        # 加载茶道数据
        routes_file = data_dir / 'tea_routes.json'
        if os.path.exists(routes_file):
            logger.debug(f"加载茶道数据文件: {routes_file}")
            routes = load_json(routes_file)
            logger.info(f"成功加载茶道数据: {len(routes.get('nodes', []))}个节点")

        # 加载文化传播数据
        spread_file = data_dir / 'culture_spread.json'
        if os.path.exists(spread_file):
            logger.debug(f"加载文化传播数据文件: {spread_file}")
            spread = load_json(spread_file)

            # 保证基本字段存在
            spread.setdefault('title', "中华茶文化全球传播路线")
            spread.setdefault('period', "7-19世纪")
            spread.setdefault('data_source', "《丝绸之路考古纪年》+《海疆通志》")
            spread.setdefault('nodes', [])
            spread.setdefault('routes', [])
            spread.setdefault('historical_events', [])
            
            # 处理路线数据
            if 'processed_routes' not in spread and spread.get('routes'):
                processed_routes = []
                for route in spread.get('routes', []):
                    processed_route = {
                        'coords': route['path'],
                        'lineStyle': {
                            'color': '#7b8d6d',
                            'width': 2,
                            'curveness': 0.2
                        },
                        'effect': {
                            'show': True,
                            'period': 6,
                            'trailLength': 0.7,
                            'color': '#fff',
                            'symbolSize': 3
                        }
                    }
                    processed_routes.append(processed_route)

                spread['processed_routes'] = processed_routes

            logger.info(f"成功加载文化传播数据：{len(spread.get('nodes', []))}个节点，{len(spread.get('routes', []))}条路线")

        # 加载宋代茶叶生产数据
        song_file = data_dir / 'song_tea_production.csv'
        if os.path.exists(song_file):
            logger.debug(f"加载宋代茶叶生产数据文件: {song_file}")
            song_production = pd.read_csv(song_file, encoding='utf-8').to_dict('records')
            logger.info(f"成功加载宋代茶叶生产数据: {len(song_production)}条记录")
            
        # 加载茶工艺流程数据
        process_file = data_dir / 'tea_process.json'
        if os.path.exists(process_file):
            logger.debug(f"加载茶工艺流程数据文件: {process_file}")
            tea_process = load_json(process_file)
            logger.info(f"成功加载茶工艺流程数据: {len(tea_process)}个工序")

        # 加载历史茶叶产区数据
        areas_file = data_dir / 'historical_tea_areas.json'
        if os.path.exists(areas_file):
            logger.debug(f"加载历史茶叶产区数据文件: {areas_file}")
            historical_tea_areas = load_json(areas_file)

            # 处理地图数据
            visualization_data = historical_tea_areas.get('visualization_data', {})
            map_coordinates = visualization_data.get('map_coordinates', {})
            
            for dynasty_name, points in map_coordinates.items():
                for point in points:
                    # 从茶区数据中找到对应的茶类信息
                    for dynasty in historical_tea_areas.get('dynasties', []):
                        if dynasty['name'] == dynasty_name:
                            for area in dynasty['tea_areas']:
                                if area['region'] == point['name']:
                                    point['tea_types'] = '、'.join(area['tea_types'])
                                    break

            logger.info(f"成功加载历史茶叶产区数据: {len(historical_tea_areas.get('dynasties', []))}个朝代")

        # 保存到缓存
        _data_cache = {
            'prices': prices,
            'routes': routes,
            'spread': spread,
            'song_production': song_production,
            'historical_tea_areas': historical_tea_areas,
            'tea_process': tea_process
        }
        
        logger.info("所有数据加载完成")
        return _data_cache
    
    except Exception as e:
        logger.error(f"数据加载过程中发生错误: {str(e)}", exc_info=True)  # 添加异常堆栈信息
        # 返回一个基本的空数据结构，避免页面崩溃
        return {
            'prices': [],
            'routes': {"nodes": [], "links": []},
            'spread': {'nodes': [], 'routes': [], 'historical_events': []},
            'song_production': [],
            'historical_tea_areas': {},
            'tea_process': []
        }


# 数据预加载函数
def preload_data():
    """应用启动时预加载数据"""
    logger.info("开始预加载数据")
    try:
        # 直接调用load_data函数加载所有数据
        result = load_data()
        if result:
            logger.info("数据预加载成功")
        else:
            logger.error("数据预加载返回了空结果")
    except Exception as e:
        logger.error(f"数据预加载失败: {str(e)}", exc_info=True)


# 路由配置
@app.route('/')
def index():
    if 'name' not in session:
        return render_template('login.html')

    data = load_data()
    return render_template('index.html', price_data=data['prices'], user_name=session.get('name'))


@app.route('/trade_flow')
def trade_flow():
    if 'name' not in session:
        return render_template('login.html')

    data = load_data()
    return render_template('trade_flow.html',
                           nodes=json.dumps(data['routes']['nodes']),
                           links=json.dumps(data['routes']['links']),
                           user_name=session.get('name'))


@app.route('/song_production')
def song_production():
    if 'name' not in session:
        return render_template('login.html')

    data = load_data()
    # 使用从文件加载的茶工艺流程数据
    return render_template('production_process.html', process=data['tea_process'], user_name=session.get('name'))


@app.route('/culture_spread')
def culture_spread():
    if 'name' not in session:
        return render_template('login.html')

    data = load_data()
    if data is None or 'spread' not in data:
        logger.error("无法加载文化传播数据")
        return render_template('500.html'), 500

    logger.info("返回文化传播数据到模板")
    return render_template('culture_spread.html', spread_data=data['spread'], user_name=session.get('name'))


@app.route('/tea_policy')
def tea_policy():
    if 'name' not in session:
        return render_template('login.html')

    return render_template('tea_policy.html', user_name=session.get('name'))


@app.route('/ask', methods=['POST'])
def ask():
    question = request.get_json().get('question', '')
    if not question:
        return Response(json.dumps({"error": "问题不能为空"}), mimetype='application/json')

    return Response(generate_stream(question), mimetype='application/json')


def generate_stream(question):
    """生成流式API请求"""
    url = "https://spark-api-open.xf-yun.com/v1/chat/completions"
    headers = {
        "Authorization": "Bearer xbVfAtsErXfMhGzrRDAX:BqBjJTSElhuBuucFaAhw",
        "Content-Type": "application/json"
    }
    payload = {
        "max_tokens": 4096,
        "top_k": 4,
        "temperature": 0.5,
        "messages": [
            {"role": "system",
             "content": "你是一个茶文化专家，尤其精通茶马古道的历史、路线、文化影响等知识。请尽量提供详实、准确的回答。"},
            {"role": "user", "content": question}
        ],
        "model": "4.0Ultra",
        "stream": True  # 启用流式传输
    }

    try:
        with requests.post(url, headers=headers, json=payload, stream=True) as response:
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data:'):
                        json_data = json.loads(decoded_line[5:])
                        if 'choices' in json_data:
                            content = json_data['choices'][0]['delta'].get('content', '')
                            yield json.dumps({"content": content})
                        if json_data.get('choices')[0].get('finish_reason'):
                            yield json.dumps({"status": "done"})
    except Exception as e:
        yield json.dumps({"error": f"API请求失败: {str(e)}"})


@app.errorhandler(404)
def page_not_found(e):
    logger.warning(f"访问了不存在的页面: {e}")
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"服务器内部错误: {e}")
    return render_template('500.html'), 500


if __name__ == '__main__':
    # 在应用上下文中创建数据库表
    with app.app_context():
        try:
            create_tables()
            logger.info("数据库表创建/检查完成")
        except Exception as e:
            logger.error(f"数据库表创建失败: {str(e)}", exc_info=True)
    
    # 预加载数据
    try:
        logger.info("准备预加载数据...")
        preload_data()
        logger.info("预加载数据完成，准备启动应用")
    except Exception as e:
        logger.error(f"预加载数据过程中出错: {str(e)}", exc_info=True)
    
    # 启动Flask应用
    logger.info("应用启动中，监听端口9000...")
    app.run(debug=True, port=9000)
