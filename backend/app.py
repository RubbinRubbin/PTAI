import os
import sys

# When running as PyInstaller exe, use the exe's directory
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Add backend directory to path
sys.path.insert(0, BASE_DIR)

from flask import Flask
from flask_cors import CORS
from config import Config
from database import db, init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend (dev + Electron production)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)

    # Ensure data directory exists
    from config import DATA_DIR
    os.makedirs(DATA_DIR, exist_ok=True)

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
    is_production = getattr(sys, 'frozen', False) or os.environ.get('FLASK_ENV') == 'production'
    app.run(debug=not is_production, port=5000, use_reloader=not is_production)
