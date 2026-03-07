from datetime import datetime
from database import db
import json

class MetricDefinition(db.Model):
    """Definizione di una metrica con assi X e Y"""
    __tablename__ = 'metric_definitions'

    id = db.Column(db.Integer, primary_key=True)
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)  # Nome della metrica (es. "Progressione Squat")
    asse_x_nome = db.Column(db.String(100), nullable=False)  # Nome asse X (es. "Settimane")
    asse_x_unita = db.Column(db.String(50), nullable=False)  # Unità asse X (es. "settimana")
    asse_y_nome = db.Column(db.String(100), nullable=False)  # Nome asse Y (es. "Peso")
    asse_y_unita = db.Column(db.String(50), nullable=False)  # Unità asse Y (es. "kg")
    note = db.Column(db.Text, nullable=True)  # Note/descrizione della metrica
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship con i valori
    values = db.relationship('MetricValue', backref='definition', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'athlete_id': self.athlete_id,
            'nome': self.nome,
            'asse_x_nome': self.asse_x_nome,
            'asse_x_unita': self.asse_x_unita,
            'asse_y_nome': self.asse_y_nome,
            'asse_y_unita': self.asse_y_unita,
            'note': self.note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'values': [v.to_dict() for v in self.values]
        }


class MetricValue(db.Model):
    """Valori singoli per una metrica (punti sul grafico)"""
    __tablename__ = 'metric_values'

    id = db.Column(db.Integer, primary_key=True)
    definition_id = db.Column(db.Integer, db.ForeignKey('metric_definitions.id'), nullable=False)
    valore_x = db.Column(db.Float, nullable=False)
    valore_y = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'definition_id': self.definition_id,
            'valore_x': self.valore_x,
            'valore_y': self.valore_y,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Manteniamo Chart per eventuali usi futuri
class Chart(db.Model):
    __tablename__ = 'charts'

    id = db.Column(db.Integer, primary_key=True)
    athlete_id = db.Column(db.Integer, db.ForeignKey('athletes.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    config = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'athlete_id': self.athlete_id,
            'nome': self.nome,
            'tipo': self.tipo,
            'config': json.loads(self.config) if self.config else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def set_config(self, config_dict):
        self.config = json.dumps(config_dict)
