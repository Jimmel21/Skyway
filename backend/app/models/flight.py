from app import db
from datetime import datetime
import uuid

class Flight(db.Model):
    __tablename__ = 'flights'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    departure_date = db.Column(db.Date, nullable=False)
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
        return f'<Flight {self.origin_airport.code} to {self.destination_airport.code} on {self.departure_date}>'

    @property
    def full_departure_datetime(self):
        """Combine departure_date and departure_time into a datetime object."""
        try:
            time_obj = datetime.strptime(self.departure_time, '%I:%M %p').time()
            return datetime.combine(self.departure_date, time_obj)
        except ValueError:
            return None

    @property
    def is_past_flight(self):
        """Check if the flight has already departed."""
        if self.full_departure_datetime:
            return self.full_departure_datetime < datetime.now()
        return False

    @property
    def formatted_departure(self):
        """Return formatted departure date and time."""
        if self.departure_date:
            return f"{self.departure_date.strftime('%Y-%m-%d')} {self.departure_time}"
        return self.departure_time