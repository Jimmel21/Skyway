from app import create_app
from app.utils.db_manager import init_db, reset_db, get_db_stats
from datetime import datetime

app = create_app()

def initialize_database():
    """Initialize the database with tables and sample data."""
    with app.app_context():
        init_db()
        print("\nDatabase Statistics:")
        print_db_stats()

def reset_database():
    """Reset the database by dropping all tables and recreating them."""
    with app.app_context():
        reset_db()
        print("\nDatabase Statistics:")
        print_db_stats()

def print_db_stats():
    """Print formatted database statistics."""
    stats = get_db_stats()
    if not stats:
        print("Error retrieving database statistics")
        return

    print("\n=== SkyWay Database Statistics ===")
    print("\nOverview:")
    print(f"Total Flights: {stats['overview']['total_flights']}")
    print(f"Upcoming Flights: {stats['overview']['upcoming_flights']}")
    print(f"Total Passengers: {stats['overview']['total_passengers']}")
    print(f"Total Bookings: {stats['overview']['total_bookings']}")
    print(f"Total Payments: {stats['overview']['total_payments']}")
    
    print("\nRoutes:")
    print(f"Unique Routes: {stats['routes']['unique_routes']}")
    if stats['routes']['most_popular']:
        print("\nMost Popular Route:")
        print(f"  {stats['routes']['most_popular']['origin']} → "
              f"{stats['routes']['most_popular']['destination']}")
        print(f"  Bookings: {stats['routes']['most_popular']['bookings']}")
    
    print("\nBooking Statistics:")
    print(f"Total Revenue: ${stats['bookings']['total_revenue']:,.2f}")
    print(f"Average Booking Value: ${stats['bookings']['average_booking_value']:,.2f}")
    print(f"Average Seats Available: {stats['bookings']['average_seats_available']:.0f}")
    
    print("\nLast Updated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 35)

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python manage_db.py [init|reset|stats]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'init':
        print("Initializing database...")
        initialize_database()
        print("Database initialized successfully!")
    
    elif command == 'reset':
        confirmation = input("This will delete all data. Are you sure? (y/N): ")
        if confirmation.lower() == 'y':
            print("Resetting database...")
            reset_database()
            print("Database reset successfully!")
        else:
            print("Operation cancelled.")
    
    elif command == 'stats':
        with app.app_context():
            print_db_stats()
    
    else:
        print(f"Unknown command: {command}")
        print("Available commands: init, reset, stats")