from flask import Flask, render_template
import pandas as pd
import json

app = Flask(__name__)


# 数据加载函数
def load_data():
    return {
        'prices': pd.read_csv(r'E:\desktop\项目\data\historical_prices.csv', encoding='utf-8').to_dict('records'),
        'routes': load_json(r'E:\desktop\项目\data\tea_routes.json'),
        # 'spread': load_json('culture_spread.json'),
        'process': [
            {"step": 1, "name": "采茶", "duration": "清晨至午前", "tool": "金花银篓"},
            {"step": 2, "name": "蒸青", "duration": "三蒸三晾", "tool": "青铜甑釜"},
            {"step": 3, "name": "研膏", "duration": "昼夜捣研", "tool": "青石茶臼"}
        ]
    }


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
