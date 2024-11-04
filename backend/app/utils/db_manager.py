from app import db
from app.models.flight import Flight
from app.models.booking import Booking
from app.models.passenger import Passenger
from app.models.payment import Payment
from datetime import datetime, timedelta
import uuid

def init_db():
    """Initialize the database and create sample data."""
    try:
        # Create all tables
        db.create_all()
        
        # Create sample data in correct order
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

def create_sample_flights():
    """Create sample flights matching Angular component data."""
    sample_flights = [
        {
            'departure_time': '08:00 AM',
            'arrival_time': '8:00 PM',
            'origin': 'New York (JFK)',
            'destination': 'London (LHR)',
            'duration': '7h 00m',
            'price': 450,
            'available_seats': 150
        },
        {
            'departure_time': '12:00 PM',
            'arrival_time': '12:00 AM',
            'origin': 'New York (JFK)',
            'destination': 'London (LHR)',
            'duration': '7h 00m',
            'price': 500,
            'available_seats': 150
        },
        {
            'departure_time': '04:00 PM',
            'arrival_time': '4:00 AM',
            'origin': 'New York (JFK)',
            'destination': 'London (LHR)',
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
    """Create sample passenger data matching Angular component."""
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
                card_number='4111111111111111',  # Sample card number (never store real ones!)
                expiry_date='12/25',
                name_on_card=f"{passenger.first_name} {passenger.last_name}"
            )
            db.session.add(payment)
            
            # Update available seats
            flight.available_seats -= 1
    
    db.session.commit()

def reset_db():
    """Reset the database by dropping all tables and recreating them."""
    db.drop_all()
    init_db()

def get_db_stats():
    """Get comprehensive database statistics."""
    try:
        # Get basic counts
        flight_count = Flight.query.count()
        upcoming_flights = Flight.query.filter(Flight.departure_time > datetime.now()).count()
        passenger_count = Passenger.query.count()
        booking_count = Booking.query.count()
        payment_count = Payment.query.count()
        
        # Get unique routes
        unique_routes = db.session.query(
            db.distinct(Flight.origin), 
            Flight.destination
        ).count()
        
        # Get most popular route
        popular_route = db.session.query(
            Flight.origin,
            Flight.destination,
            db.func.count(Booking.id).label('booking_count')
        ).join(Booking).group_by(
            Flight.origin,
            Flight.destination
        ).order_by(
            db.desc('booking_count')
        ).first()
        
        # Get booking statistics
        total_revenue = db.session.query(
            db.func.sum(Flight.price)
        ).join(Booking).scalar() or 0
        
        avg_booking_value = db.session.query(
            db.func.avg(Flight.price)
        ).join(Booking).scalar() or 0
        
        # Get seat availability
        avg_seats_available = db.session.query(
            db.func.avg(Flight.available_seats)
        ).scalar() or 0
        
        stats = {
            'overview': {
                'total_flights': flight_count,
                'upcoming_flights': upcoming_flights,
                'total_passengers': passenger_count,
                'total_bookings': booking_count,
                'total_payments': payment_count
            },
            'routes': {
                'unique_routes': unique_routes,
                'most_popular': {
                    'origin': popular_route[0] if popular_route else None,
                    'destination': popular_route[1] if popular_route else None,
                    'bookings': popular_route[2] if popular_route else 0
                } if popular_route else None
            },
            'bookings': {
                'total_revenue': round(total_revenue, 2),
                'average_booking_value': round(avg_booking_value, 2),
                'average_seats_available': round(avg_seats_available, 2)
            }
        }
        
        return stats
        
    except Exception as e:
        print(f"Error getting database statistics: {e}")
        return None