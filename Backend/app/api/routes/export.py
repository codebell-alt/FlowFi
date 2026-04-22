from fastapi import APIRouter, Query, Header
from fastapi.responses import StreamingResponse
from fastapi.exceptions import HTTPException
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
import logging
from app.middleware.auth import extract_user_id_from_token
from app.database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/export", tags=["export"])


@router.get("/report-pdf")
async def export_report_pdf(
    desde: str = Query(None),
    hasta: str = Query(None),
    authorization: str = Header(None)
):
    """Exporta reporte de gastos e ingresos a PDF"""
    
    try:
        logger.info(f"PDF Export requested - Authorization header: {authorization[:30] if authorization else 'NONE'}...")
        
        user_id = extract_user_id_from_token(authorization)
        supabase = get_supabase_client()
        
        # Extract token from Authorization header (remove "Bearer " prefix)
        token = authorization.replace("Bearer ", "") if authorization else None
        
        logger.info(f"Token extracted: {token[:30] if token else 'NONE'}...")
        
        if not token:
            raise HTTPException(status_code=401, detail="No authentication token provided")
        
        # Obtener datos usando query_authenticated para que RLS funcione
        try:
            expenses_response = await supabase.query_authenticated(token, "expenses", {"select": "*"})
            expenses = expenses_response.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching expenses: {e}")
            expenses = []
        
        try:
            incomes_response = await supabase.query_authenticated(token, "incomes", {"select": "*"})
            incomes = incomes_response.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching incomes: {e}")
            incomes = []
        
        # Obtener categorías (usando service role para tablas compartidas)
        try:
            client = supabase.service_role_client
            categories_response = client.table("expense_categories").select("*").execute()
            categories = {cat['id']: cat.get('name', 'N/A') for cat in (categories_response.data or [])}
        except Exception as e:
            logger.error(f"Error fetching categories: {e}")
            categories = {}
        
        # Obtener tipos de ingresos (usando service role)
        try:
            client = supabase.service_role_client
            types_response = client.table("income_types").select("*").execute()
            income_types = {t['id']: t.get('name', 'N/A') for t in (types_response.data or [])}
        except Exception as e:
            logger.error(f"Error fetching income types: {e}")
            income_types = {}
        
        # Datos ya filtrados por RLS en el backend (user_id = auth.uid())
        # No necesitamos filtrar manualmente
        
        # Crear PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1F2937'),
            spaceAfter=15,
            alignment=1
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#374151'),
            spaceAfter=10,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        )
        
        normal_style = styles['Normal']
        
        # Titulo
        elements.append(Paragraph("REPORTE DE TRANSACCIONES", title_style))
        elements.append(Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", normal_style))
        if desde or hasta:
            elements.append(Paragraph(f"Periodo: {desde} a {hasta}", normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Tabla de Gastos
        elements.append(Paragraph("GASTOS", heading_style))
        expense_data = [["Fecha", "Categoria", "Descripcion", "Monto"]]
        total_expenses = 0.0
        
        for exp in expenses:
            try:
                amount = float(exp.get("amount", 0))
                category_id = exp.get("category_id")
                category_name = categories.get(category_id, "N/A") if category_id else "N/A"
                
                expense_data.append([
                    str(exp.get("date", ""))[:10],
                    str(category_name)[:20],
                    str(exp.get("description", ""))[:30],
                    f"${amount:,.2f}"
                ])
                total_expenses += amount
            except Exception as e:
                logger.error(f"Error processing expense: {e}")
        
        if len(expense_data) == 1:
            expense_data.append(["", "", "Sin gastos", "$0.00"])
        
        expense_data.append(["", "", "TOTAL", f"${total_expenses:,.2f}"])
        
        expense_table = Table(expense_data, colWidths=[1*inch, 1.3*inch, 2.2*inch, 1.5*inch])
        expense_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6B7280')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#EF4444')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#F9FAFB')]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(expense_table)
        elements.append(Spacer(1, 0.25*inch))
        
        # Tabla de Ingresos
        elements.append(Paragraph("INGRESOS", heading_style))
        income_data = [["Fecha", "Tipo", "Descripcion", "Monto"]]
        total_incomes = 0.0
        
        for inc in incomes:
            try:
                amount = float(inc.get("amount", 0))
                income_type_id = inc.get("income_type_id")
                type_name = income_types.get(income_type_id, "N/A") if income_type_id else "N/A"
                
                income_data.append([
                    str(inc.get("date", ""))[:10],
                    str(type_name)[:20],
                    str(inc.get("description", ""))[:30],
                    f"${amount:,.2f}"
                ])
                total_incomes += amount
            except Exception as e:
                logger.error(f"Error processing income: {e}")
        
        if len(income_data) == 1:
            income_data.append(["", "", "Sin ingresos", "$0.00"])
        
        income_data.append(["", "", "TOTAL", f"${total_incomes:,.2f}"])
        
        income_table = Table(income_data, colWidths=[1*inch, 1.3*inch, 2.2*inch, 1.5*inch])
        income_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10B981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#F0FDF4')]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(income_table)
        
        # Balance
        elements.append(Spacer(1, 0.2*inch))
        balance = total_incomes - total_expenses
        balance_color = '#10B981' if balance >= 0 else '#EF4444'
        elements.append(Paragraph(
            f"<b>Balance: <font color='{balance_color}'>${balance:,.2f}</font></b>",
            heading_style
        ))
        
        # Generar PDF
        doc.build(elements)
        buffer.seek(0)
        
        logger.info(f"PDF generated successfully. Expenses: {len(expenses)}, Incomes: {len(incomes)}")
        
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=reporte_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"}
        )
    
    except Exception as e:
        logger.error(f"Error generating PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generando PDF: {str(e)}"
        )
