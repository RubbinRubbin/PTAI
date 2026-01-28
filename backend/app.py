import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from config import Config
from database import db, init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend
    CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)

    # Import models before initializing database
    from models import Athlete, MetricDefinition, MetricValue, Chart

    # Initialize database
    init_db(app)

    # Register blueprints
    from routes import api
    app.register_blueprint(api)

    @app.route('/health')
    def health():
        return {'status': 'ok'}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
