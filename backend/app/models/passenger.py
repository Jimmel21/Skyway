from app import db
from datetime import datetime
import uuid

class Passenger(db.Model):
    __tablename__ = 'passengers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.String(10), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)

    # Relationships
    bookings = db.relationship('Booking', back_populates='passenger')

    def __repr__(self):
        return f'<Passenger {self.first_name} {self.last_name}>'