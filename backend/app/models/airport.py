from app import db

class Airport(db.Model):
    __tablename__ = 'airports'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), unique=True, nullable=False) 
    city = db.Column(db.String(100), nullable=False)            
    country = db.Column(db.String(100), nullable=False)         
    display_name = db.Column(db.String(200), nullable=False)    
    is_active = db.Column(db.Boolean, default=True)           

    def __repr__(self):
        return f'<Airport {self.code}>'

    @property
    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id': self.id,
            'code': self.code,
            'city': self.city,
            'country': self.country,
            'display_name': self.display_name,
            'is_active': self.is_active
        }