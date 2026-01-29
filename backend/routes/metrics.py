from flask import request, jsonify
from datetime import datetime
from . import api
from database import db
from models import Athlete, MetricDefinition, MetricValue, Chart
import json

# ============ METRIC DEFINITIONS ============

@api.route('/athletes/<int:athlete_id>/metrics', methods=['GET'])
def get_metric_definitions(athlete_id):
    """Ottiene tutte le definizioni di metriche per un atleta"""
    Athlete.query.get_or_404(athlete_id)
    definitions = MetricDefinition.query.filter_by(athlete_id=athlete_id).order_by(MetricDefinition.created_at.desc()).all()
    return jsonify([d.to_dict() for d in definitions])

@api.route('/athletes/<int:athlete_id>/metrics', methods=['POST'])
def create_metric_definition(athlete_id):
    """Crea una nuova definizione di metrica"""
    Athlete.query.get_or_404(athlete_id)
    data = request.get_json()

    definition = MetricDefinition(
        athlete_id=athlete_id,
        nome=data['nome'],
        asse_x_nome=data['asse_x_nome'],
        asse_x_unita=data['asse_x_unita'],
        asse_y_nome=data['asse_y_nome'],
        asse_y_unita=data['asse_y_unita']
    )

    db.session.add(definition)
    db.session.commit()

    return jsonify(definition.to_dict()), 201

@api.route('/metrics/<int:id>', methods=['PUT'])
def update_metric_definition(id):
    """Aggiorna una definizione di metrica"""
    definition = MetricDefinition.query.get_or_404(id)
    data = request.get_json()

    definition.nome = data.get('nome', definition.nome)
    definition.asse_x_nome = data.get('asse_x_nome', definition.asse_x_nome)
    definition.asse_x_unita = data.get('asse_x_unita', definition.asse_x_unita)
    definition.asse_y_nome = data.get('asse_y_nome', definition.asse_y_nome)
    definition.asse_y_unita = data.get('asse_y_unita', definition.asse_y_unita)

    db.session.commit()

    return jsonify(definition.to_dict())

@api.route('/metrics/<int:id>', methods=['DELETE'])
def delete_metric_definition(id):
    """Elimina una definizione di metrica (e tutti i suoi valori)"""
    definition = MetricDefinition.query.get_or_404(id)
    db.session.delete(definition)
    db.session.commit()

    return jsonify({'message': 'Metrica eliminata con successo'}), 200

@api.route('/metrics/<int:id>/duplicate', methods=['POST'])
def duplicate_metric_definition(id):
    """Duplica una definizione di metrica con tutti i suoi valori"""
    original = MetricDefinition.query.get_or_404(id)

    # Crea nuova definizione con nome modificato
    new_definition = MetricDefinition(
        athlete_id=original.athlete_id,
        nome=f"{original.nome} (copia)",
        asse_x_nome=original.asse_x_nome,
        asse_x_unita=original.asse_x_unita,
        asse_y_nome=original.asse_y_nome,
        asse_y_unita=original.asse_y_unita
    )

    db.session.add(new_definition)
    db.session.flush()  # Per ottenere l'ID della nuova definizione

    # Duplica tutti i valori
    for value in original.values:
        new_value = MetricValue(
            definition_id=new_definition.id,
            valore_x=value.valore_x,
            valore_y=value.valore_y
        )
        db.session.add(new_value)

    db.session.commit()

    return jsonify(new_definition.to_dict()), 201

# ============ METRIC VALUES ============

@api.route('/metrics/<int:definition_id>/values', methods=['GET'])
def get_metric_values(definition_id):
    """Ottiene tutti i valori per una definizione di metrica"""
    MetricDefinition.query.get_or_404(definition_id)
    values = MetricValue.query.filter_by(definition_id=definition_id).order_by(MetricValue.created_at).all()
    return jsonify([v.to_dict() for v in values])

@api.route('/metrics/<int:definition_id>/values', methods=['POST'])
def add_metric_values(definition_id):
    """Aggiunge uno o più valori a una metrica"""
    MetricDefinition.query.get_or_404(definition_id)
    data = request.get_json()

    # Supporta sia singolo valore che array di valori
    values_data = data if isinstance(data, list) else [data]

    created_values = []
    for value_data in values_data:
        value = MetricValue(
            definition_id=definition_id,
            valore_x=value_data['valore_x'],
            valore_y=value_data['valore_y']
        )
        db.session.add(value)
        created_values.append(value)

    db.session.commit()

    return jsonify([v.to_dict() for v in created_values]), 201

@api.route('/metrics/values/<int:value_id>', methods=['PUT'])
def update_metric_value(value_id):
    """Aggiorna un singolo valore"""
    value = MetricValue.query.get_or_404(value_id)
    data = request.get_json()

    value.valore_x = data.get('valore_x', value.valore_x)
    value.valore_y = data.get('valore_y', value.valore_y)

    db.session.commit()

    return jsonify(value.to_dict())

@api.route('/metrics/values/<int:value_id>', methods=['DELETE'])
def delete_metric_value(value_id):
    """Elimina un singolo valore"""
    value = MetricValue.query.get_or_404(value_id)
    db.session.delete(value)
    db.session.commit()

    return jsonify({'message': 'Valore eliminato con successo'}), 200

# ============ CHARTS ============

@api.route('/athletes/<int:athlete_id>/charts', methods=['GET'])
def get_charts(athlete_id):
    Athlete.query.get_or_404(athlete_id)
    charts = Chart.query.filter_by(athlete_id=athlete_id).order_by(Chart.created_at.desc()).all()
    return jsonify([c.to_dict() for c in charts])

@api.route('/athletes/<int:athlete_id>/charts', methods=['POST'])
def create_chart(athlete_id):
    Athlete.query.get_or_404(athlete_id)
    data = request.get_json()

    chart = Chart(
        athlete_id=athlete_id,
        nome=data['nome'],
        tipo=data['tipo']
    )

    if data.get('config'):
        chart.set_config(data['config'])

    db.session.add(chart)
    db.session.commit()

    return jsonify(chart.to_dict()), 201

@api.route('/charts/<int:id>', methods=['PUT'])
def update_chart(id):
    chart = Chart.query.get_or_404(id)
    data = request.get_json()

    chart.nome = data.get('nome', chart.nome)
    chart.tipo = data.get('tipo', chart.tipo)

    if data.get('config'):
        chart.set_config(data['config'])

    db.session.commit()

    return jsonify(chart.to_dict())

@api.route('/charts/<int:id>', methods=['DELETE'])
def delete_chart(id):
    chart = Chart.query.get_or_404(id)
    db.session.delete(chart)
    db.session.commit()

    return jsonify({'message': 'Grafico eliminato con successo'}), 200
