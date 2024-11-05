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
        db.create_all()
        
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

def reset_db():
    """Reset the database by dropping all tables and recreating them with fresh sample data."""
    try:
        print("Starting database reset...")
        
        # Drop all existing tables
        print("Dropping all tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating new tables...")
        db.create_all()
        
        # Create sample data in correct order
        print("Creating sample airports...")
        create_sample_airports()
        
        print("Creating sample flights...")
        create_sample_flights()
        
        print("Creating sample passengers...")
        create_sample_passengers()
        
        print("Creating sample bookings...")
        create_sample_bookings()
        
        print("Database reset completed successfully!")
        
        # Print database statistics
        stats = get_db_stats()
        if stats:
            print("\nNew Database Statistics:")
            print(f"Total Airports: {stats['overview']['total_airports']}")
            print(f"Total Flights: {stats['overview']['total_flights']}")
            print(f"Total Passengers: {stats['overview']['total_passengers']}")
            print(f"Total Bookings: {stats['overview']['total_bookings']}")
            print(f"Total Payments: {stats['overview']['total_payments']}")
            print(f"Unique Routes: {stats['routes']['unique_routes']}")
        
    except Exception as e:
        print(f"Error resetting database: {e}")
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
    try:
        jfk = Airport.query.filter_by(code='JFK').first()
        lhr = Airport.query.filter_by(code='LHR').first()
        cdg = Airport.query.filter_by(code='CDG').first()
        lax = Airport.query.filter_by(code='LAX').first()
        
        base_date = datetime.now().date() + timedelta(days=1)
        
        sample_flights = [
            # JFK to LHR
            {
                'departure_date': base_date,
                'departure_time': '08:00 AM',
                'arrival_time': '03:00 PM',  
                'origin_id': jfk.id,
                'destination_id': lhr.id,
                'duration': '7h 00m',
                'price': 450,
                'available_seats': 150
            },
            {
                'departure_date': base_date,
                'departure_time': '09:30 PM',
                'arrival_time': '04:30 AM',  
                'origin_id': jfk.id,
                'destination_id': lhr.id,
                'duration': '7h 00m',
                'price': 425,
                'available_seats': 150
            },
            # LHR to JFK
            {
                'departure_date': base_date + timedelta(days=1),
                'departure_time': '10:00 AM',
                'arrival_time': '06:00 PM',  
                'origin_id': lhr.id,
                'destination_id': jfk.id,
                'duration': '8h 00m',
                'price': 475,
                'available_seats': 150
            },
            # JFK to CDG
            {
                'departure_date': base_date,
                'departure_time': '06:45 PM',
                'arrival_time': '02:00 AM',  
                'origin_id': jfk.id,
                'destination_id': cdg.id,
                'duration': '7h 15m',
                'price': 525,
                'available_seats': 150
            },
            {
                'departure_date': base_date + timedelta(days=2),
                'departure_time': '11:30 AM',
                'arrival_time': '06:45 PM',  
                'origin_id': jfk.id,
                'destination_id': cdg.id,
                'duration': '7h 15m',
                'price': 490,
                'available_seats': 150
            },
            # LAX to LHR
            {
                'departure_date': base_date + timedelta(days=1),
                'departure_time': '03:15 PM',
                'arrival_time': '01:45 AM',  
                'origin_id': lax.id,
                'destination_id': lhr.id,
                'duration': '10h 30m',
                'price': 750,
                'available_seats': 150
            },
            {
                'departure_date': base_date + timedelta(days=3),
                'departure_time': '07:30 PM',
                'arrival_time': '06:00 AM',  
                'origin_id': lax.id,
                'destination_id': lhr.id,
                'duration': '10h 30m',
                'price': 725,
                'available_seats': 150
            },
            # CDG to LAX
            {
                'departure_date': base_date + timedelta(days=2),
                'departure_time': '12:00 PM',
                'arrival_time': '11:15 PM',  
                'origin_id': cdg.id,
                'destination_id': lax.id,
                'duration': '11h 15m',
                'price': 825,
                'available_seats': 150
            },
            # LHR to CDG
            {
                'departure_date': base_date + timedelta(days=1),
                'departure_time': '08:30 AM',
                'arrival_time': '09:45 AM',  
                'origin_id': lhr.id,
                'destination_id': cdg.id,
                'duration': '1h 15m',
                'price': 150,
                'available_seats': 150
            },
            # CDG to LHR
            {
                'departure_date': base_date + timedelta(days=2),
                'departure_time': '07:15 PM',
                'arrival_time': '08:30 PM',  
                'origin_id': cdg.id,
                'destination_id': lhr.id,
                'duration': '1h 15m',
                'price': 175,
                'available_seats': 150
            }
        ]

        
        for flight_data in sample_flights:
            flight = Flight(**flight_data)
            db.session.add(flight)
        
        db.session.commit()
        print(f"Successfully created {len(sample_flights)} sample flights")
        
    except Exception as e:
        print(f"Error creating sample flights: {e}")
        db.session.rollback()
        raise

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
        flight_count = Flight.query.count()
        passenger_count = Passenger.query.count()
        booking_count = Booking.query.count()
        payment_count = Payment.query.count()
        airport_count = Airport.query.count()
        
        # Get upcoming flights count
        upcoming_flights = Flight.query.filter(
            Flight.departure_date >= datetime.now().date()
        ).count()
        
        # Get unique routes count
        unique_routes = db.session.query(
            Flight.origin_id, 
            Flight.destination_id
        ).distinct().count()
        
        # Get most popular route
        popular_route = db.session.query(
            Flight.origin_id,
            Flight.destination_id,
            db.func.count(Booking.id).label('booking_count')
        ).join(Booking).group_by(
            Flight.origin_id,
            Flight.destination_id
        ).order_by(
            db.desc('booking_count')
        ).first()
        
        # Format most popular route data
        most_popular = None
        if popular_route:
            origin = Airport.query.get(popular_route[0])
            destination = Airport.query.get(popular_route[1])
            most_popular = {
                'origin': origin.display_name,
                'destination': destination.display_name,
                'bookings': popular_route[2]
            }
        
        # Calculate booking statistics
        total_revenue = db.session.query(
            db.func.sum(Flight.price)
        ).join(Booking).scalar() or 0
        
        avg_booking_value = db.session.query(
            db.func.avg(Flight.price)
        ).join(Booking).scalar() or 0
        
        avg_seats_available = db.session.query(
            db.func.avg(Flight.available_seats)
        ).scalar() or 0
        
        stats = {
            'overview': {
                'total_flights': flight_count,
                'upcoming_flights': upcoming_flights,
                'total_passengers': passenger_count,
                'total_bookings': booking_count,
                'total_payments': payment_count,
                'total_airports' : airport_count
            },
            'routes': {
                'unique_routes': unique_routes,
                'most_popular': most_popular
            },
            'bookings': {
                'total_revenue': total_revenue,
                'average_booking_value': avg_booking_value,
                'average_seats_available': avg_seats_available
            }
        }
        
        return stats
        
    except Exception as e:
        print(f"Error getting database statistics: {e}")
        return None

