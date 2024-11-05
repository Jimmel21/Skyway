from tabulate import tabulate
from sqlalchemy import inspect
from app.models.flight import Flight
from app.models.booking import Booking
from app.models.passenger import Passenger
from app.models.payment import Payment
from app import create_app, db

def print_all_tables():
    """Print all tables in the database with their contents."""
    
    def get_table_data(model):
        # Get all records
        records = model.query.all()
        
        if not records:
            return [], []
            
        # Get column names using inspection
        mapper = inspect(model)
        columns = [column.key for column in mapper.attrs]
        
        # Convert records to list of dictionaries
        data = []
        for record in records:
            row = []
            for column in columns:
                value = getattr(record, column)
                # Truncate long values
                if isinstance(value, str) and len(value) > 30:
                    value = value[:27] + "..."
                row.append(value)
            data.append(row)
            
        return columns, data

    def print_table(model, table_name):
        print(f"\n{'=' * 80}")
        print(f"Table: {table_name}")
        print(f"{'=' * 80}")
        
        headers, data = get_table_data(model)
        
        if not data:
            print("No records found")
            return
            
        print(tabulate(data, headers=headers, tablefmt='grid'))
        print(f"Total Records: {len(data)}")

    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        # Dictionary of models to print
        tables = {
            'Flights': Flight,
            'Bookings': Booking,
            'Passengers': Passenger,
            'Payments': Payment
        }
        
        print("\nSkyWay Airlines Database Tables")
        print("=" * 80)
        
        # Print each table
        for table_name, model in tables.items():
            print_table(model, table_name)

if __name__ == '__main__':
    print_all_tables()