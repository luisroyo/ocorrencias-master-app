from flask import request, jsonify
from flask_cors import cross_origin
from app import csrf
from datetime import datetime, date
# from app.services.ronda_esporadica_consolidacao_service import RondaEsporadicaConsolidacaoService  # Comentado
from . import api_bp

# Importar o mock de rondas esporádicas
from .ronda_esporadica_routes import RONDAS_ESPORADICAS_MOCK

@api_bp.route("/rondas-esporadicas/consolidar-e-enviar/<int:condominio_id>/<data>", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def consolidar_e_enviar_whatsapp(condominio_id, data):
    """Consolida rondas esporádicas e envia via WhatsApp."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Filtrar rondas do dia
        rondas_do_dia = [r for r in RONDAS_ESPORADICAS_MOCK 
                         if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        if not rondas_do_dia:
            return jsonify({"sucesso": False, "message": "Nenhuma ronda encontrada para consolidação."}), 404

        # Gerar relatório consolidado
        relatorio = f"""
RELATÓRIO CONSOLIDADO - RONDAS ESPORÁDICAS
Condomínio: {condominio_id}
Data: {data}
Total de Rondas: {len(rondas_do_dia)}

DETALHES:
"""
        
        for ronda in rondas_do_dia:
            relatorio += f"""
Ronda #{ronda['id']}
- Status: {ronda['status']}
- Turno: {ronda.get('turno', 'N/A')}
- Entrada: {ronda.get('hora_entrada', 'N/A')}
- Saída: {ronda.get('hora_saida', 'N/A')}
- Observações: {ronda.get('observacoes', 'N/A')}
"""

        # Simular envio WhatsApp
        whatsapp_url = f"https://wa.me/?text={relatorio.replace(' ', '%20').replace('\n', '%0A')}"

        return jsonify({
            "sucesso": True,
            "message": "Rondas consolidadas e enviadas via WhatsApp com sucesso.",
            "relatorio_consolidado": relatorio,
            "total_rondas": len(rondas_do_dia),
            "periodo": f"{data}",
            "whatsapp_url": whatsapp_url
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro na consolidação: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/marcar-processadas/<int:condominio_id>/<data>", methods=["PUT", "OPTIONS"])
@cross_origin()
@csrf.exempt
def marcar_rondas_processadas(condominio_id, data):
    """Marca rondas esporádicas como processadas após consolidação."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Filtrar rondas do dia
        rondas_do_dia = [r for r in RONDAS_ESPORADICAS_MOCK 
                         if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        if not rondas_do_dia:
            return jsonify({"sucesso": False, "message": "Nenhuma ronda encontrada."}), 404

        # Marcar como processadas
        for ronda in rondas_do_dia:
            ronda['processada'] = True
            ronda['data_modificacao'] = datetime.now().isoformat()

        return jsonify({
            "sucesso": True,
            "message": "Rondas marcadas como processadas com sucesso"
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/estatisticas/<int:condominio_id>", methods=["GET"])
@cross_origin()
@csrf.exempt
def obter_estatisticas_consolidacao(condominio_id):
    """Obtém estatísticas de consolidação para um período."""
    try:
        # Parâmetros de data
        data_inicio_str = request.args.get("data_inicio")
        data_fim_str = request.args.get("data_fim")
        
        if not data_inicio_str or not data_fim_str:
            return jsonify({"sucesso": False, "message": "Data início e fim são obrigatórias"}), 400

        # Filtrar rondas no período
        rondas_periodo = [r for r in RONDAS_ESPORADICAS_MOCK 
                         if r['condominio_id'] == condominio_id 
                         and data_inicio_str <= r['data_plantao'] <= data_fim_str]

        # Calcular estatísticas
        total_rondas = len(rondas_periodo)
        rondas_finalizadas = len([r for r in rondas_periodo if r['status'] == 'finalizada'])
        rondas_processadas = len([r for r in rondas_periodo if r.get('processada', False)])

        estatisticas = {
            "total_rondas": total_rondas,
            "rondas_finalizadas": rondas_finalizadas,
            "rondas_processadas": rondas_processadas,
            "periodo": f"{data_inicio_str} a {data_fim_str}",
            "taxa_finalizacao": (rondas_finalizadas / total_rondas * 100) if total_rondas > 0 else 0,
            "taxa_processamento": (rondas_processadas / total_rondas * 100) if total_rondas > 0 else 0
        }

        return jsonify({
            "sucesso": True,
            "estatisticas": estatisticas
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao obter estatísticas: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/processo-completo/<int:condominio_id>/<data>", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def processo_completo_consolidacao(condominio_id, data):
    """Executa o processo completo: consolidar, enviar WhatsApp e marcar como processadas."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Filtrar rondas do dia
        rondas_do_dia = [r for r in RONDAS_ESPORADICAS_MOCK 
                         if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        if not rondas_do_dia:
            return jsonify({"sucesso": False, "message": "Nenhuma ronda encontrada para processamento."}), 404

        # 1. Consolidar
        relatorio = f"""
RELATÓRIO CONSOLIDADO - RONDAS ESPORÁDICAS
Condomínio: {condominio_id}
Data: {data}
Total de Rondas: {len(rondas_do_dia)}

DETALHES:
"""
        
        for ronda in rondas_do_dia:
            relatorio += f"""
Ronda #{ronda['id']}
- Status: {ronda['status']}
- Turno: {ronda.get('turno', 'N/A')}
- Entrada: {ronda.get('hora_entrada', 'N/A')}
- Saída: {ronda.get('hora_saida', 'N/A')}
- Observações: {ronda.get('observacoes', 'N/A')}
"""

        # 2. Simular envio WhatsApp
        whatsapp_url = f"https://wa.me/?text={relatorio.replace(' ', '%20').replace('\n', '%0A')}"

        # 3. Marcar como processadas
        for ronda in rondas_do_dia:
            ronda['processada'] = True
            ronda['data_modificacao'] = datetime.now().isoformat()

        return jsonify({
            "sucesso": True,
            "message": "Processo completo executado com sucesso.",
            "relatorio_consolidado": relatorio,
            "total_rondas": len(rondas_do_dia),
            "periodo": f"{data}",
            "whatsapp_url": whatsapp_url,
            "processadas": len(rondas_do_dia)
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro no processo completo: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/status-consolidacao/<int:condominio_id>/<data>", methods=["GET"])
@cross_origin()
@csrf.exempt
def status_consolidacao(condominio_id, data):
    """Verifica o status da consolidação para um condomínio e data."""
    try:
        # Filtrar rondas do dia
        rondas_do_dia = [r for r in RONDAS_ESPORADICAS_MOCK 
                         if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        if not rondas_do_dia:
            return jsonify({"sucesso": False, "message": "Nenhuma ronda encontrada."}), 404

        # Calcular status
        total_rondas = len(rondas_do_dia)
        rondas_finalizadas = len([r for r in rondas_do_dia if r['status'] == 'finalizada'])
        rondas_processadas = len([r for r in rondas_do_dia if r.get('processada', False)])
        rondas_em_andamento = len([r for r in rondas_do_dia if r['status'] == 'em_andamento'])

        status = {
            "total_rondas": total_rondas,
            "rondas_finalizadas": rondas_finalizadas,
            "rondas_processadas": rondas_processadas,
            "rondas_em_andamento": rondas_em_andamento,
            "pode_consolidar": rondas_finalizadas > 0,
            "pode_processar": rondas_finalizadas > 0 and not all(r.get('processada', False) for r in rondas_do_dia if r['status'] == 'finalizada'),
            "data": data,
            "condominio_id": condominio_id
        }

        return jsonify({
            "sucesso": True,
            "status": status
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao verificar status: {str(e)}"}), 500 