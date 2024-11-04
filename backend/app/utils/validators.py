from datetime import datetime

def validate_search_params(data):
    errors = []
    required_fields = ['origin', 'destination', 'date']
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            errors.append(f'{field} is required')
    
    if not errors:
        try:
            # Validate date format and value
            search_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if search_date < datetime.now().date():
                errors.append('Date cannot be in the past')
        except ValueError:
            errors.append('Invalid date format. Use YYYY-MM-DD')
            
        # Validate origin and destination
        if data['origin'] == data['destination']:
            errors.append('Origin and destination cannot be the same')
            
        # Validate string lengths
        if len(data['origin']) < 3:
            errors.append('Origin must be at least 3 characters')
        if len(data['destination']) < 3:
            errors.append('Destination must be at least 3 characters')
    
    return errors