import csv
import pandas as pd
from fpdf import FPDF
from datetime import datetime
import os
from pathlib import Path
from fastapi import HTTPException

EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)

def get_export_filename(prefix: str, extension: str):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return EXPORT_DIR / f"{prefix}_{timestamp}.{extension}"

def export_to_csv(data, filename):
    if not data:
        raise HTTPException(status_code=404, detail="No data to export.")
    
    with open(filename, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        headers = list(data[0].keys())
        writer.writerow(headers)
        for row in data:
            writer.writerow([row.get(header, "") for header in headers])
    return filename

def export_to_excel(data, filename):
    if not data:
        raise HTTPException(status_code=404, detail="No data to export.")

    df = pd.DataFrame(data)
    df.to_excel(filename, index=False)
    return filename

def export_to_pdf(data, filename):
    if not data:
        raise HTTPException(status_code=404, detail="No data to export.")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=10)

    headers = list(data[0].keys())
    pdf.set_fill_color(200, 220, 255)

    for header in headers:
        pdf.cell(40, 10, txt=header, border=1, ln=0)
    pdf.ln()

    for row in data:
        for header in headers:
            pdf.cell(40, 10, txt=str(row.get(header, "")), border=1, ln=0)
        pdf.ln()

    pdf.output(str(filename))
    return filename
