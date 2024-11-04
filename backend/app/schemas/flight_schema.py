from backend.app import ma
from app.models.flight import Flight
from marshmallow import fields, validates, ValidationError
from datetime import datetime

class FlightSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Flight

    id = fields.String(dump_only=True)
    flight_number = fields.String(required=True)
    departure_time = fields.DateTime(required=True)
    arrival_time = fields.DateTime(required=True)
    origin = fields.String(required=True)
    destination = fields.String(required=True)
    price = fields.Float(required=True)
    available_seats = fields.Integer(required=True)

    @validates('price')
    def validate_price(self, value):
        if value <= 0:
            raise ValidationError('Price must be greater than 0')

    @validates('available_seats')
    def validate_seats(self, value):
        if value < 0:
            raise ValidationError('Available seats cannot be negative')

    @validates('departure_time')
    def validate_departure_time(self, value):
        if value < datetime.now():
            raise ValidationError('Departure time cannot be in the past')