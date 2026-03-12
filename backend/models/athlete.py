from datetime import datetime
from database import db

class Athlete(db.Model):
    __tablename__ = 'athletes'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cognome = db.Column(db.String(100), nullable=False)
    eta = db.Column(db.Integer, nullable=False)
    sport = db.Column(db.String(100), nullable=False)
    descrizione = db.Column(db.Text, nullable=True)
    altezza = db.Column(db.Float, nullable=True)  # cm
    peso = db.Column(db.Float, nullable=True)  # kg
    data_nascita = db.Column(db.Date, nullable=True)
    note = db.Column(db.Text, nullable=True)
    pagato = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    metric_definitions = db.relationship('MetricDefinition', backref='athlete', lazy=True, cascade='all, delete-orphan')
    charts = db.relationship('Chart', backref='athlete', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cognome': self.cognome,
            'eta': self.eta,
            'sport': self.sport,
            'descrizione': self.descrizione,
            'altezza': self.altezza,
            'peso': self.peso,
            'data_nascita': self.data_nascita.isoformat() if self.data_nascita else None,
            'note': self.note,
            'pagato': self.pagato,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
