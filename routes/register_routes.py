from flask import Blueprint, render_template, request, redirect, session, current_app, flash
from flask_mysqldb import MySQL
import bcrypt
import logging

# 创建Blueprint
bp = Blueprint('register', __name__)

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password'].encode('utf-8')
        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

        # 获取MySQL连接
        mysql = current_app.extensions['mysql']
        cur = mysql.connection.cursor()
        # 检查用户名和邮箱是否已经存在
        cur.execute("SELECT * FROM users WHERE name = %s OR email = %s", (name, email))
        user = cur.fetchone()

        if user:
            error = '用户名或电子邮件已存在。'
            return render_template('register.html', error=error)
        else:
            # 插入新用户
            cur.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password))
            mysql.connection.commit()
            cur.close()
            # 不设置会话，不自动登录
            # 返回登录页面，显示成功消息
            success_message = '注册成功！请登录您的账户。'
            return render_template('login.html', success_message=success_message)
    return render_template('register.html')