from flask import Flask, render_template, jsonify
import pandas as pd
import json
import logging
from pathlib import Path

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

app = Flask(__name__)

# 配置静态文件目录
app.static_folder = 'static'


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
            logger.info("成功加载文化传播数据")
        except Exception as e:
            logger.error(f"加载文化传播数据失败: {str(e)}")
            spread = {}

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
                {"step": 1, "name": "采茶", "duration": "清晨至午前", "tool": "金花银篓"},
                {"step": 2, "name": "蒸青", "duration": "三蒸三晾", "tool": "青铜甑釜"},
                {"step": 3, "name": "研膏", "duration": "昼夜捣研", "tool": "青石茶臼"}
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
    data = load_data()
    return render_template('index.html', price_data=data['prices'])


@app.route('/trade_flow')
def trade_flow():
    data = load_data()
    return render_template('trade_flow.html',
                           nodes=json.dumps(data['routes']['nodes']),
                           links=json.dumps(data['routes']['links']))


@app.route('/song_production')
def song_production():
    data = load_data()
    return render_template('production_process.html', process=data['process'])


@app.route('/culture_spread')
def culture_spread():
    data = load_data()
    return render_template('culture_spread.html', spread_data=data['spread'])


@app.errorhandler(404)
def page_not_found(e):
    logger.warning(f"访问了不存在的页面: {e}")
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"服务器内部错误: {e}")
    return render_template('500.html'), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
