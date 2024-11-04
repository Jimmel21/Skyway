from backend.app import ma
from app.models.booking import Booking
from marshmallow import fields, validates, ValidationError
import re

class BookingSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Booking

    id = fields.String(dump_only=True)
    reference = fields.String(dump_only=True)
    flight_id = fields.String(required=True)
    passenger_email = fields.Email(required=True)
    passenger_first_name = fields.String(required=True)
    passenger_last_name = fields.String(required=True)
    booking_date = fields.DateTime(dump_only=True)
    status = fields.String(dump_only=True)

    @validates('passenger_email')
    def validate_email(self, value):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise ValidationError('Invalid email address')

    @validates('passenger_first_name')
    def validate_first_name(self, value):
        if len(value) < 2:
            raise ValidationError('First name must be at least 2 characters long')

    @validates('passenger_last_name')
    def validate_last_name(self, value):
        if len(value) < 2:
            raise ValidationError('Last name must be at least 2 characters long')