from app import create_app, db
from app.utils.db_manager import init_db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        init_db()  # Initialize database and create sample data
    app.run(debug=True, host='0.0.0.0', port=8000)