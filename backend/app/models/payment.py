from app import db
from datetime import datetime
import uuid

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = db.Column(db.String(36), db.ForeignKey('bookings.id'), nullable=False)
    card_number = db.Column(db.String(16), nullable=False) 
    expiry_date = db.Column(db.String(5), nullable=False) 
    name_on_card = db.Column(db.String(100), nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    booking = db.relationship('Booking', back_populates='payment')

    def __repr__(self):
        return f'<Payment for Booking {self.booking_id}>'

    def __init__(self, **kwargs):
     
        kwargs.pop('cvv', None)
        super(Payment, self).__init__(**kwargs)