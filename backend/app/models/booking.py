from app import db
from datetime import datetime
import uuid

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = db.Column(db.String(10), nullable=False, unique=True)
    flight_id = db.Column(db.String(36), db.ForeignKey('flights.id'), nullable=False)
    passenger_id = db.Column(db.String(36), db.ForeignKey('passengers.id'), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='CONFIRMED')

    # Relationships
    flight = db.relationship('Flight', back_populates='bookings')
    passenger = db.relationship('Passenger', back_populates='bookings')
    payment = db.relationship('Payment', back_populates='booking', uselist=False)

    def __repr__(self):
        return f'<Booking {self.reference}>'