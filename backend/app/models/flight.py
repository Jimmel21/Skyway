from app import db
from datetime import datetime
import uuid

class Flight(db.Model):
    __tablename__ = 'flights'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    departure_time = db.Column(db.String(20), nullable=False)
    arrival_time = db.Column(db.String(20), nullable=False)
    origin_id = db.Column(db.Integer, db.ForeignKey('airports.id'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('airports.id'), nullable=False)
    duration = db.Column(db.String(20), nullable=False)
    price = db.Column(db.Float, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False, default=150)

    # Relationships
    origin_airport = db.relationship('Airport', foreign_keys=[origin_id])
    destination_airport = db.relationship('Airport', foreign_keys=[destination_id])
    bookings = db.relationship('Booking', back_populates='flight')

    def __repr__(self):
        return f'<Flight {self.origin_airport.code} to {self.destination_airport.code}>'