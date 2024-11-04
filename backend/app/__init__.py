from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS
import os
from config import Config

# Initialize extensions
db = SQLAlchemy()
ma = Marshmallow()

def create_app():
    app = Flask(__name__, static_folder='../../frontend/skyway')
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    
    # Configure CORS
    CORS(app)
    
    # Register API routes
    from app.routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Serve Angular frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    return app

