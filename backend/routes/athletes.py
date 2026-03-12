from flask import request, jsonify, send_file
from datetime import datetime
from . import api
from database import db
from models import Athlete
from services.export_service import export_athlete_to_json, export_multiple_athletes_to_json
import io
import json

@api.route('/athletes', methods=['GET'])
def get_athletes():
    athletes = Athlete.query.order_by(Athlete.updated_at.desc()).all()
    return jsonify([a.to_dict() for a in athletes])

@api.route('/athletes/<int:id>', methods=['GET'])
def get_athlete(id):
    athlete = Athlete.query.get_or_404(id)
    return jsonify(athlete.to_dict())

@api.route('/athletes', methods=['POST'])
def create_athlete():
    data = request.get_json()

    athlete = Athlete(
        nome=data['nome'],
        cognome=data['cognome'],
        eta=data['eta'],
        sport=data['sport'],
        descrizione=data.get('descrizione'),
        altezza=data.get('altezza'),
        peso=data.get('peso'),
        data_nascita=datetime.fromisoformat(data['data_nascita']) if data.get('data_nascita') else None,
        note=data.get('note'),
        pagato=data.get('pagato', False)
    )

    db.session.add(athlete)
    db.session.commit()

    return jsonify(athlete.to_dict()), 201

@api.route('/athletes/<int:id>', methods=['PUT'])
def update_athlete(id):
    athlete = Athlete.query.get_or_404(id)
    data = request.get_json()

    athlete.nome = data.get('nome', athlete.nome)
    athlete.cognome = data.get('cognome', athlete.cognome)
    athlete.eta = data.get('eta', athlete.eta)
    athlete.sport = data.get('sport', athlete.sport)
    athlete.descrizione = data.get('descrizione', athlete.descrizione)
    athlete.altezza = data.get('altezza', athlete.altezza)
    athlete.peso = data.get('peso', athlete.peso)
    athlete.note = data.get('note', athlete.note)
    athlete.pagato = data.get('pagato', athlete.pagato)

    if data.get('data_nascita'):
        athlete.data_nascita = datetime.fromisoformat(data['data_nascita'])

    db.session.commit()

    return jsonify(athlete.to_dict())

@api.route('/athletes/<int:id>', methods=['DELETE'])
def delete_athlete(id):
    athlete = Athlete.query.get_or_404(id)
    db.session.delete(athlete)
    db.session.commit()

    return jsonify({'message': 'Atleta eliminato con successo'}), 200

@api.route('/athletes/<int:id>/export', methods=['GET'])
def export_athlete(id):
    athlete = Athlete.query.get_or_404(id)

    data = export_athlete_to_json(athlete)
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    buffer = io.BytesIO(json_str.encode('utf-8'))
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/json',
        as_attachment=True,
        download_name=f'{athlete.cognome}_{athlete.nome}_backup.json'
    )

@api.route('/athletes/export', methods=['POST'])
def export_multiple_athletes():
    data = request.get_json()
    athlete_ids = data.get('athlete_ids', [])

    athletes = Athlete.query.filter(Athlete.id.in_(athlete_ids)).all()

    export_data = export_multiple_athletes_to_json(athletes)
    json_str = json.dumps(export_data, ensure_ascii=False, indent=2)
    buffer = io.BytesIO(json_str.encode('utf-8'))
    buffer.seek(0)

    today = datetime.now().strftime('%Y%m%d')
    return send_file(
        buffer,
        mimetype='application/json',
        as_attachment=True,
        download_name=f'atleti_backup_{today}.json'
    )
