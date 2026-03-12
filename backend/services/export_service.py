from datetime import datetime


def _athlete_to_dict(athlete):
    """Convert athlete + all metrics/values to a complete JSON-serializable dict."""
    return {
        "athlete": {
            "nome": athlete.nome,
            "cognome": athlete.cognome,
            "eta": athlete.eta,
            "sport": athlete.sport,
            "descrizione": athlete.descrizione,
            "altezza": athlete.altezza,
            "peso": athlete.peso,
            "data_nascita": athlete.data_nascita.isoformat() if athlete.data_nascita else None,
            "note": athlete.note,
            "pagato": athlete.pagato,
            "created_at": athlete.created_at.isoformat() if athlete.created_at else None,
            "updated_at": athlete.updated_at.isoformat() if athlete.updated_at else None,
        },
        "metric_definitions": [
            {
                "nome": d.nome,
                "asse_x_nome": d.asse_x_nome,
                "asse_x_unita": d.asse_x_unita,
                "asse_y_nome": d.asse_y_nome,
                "asse_y_unita": d.asse_y_unita,
                "note": d.note,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "values": [
                    {
                        "valore_x": v.valore_x,
                        "valore_y": v.valore_y,
                        "created_at": v.created_at.isoformat() if v.created_at else None,
                    }
                    for v in sorted(d.values, key=lambda x: x.valore_x)
                ],
            }
            for d in athlete.metric_definitions
        ],
    }


def export_athlete_to_json(athlete):
    """Export a single athlete with all metrics and values."""
    result = _athlete_to_dict(athlete)
    result["export_date"] = datetime.now().isoformat()
    result["version"] = "1.0"
    return result


def export_multiple_athletes_to_json(athletes):
    """Export multiple athletes with all their data."""
    athletes_data = []
    for athlete in athletes:
        athletes_data.append(_athlete_to_dict(athlete))

    return {
        "export_date": datetime.now().isoformat(),
        "version": "1.0",
        "athletes_count": len(athletes_data),
        "athletes": athletes_data,
    }
