from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from werkzeug.exceptions import NotFound, MethodNotAllowed

def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({'errors': error.messages}), 400

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        return jsonify({'error': 'Database error occurred'}), 500

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        return jsonify({'error': 'Data integrity error occurred'}), 400

    @app.errorhandler(NotFound)
    def handle_not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(MethodNotAllowed)
    def handle_method_not_allowed(error):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        return jsonify({'error': 'An unexpected error occurred'}), 500