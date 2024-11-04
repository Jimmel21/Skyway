from app import db
from app.models.flight import Flight
from app.models.booking import Booking
from app.models.passenger import Passenger
from app.models.payment import Payment
from app.models.airport import Airport
from datetime import datetime, timedelta
import uuid

def init_db():
    """Initialize the database and create sample data."""
    try:
        # Create all tables
        db.drop_all()  # Drop all existing tables
        db.create_all()  # Create tables with new schema
        
        # Create sample airports first
        if Airport.query.count() == 0:
            create_sample_airports()
            print("Sample airports created successfully!")
        
        # Create sample flights with airport references
        if Flight.query.count() == 0:
            create_sample_flights()
            print("Sample flights created successfully!")
        
        if Passenger.query.count() == 0:
            create_sample_passengers()
            print("Sample passengers created successfully!")
            
        if Booking.query.count() == 0:
            create_sample_bookings()
            print("Sample bookings created successfully!")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.session.rollback()
        raise

def create_sample_airports():
    """Create sample airports."""
    sample_airports = [
        {
            'code': 'JFK',
            'city': 'New York',
            'country': 'United States',
            'display_name': 'New York (JFK)',
            'is_active': True
        },
        {
            'code': 'LHR',
            'city': 'London',
            'country': 'United Kingdom',
            'display_name': 'London (LHR)',
            'is_active': True
        },
        {
            'code': 'CDG',
            'city': 'Paris',
            'country': 'France',
            'display_name': 'Paris (CDG)',
            'is_active': True
        },
        {
            'code': 'LAX',
            'city': 'Los Angeles',
            'country': 'United States',
            'display_name': 'Los Angeles (LAX)',
            'is_active': True
        }
    ]
    
    for airport_data in sample_airports:
        airport = Airport(**airport_data)
        db.session.add(airport)
    
    db.session.commit()

def create_sample_flights():
    """Create sample flights with airport references."""
    # Get airport references
    jfk = Airport.query.filter_by(code='JFK').first()
    lhr = Airport.query.filter_by(code='LHR').first()
    
    sample_flights = [
        {
            'departure_time': '08:00 AM',
            'arrival_time': '8:00 PM',
            'origin_id': jfk.id,
            'destination_id': lhr.id,
            'duration': '7h 00m',
            'price': 450,
            'available_seats': 150
        },
        {
            'departure_time': '12:00 PM',
            'arrival_time': '12:00 AM',
            'origin_id': jfk.id,
            'destination_id': lhr.id,
            'duration': '7h 00m',
            'price': 500,
            'available_seats': 150
        },
        {
            'departure_time': '04:00 PM',
            'arrival_time': '4:00 AM',
            'origin_id': jfk.id,
            'destination_id': lhr.id,
            'duration': '7h 00m',
            'price': 475,
            'available_seats': 150
        }
    ]
    
    for flight_data in sample_flights:
        flight = Flight(**flight_data)
        db.session.add(flight)
    
    db.session.commit()

def create_sample_passengers():
    """Create sample passenger data."""
    sample_passengers = [
        {
            'first_name': 'John',
            'last_name': 'Doe',
            'date_of_birth': '1985-05-15',
            'gender': 'Male',
            'email': 'john.doe@example.com',
            'phone_number': '1234567890'
        },
        {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'date_of_birth': '1990-08-22',
            'gender': 'Female',
            'email': 'jane.smith@example.com',
            'phone_number': '9876543210'
        }
    ]
    
    for passenger_data in sample_passengers:
        passenger = Passenger(**passenger_data)
        db.session.add(passenger)
    
    db.session.commit()

def create_sample_bookings():
    """Create sample bookings with payments."""
    flights = Flight.query.all()
    passengers = Passenger.query.all()
    
    for flight in flights[:2]:  # Create bookings for first two flights
        for passenger in passengers[:1]:  # One booking per flight
            # Create booking
            booking = Booking(
                reference=f"SKY{uuid.uuid4().hex[:6].upper()}",
                flight_id=flight.id,
                passenger_id=passenger.id
            )
            db.session.add(booking)
            db.session.flush()  # Get booking ID
            
            # Create payment
            payment = Payment(
                booking_id=booking.id,
                card_number='4111111111111111',  # Sample card number
                expiry_date='12/25',
                name_on_card=f"{passenger.first_name} {passenger.last_name}"
            )
            db.session.add(payment)
            
            # Update available seats
            flight.available_seats -= 1
    
    db.session.commit()

def get_db_stats():
    """Get comprehensive database statistics."""
    try:
        # Get basic counts
        airport_count = Airport.query.count()
        flight_count = Flight.query.count()
        passenger_count = Passenger.query.count()
        booking_count = Booking.query.count()
        payment_count = Payment.query.count()
        
        # Get unique routes
        unique_routes = db.session.query(
            Flight.origin_id, 
            Flight.destination_id
        ).distinct().count()
        
        stats = {
            'overview': {
                'total_airports': airport_count,
                'total_flights': flight_count,
                'total_passengers': passenger_count,
                'total_bookings': booking_count,
                'total_payments': payment_count,
                'unique_routes': unique_routes
            }
        }
        
        return stats
        
    except Exception as e:
        print(f"Error getting database statistics: {e}")
        return None