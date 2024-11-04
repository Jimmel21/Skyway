# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Config:
#     # SQLite configuration
#     basedir = os.path.abspath(os.path.dirname(__file__))
#     SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL',
#         'sqlite:///' + os.path.join(basedir, 'instance', 'skyway.db'))
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
#     CORS_HEADERS = 'Content-Type'
#     STATIC_FOLDER = '../frontend/dist/skyway'

import os

class Config:
    # Get the parent directory of the current file
    basedir = os.path.abspath(os.path.dirname(__file__))
    
    # SQLite configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'instance', 'skyway.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'dev-secret-key'
    CORS_HEADERS = 'Content-Type'