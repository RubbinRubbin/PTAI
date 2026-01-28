from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.utils import get_column_letter
from io import BytesIO

def export_athlete_to_excel(athlete):
    wb = Workbook()

    # Stili
    header_font = Font(bold=True, size=12)
    title_font = Font(bold=True, size=14)
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font_white = Font(bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )

    # ========== FOGLIO PROFILO ==========
    ws_profile = wb.active
    ws_profile.title = "Profilo Atleta"

    # Titolo
    ws_profile['A1'] = f"Profilo: {athlete.nome} {athlete.cognome}"
    ws_profile['A1'].font = title_font
    ws_profile.merge_cells('A1:B1')

    # Dati profilo
    profile_data = [
        ("Nome", athlete.nome),
        ("Cognome", athlete.cognome),
        ("Età", athlete.eta),
        ("Sport", athlete.sport),
        ("Altezza (cm)", athlete.altezza or "N/D"),
        ("Peso (kg)", athlete.peso or "N/D"),
        ("Data di nascita", athlete.data_nascita.strftime("%d/%m/%Y") if athlete.data_nascita else "N/D"),
        ("Descrizione", athlete.descrizione or "N/D"),
        ("Note", athlete.note or "N/D"),
    ]

    for i, (label, value) in enumerate(profile_data, start=3):
        ws_profile[f'A{i}'] = label
        ws_profile[f'A{i}'].font = header_font
        ws_profile[f'B{i}'] = value

    ws_profile.column_dimensions['A'].width = 20
    ws_profile.column_dimensions['B'].width = 40

    # ========== FOGLIO METRICHE ==========
    ws_metrics = wb.create_sheet("Metriche")

    # Header metriche
    metric_headers = ["Data", "Nome", "Valore", "Unità", "Asse", "Categoria"]
    for col, header in enumerate(metric_headers, start=1):
        cell = ws_metrics.cell(row=1, column=col, value=header)
        cell.font = header_font_white
        cell.fill = header_fill
        cell.border = thin_border
        cell.alignment = Alignment(horizontal='center')

    # Dati metriche
    for row, metric in enumerate(athlete.metrics, start=2):
        ws_metrics.cell(row=row, column=1, value=metric.data_registrazione.strftime("%d/%m/%Y %H:%M") if metric.data_registrazione else "")
        ws_metrics.cell(row=row, column=2, value=metric.nome)
        ws_metrics.cell(row=row, column=3, value=metric.valore)
        ws_metrics.cell(row=row, column=4, value=metric.unita_misura)
        ws_metrics.cell(row=row, column=5, value=metric.asse)
        ws_metrics.cell(row=row, column=6, value=metric.categoria or "")

        for col in range(1, 7):
            ws_metrics.cell(row=row, column=col).border = thin_border

    # Auto-width colonne
    for col in range(1, 7):
        ws_metrics.column_dimensions[get_column_letter(col)].width = 15

    # ========== FOGLIO GRAFICI SALVATI ==========
    ws_charts = wb.create_sheet("Grafici Salvati")

    chart_headers = ["Nome", "Tipo", "Data Creazione"]
    for col, header in enumerate(chart_headers, start=1):
        cell = ws_charts.cell(row=1, column=col, value=header)
        cell.font = header_font_white
        cell.fill = header_fill
        cell.border = thin_border

    for row, chart in enumerate(athlete.charts, start=2):
        ws_charts.cell(row=row, column=1, value=chart.nome)
        ws_charts.cell(row=row, column=2, value=chart.tipo)
        ws_charts.cell(row=row, column=3, value=chart.created_at.strftime("%d/%m/%Y %H:%M") if chart.created_at else "")

        for col in range(1, 4):
            ws_charts.cell(row=row, column=col).border = thin_border

    for col in range(1, 4):
        ws_charts.column_dimensions[get_column_letter(col)].width = 20

    # Salva in buffer
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return buffer
