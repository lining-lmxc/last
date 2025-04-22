from flask import Flask, render_template, jsonify, session, request, Response
import pandas as pd
import json
import logging
from pathlib import Path
import os
from flask_mysqldb import MySQL
import requests

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
    level=logging.INFO,
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


# 数据加载函数
def load_data():
    try:
        data_dir = Path(__file__).parent / 'data'

        # 加载历史价格数据
        try:
            prices = pd.read_csv(data_dir / 'historical_prices.csv', encoding='utf-8').to_dict('records')
            logger.info("成功加载历史价格数据")
        except Exception as e:
            logger.error(f"加载历史价格数据失败: {str(e)}")
            prices = []

        # 加载茶道数据
        try:
            routes = load_json(data_dir / 'tea_routes.json')
            logger.info("成功加载茶道数据")
        except Exception as e:
            logger.error(f"加载茶道数据失败: {str(e)}")
            routes = {"nodes": [], "links": []}

        # 加载文化传播数据
        try:
            spread = load_json(data_dir / 'culture_spread.json')

            # 确保spread数据包含所有必要的字段
            if 'title' not in spread:
                spread['title'] = "中华茶文化全球传播路线"
            if 'period' not in spread:
                spread['period'] = "7-19世纪"
            if 'data_source' not in spread:
                spread['data_source'] = "《丝绸之路考古纪年》+《海疆通志》"
            if 'nodes' not in spread:
                spread['nodes'] = []
            if 'routes' not in spread:
                spread['routes'] = []
            if 'historical_events' not in spread:
                spread['historical_events'] = []

            # 处理路线数据
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

            logger.info(
                f"成功加载文化传播数据：{len(spread.get('nodes', []))}个节点，{len(spread.get('routes', []))}条路线")
        except Exception as e:
            logger.error(f"加载文化传播数据失败: {str(e)}")
            spread = {
                'title': "中华茶文化全球传播路线",
                'period': "7-19世纪",
                'data_source': "《丝绸之路考古纪年》+《海疆通志》",
                'nodes': [],
                'routes': [],
                'historical_events': []
            }

        # 加载宋代茶叶生产数据
        try:
            song_production = pd.read_csv(data_dir / 'song_tea_production.csv', encoding='utf-8').to_dict('records')
            logger.info("成功加载宋代茶叶生产数据")
        except Exception as e:
            logger.error(f"加载宋代茶叶生产数据失败: {str(e)}")
            song_production = []
            
        # 加载历史茶叶产区数据
        try:
            historical_tea_areas = load_json(data_dir / 'historical_tea_areas.json')
            
            # 处理地图数据，为每个点添加茶类信息
            for dynasty_name, points in historical_tea_areas.get('visualization_data', {}).get('map_coordinates', {}).items():
                for point in points:
                    # 从茶区数据中找到对应的茶类信息
                    for dynasty in historical_tea_areas.get('dynasties', []):
                        if dynasty['name'] == dynasty_name:
                            for area in dynasty['tea_areas']:
                                if area['region'] == point['name']:
                                    point['tea_types'] = '、'.join(area['tea_types'])
                                    break
            
            logger.info("成功加载历史茶叶产区数据")
        except Exception as e:
            logger.error(f"加载历史茶叶产区数据失败: {str(e)}")
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

        return {
            'prices': prices,
            'routes': routes,
            'spread': spread,
            'song_production': song_production,
            'historical_tea_areas': historical_tea_areas
        }
    except Exception as e:
        logger.error(f"数据加载过程中发生错误: {str(e)}")
        return None


def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"加载JSON文件失败 {path}: {str(e)}")
        return {}


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
    
    # 创建宋代茶工艺流程数据
    tea_process = [
        {
            "step": 1,
            "name": "采茶",
            "duration": "谷雨至立夏期间",
            "tool": "竹篮、茶剪",
            "source": "《茶经》",
            "ancient_text": "凡造者，以二月、三月采之，蒸之，捣之，拍之，焙之，穿之，封之。",
            "details": "采摘嫩芽，选取一芽一叶或一芽二叶，要求鲜嫩、无损伤。采摘时间通常在清晨露水未干时进行，以保持新鲜度。",
            "analysis": "现代采茶更注重标准化和效率，使用专业茶剪，而宋代则主要靠手工采摘，更强调时辰与节气的配合。"
        },
        {
            "step": 2,
            "name": "蒸青",
            "duration": "约半个时辰",
            "tool": "蒸笼、火灶",
            "source": "《大观茶论》",
            "ancient_text": "既莫论燔煮蒸，蒸之中火候，既蒸讫，宜急覆以帛，收其香也。",
            "details": "将鲜叶放入蒸笼中，用文火蒸制，使叶色变青，破坏酶的活性，防止发酵。蒸后立即覆盖保持香气。",
            "analysis": "宋代特别讲究火候掌握，而现代多使用机械化蒸青设备，温度湿度更精确可控。"
        },
        {
            "step": 3,
            "name": "研膏",
            "duration": "数个时辰",
            "tool": "石臼、木杵",
            "source": "《茶录》",
            "ancient_text": "捣之既烂，复蒸之，蒸之既热，复捣之，凡七蒸七捣，色与膏并进。",
            "details": "蒸青后的茶叶在石臼中用木杵捣烂，形成茶膏，需经过七蒸七捣的过程，使茶叶充分软化。",
            "analysis": "此工序是宋代团茶的独特工艺，现代绿茶工艺已基本不使用此法，而以揉捻取代。"
        },
        {
            "step": 4,
            "name": "印模",
            "duration": "约一个时辰",
            "tool": "龙凤茶模、茶印",
            "source": "《东溪试茶录》",
            "ancient_text": "既捣既蒸，又复研之使细，然后入以茶模，印以龙凤花草之形。",
            "details": "将茶膏置于精美的茶模中，压制成各种图案，如龙凤、花草等形状，制成饼状团茶。",
            "analysis": "宋代团茶的艺术性极高，视为艺术品，而现代多为散茶，即使压制成饼也多为实用功能考量。"
        },
        {
            "step": 5,
            "name": "焙干",
            "duration": "三至五日",
            "tool": "炭火、焙笼",
            "source": "《宣和北苑贡茶录》",
            "ancient_text": "既以龙凤印成，慢火焙之，三日五日，视其干湿而已。",
            "details": "将成型的团茶放入焙笼，用文火慢慢烘焙，根据干湿程度调整时间，直至完全干燥。",
            "analysis": "宋代焙火技术讲究\"文火慢焙\"，现代则多用机械烘干，温度控制更精准但少了手工艺术感。"
        }
    ]
    
    return render_template('production_process.html', process=tea_process, user_name=session.get('name'))


@app.route('/culture_spread')
def culture_spread():
    if 'name' not in session:
        return render_template('login.html')

    data = load_data()
    if data is None or 'spread' not in data:
        logger.error("无法加载文化传播数据")
        return render_template('500.html'), 500

    logger.info(
        f"传递文化传播数据到模板：{len(data['spread'].get('nodes', []))}个节点，{len(data['spread'].get('routes', []))}条路线")
    return render_template('culture_spread.html', spread_data=data['spread'], user_name=session.get('name'))


@app.route('/production_area')
def production_area():
    if 'name' not in session:
        return render_template('login.html')
    
    data = load_data()
    if data is None or 'historical_tea_areas' not in data:
        logger.error("无法加载历史茶叶产区数据")
        return render_template('500.html'), 500
        
    return render_template('production_area.html', 
                          tea_areas_data=data['historical_tea_areas'], 
                          user_name=session.get('name'))


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
        create_tables()
    app.run(debug=True, port=5000)
