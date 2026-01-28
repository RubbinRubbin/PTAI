from flask import request, jsonify, send_file
from datetime import datetime
from . import api
from database import db
from models import Athlete
from services.excel_export import export_athlete_to_excel
import io

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
        note=data.get('note')
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

    excel_buffer = export_athlete_to_excel(athlete)

    return send_file(
        excel_buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'{athlete.cognome}_{athlete.nome}_profilo.xlsx'
    )
