from flask import Flask, render_template, jsonify, session
import pandas as pd
import json
import logging
from pathlib import Path
import os
from flask_mysqldb import MySQL

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
            
            # 记录日志
            logger.info(f"成功加载文化传播数据：{len(spread.get('nodes', []))}个节点，{len(spread.get('routes', []))}条路线")
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

        return {
            'prices': prices,
            'routes': routes,
            'spread': spread,
            'song_production': song_production,
            'process': [
                {
                    "step": 1, 
                    "name": "采茶", 
                    "duration": "清晨至午前", 
                    "tool": "金花银篓",
                    "ancient_text": "撷茶以黎明，见日则止。用爪断芽，不以指揉，虑气汗熏渍，茶不鲜洁。",
                    "source": "宋徽宗《大观茶论》",
                    "details": "宋代采茶严格遵循时令，多在清明前后，清晨露水未干时进行。采茶工(多为妇女)须净手、漱口、着素服，选取一芽一叶或一芽二叶，指甲不可触及芽叶以免损伤。采摘后置于金花银篓内(实为精致竹篓，因其工艺精美如金银而得名)，注意通风避光。采茶讲究'宁少勿多，宁嫩勿老'，以保证茶叶品质。",
                    "analysis": "古今对比可见，宋代的采茶工艺与现代高级茶叶采摘有诸多相似之处。宋人讲究在日出前采茶，避免阳光直射影响茶叶鲜嫩度，今日名茶产区仍保持此传统。宋代使用指甲而非指腹采茶，是为了避免手部汗液与茶叶接触，保持茶叶清洁，此做法在现代高档茶生产中亦有沿用，但现代茶农通常戴手套以确保卫生。宋代'金花银篓'的精细工艺精神在现代也体现为对茶叶初级处理器具的高标准要求。"
                },
                {
                    "step": 2, 
                    "name": "蒸青", 
                    "duration": "三蒸三晾", 
                    "tool": "青铜甑釜",
                    "ancient_text": "蒸太生则芽滑，色清而味烈；过熟则芽烂，茶色赤而不胶。",
                    "source": "《大观茶论》",
                    "details": "鲜叶采摘回来后，需先置通风处摊凉，然后放入青铜甑釜中蒸制。宋代讲究'三蒸三晾'法，即蒸青后摊晾，反复三次。蒸制火候掌握极为关键，火候过轻则茶性未去，内含物质未充分软化；火候过重则香气受损。蒸制至叶色转为深绿，柔韧如革，香气馥郁。此步骤可杀青、灭酶，防止氧化，保留茶叶中的芳香物质和营养成分。",
                    "analysis": "蒸青是宋代团茶制作中的关键工序，这一工艺反映了古人对茶叶杀青温度与时间控制的精确把握。与现代制茶工艺相比，宋代蒸青法被现代的杀青工艺所替代，从蒸汽杀青发展为锅炒杀青，但核心原理相同——通过热处理破坏茶叶中的酶活性，防止氧化。宋代'三蒸三晾'法体现了精工细作的制茶理念，这种反复处理的做法虽在现代大规模生产中已少见，但在日本抹茶制作中仍有保留，可见宋代制茶技术对东亚茶文化的深远影响。"
                },
                {
                    "step": 3, 
                    "name": "研膏", 
                    "duration": "昼夜捣研", 
                    "tool": "青石茶臼",
                    "ancient_text": "小榨去水，大榨出膏。研膏以柯木杵、瓦盆，水研至细腻如膏。",
                    "source": "《北苑别录》",
                    "details": "蒸青后的茶叶放入青石茶臼中，由专人用木杵捣研。此过程耗时且费力，讲究技法，木杵起落有节律，需持续捣研直至茶叶成膏状。宋徽宗《大观茶论》记载:'其捣也，用木杵，起落有节，不緩不疾，务令均匀，盖一舂一捣，各有至数。'研膏过程中需不断翻拌，确保茶粉细腻均匀，无结块。研膏完成的茶粉色泽青翠如玉，质地细腻。此步是制作团茶的关键工序，决定了团茶的品质和口感。",
                    "analysis": "研膏工艺在宋代团茶制作中体现了精细化加工的最高水平。通过小榨去水、大榨出膏的过程，宋人实现了茶叶成分的充分提取与保留。与现代工艺相比，宋代研膏过程完全依靠人力，讲究的是节奏与均匀度，这种手工艺精神在现代日本抹茶制作中仍有体现。而现代制茶多采用机械研磨，虽提高了效率，但在质感表现上与传统手工研磨仍有差异。宋代研膏成膏状的做法，为后续压型(制成团茶)奠定基础，这一整体工艺流程反映了宋代对茶叶加工的系统性思考，启发了后世茶类的多样化发展。"
                }
            ]
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
    return render_template('production_process.html', process=data['process'], user_name=session.get('name'))


@app.route('/culture_spread')
def culture_spread():
    if 'name' not in session:
        return render_template('login.html')
    
    data = load_data()
    if data is None or 'spread' not in data:
        logger.error("无法加载文化传播数据")
        return render_template('500.html'), 500
    
    logger.info(f"传递文化传播数据到模板：{len(data['spread'].get('nodes', []))}个节点，{len(data['spread'].get('routes', []))}条路线")
    return render_template('culture_spread.html', spread_data=data['spread'], user_name=session.get('name'))


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
