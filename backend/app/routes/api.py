from flask import Blueprint, request, jsonify
from app.models.flight import Flight
from app.models.booking import Booking
from app.models.passenger import Passenger
from app.models.airport import Airport
from app import db
from datetime import datetime
import uuid

api_bp = Blueprint('api', __name__)

@api_bp.route('/airports', methods=['GET'])
def get_airports():
    """
    Get all active airports
    Returns a list of all available airports with their details
    """
    try:
        airports = Airport.query.filter_by(is_active=True).all()
        return jsonify([airport.serialize for airport in airports])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/flights/search', methods=['POST'])
def search_flights():
    """
    Search Flights API
    Expects JSON: {
        "origin_id": 1,
        "destination_id": 2,
        "date": "2024-06-15"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['origin_id', 'destination_id', 'date']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Validate origin and destination are different
        if data['origin_id'] == data['destination_id']:
            return jsonify({'error': 'Origin and destination cannot be the same'}), 400
            
        # Query flights
        flights = Flight.query.filter(
            Flight.origin_id == data['origin_id'],
            Flight.destination_id == data['destination_id'],
            Flight.departure_time.like(f"%{data['date']}%"),
            Flight.available_seats > 0
        ).all()
        
        # Format response
        flight_list = []
        for flight in flights:
            flight_list.append({
                'id': flight.id,
                'departureTime': flight.departure_time,
                'arrivalTime': flight.arrival_time,
                'origin': flight.origin_airport.display_name,
                'destination': flight.destination_airport.display_name,
                'duration': flight.duration,
                'price': flight.price,
                'availableSeats': flight.available_seats
            })
        
        return jsonify(flight_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/bookings', methods=['POST'])
def create_booking():
    """
    Create Booking API
    Expects JSON: {
        "flight_id": "flight_uuid",
        "passenger": {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone_number": "1234567890",
            "date_of_birth": "1990-01-01",
            "gender": "Male"
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate flight exists and has available seats
        flight = Flight.query.get_or_404(data['flight_id'])
        if flight.available_seats <= 0:
            return jsonify({'error': 'No seats available on this flight'}), 400
        
        # Create passenger
        passenger = Passenger(
            first_name=data['passenger']['first_name'],
            last_name=data['passenger']['last_name'],
            email=data['passenger']['email'],
            phone_number=data['passenger']['phone_number'],
            date_of_birth=data['passenger']['date_of_birth'],
            gender=data['passenger']['gender']
        )
        db.session.add(passenger)
        
        # Generate unique booking reference
        booking_reference = f"SKY{uuid.uuid4().hex[:6].upper()}"
        
        # Create booking
        booking = Booking(
            reference=booking_reference,
            flight_id=flight.id,
            passenger_id=passenger.id
        )
        db.session.add(booking)
        
        # Update flight seats
        flight.available_seats -= 1
        
        db.session.commit()
        
        # Return booking reference
        return jsonify({
            'booking_reference': booking_reference,
            'message': 'Booking created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/bookings/search', methods=['POST'])
def search_bookings():
    """
    View Bookings API
    Expects JSON either:
    {
        "email": "john@example.com",
        "last_name": "Doe"
    }
    OR
    {
        "booking_reference": "SKY123456"
    }
    """
    try:
        data = request.get_json()
        
        if 'booking_reference' in data:
            # Search by booking reference
            booking = Booking.query.filter_by(reference=data['booking_reference']).first()
            if not booking:
                return jsonify({'error': 'Booking not found'}), 404
                
            bookings = [booking]
            
        elif 'email' in data and 'last_name' in data:
            # Search by email and last name
            passenger = Passenger.query.filter_by(
                email=data['email'],
                last_name=data['last_name']
            ).first()
            
            if not passenger:
                return jsonify({'error': 'No bookings found'}), 404
                
            bookings = Booking.query.filter_by(passenger_id=passenger.id).all()
            
        else:
            return jsonify({'error': 'Invalid search criteria'}), 400
        
        # Format response
        booking_list = []
        for booking in bookings:
            flight = Flight.query.get(booking.flight_id)
            passenger = Passenger.query.get(booking.passenger_id)
            
            booking_list.append({
                'reference': booking.reference,
                'flight': {
                    'departure_city': flight.origin,
                    'arrival_city': flight.destination,
                    'departure_time': flight.departure_time,
                    'arrival_time': flight.arrival_time
                },
                'passenger': {
                    'name': f"{passenger.first_name} {passenger.last_name}",
                    'email': passenger.email
                },
                'status': booking.status
            })
        
        return jsonify(booking_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400