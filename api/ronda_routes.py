from flask import request, jsonify
from flask_cors import cross_origin
from app import csrf
from datetime import datetime
# from app.models.ronda import Ronda  # Comentado pois o modelo não existe
from app.models.condominio import Condominio
# from app.services.ronda_routes_core.routes_service import RondaRoutesService  # Comentado
# from app.services.ronda_utils import RondaUtils  # Comentado
from app import db
from . import api_bp

# Mock data para simular rondas
RONDAS_MOCK = []

@api_bp.route("/rondas/do-dia/<int:condominio_id>/<data>", methods=["GET"])
@cross_origin()
@csrf.exempt
def listar_rondas_do_dia(condominio_id, data):
    """Lista todas as rondas de um condomínio em uma data específica."""
    try:
        # Converter data string para objeto date
        data_obj = datetime.strptime(data, "%Y-%m-%d").date()
        
        # Filtrar rondas mock do dia
        rondas_do_dia = [r for r in RONDAS_MOCK if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        resultado = []
        for ronda in rondas_do_dia:
            resultado.append({
                "id": ronda.get('id'),
                "condominio_id": ronda.get('condominio_id'),
                "condominio_nome": f"Condomínio {condominio_id}",
                "data_plantao": ronda.get('data_plantao'),
                "escala_plantao": ronda.get('escala_plantao', '06h às 18h'),
                "log_bruto": ronda.get('log_bruto'),
                "total_rondas": ronda.get('total_rondas', 0),
                "duracao_total_minutos": ronda.get('duracao_total_minutos', 0),
                "primeiro_evento_utc": ronda.get('primeiro_evento_utc'),
                "ultimo_evento_utc": ronda.get('ultimo_evento_utc'),
                "supervisor_id": ronda.get('supervisor_id'),
                "supervisor_nome": f"Supervisor {ronda.get('supervisor_id', 1)}",
                "status": ronda.get('status', 'finalizada'),
                "data_criacao": ronda.get('data_criacao'),
                "data_modificacao": ronda.get('data_modificacao')
            })
        
        return jsonify({"rondas": resultado})
        
    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao listar rondas: {str(e)}"}), 500

@api_bp.route("/rondas/em-andamento/<int:condominio_id>", methods=["GET"])
@cross_origin()
@csrf.exempt
def ronda_em_andamento(condominio_id):
    """Verifica se existe uma ronda em andamento para o condomínio."""
    try:
        # Buscar ronda em andamento no mock
        ronda_ativa = next((r for r in RONDAS_MOCK if r['condominio_id'] == condominio_id and r['status'] == 'em_andamento'), None)
        
        if ronda_ativa:
            return jsonify({
                "em_andamento": True,
                "ronda": {
                    "id": ronda_ativa['id'],
                    "inicio": ronda_ativa.get('primeiro_evento_utc'),
                    "data_plantao": ronda_ativa.get('data_plantao'),
                    "escala_plantao": ronda_ativa.get('escala_plantao'),
                    "supervisor_id": ronda_ativa.get('supervisor_id')
                }
            })
        else:
            return jsonify({"em_andamento": False, "ronda": None})
            
    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao verificar ronda em andamento: {str(e)}"}), 500

@api_bp.route("/rondas/iniciar", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def iniciar_ronda():
    """Inicia uma nova ronda para um condomínio."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"sucesso": False, "message": "Dados não fornecidos."}), 400

        # Campos obrigatórios
        condominio_id = data.get("condominio_id")
        data_plantao = data.get("data_plantao")
        
        if not condominio_id or not data_plantao:
            return jsonify({"sucesso": False, "message": "Condomínio e data são obrigatórios."}), 400

        # Verificar se já existe ronda em andamento
        ronda_ativa = next((r for r in RONDAS_MOCK if r['condominio_id'] == condominio_id and r['status'] == 'em_andamento'), None)
        
        if ronda_ativa:
            return jsonify({"sucesso": False, "message": "Já existe uma ronda em andamento para este condomínio."}), 400

        # Criar nova ronda mock
        nova_ronda = {
            "id": len(RONDAS_MOCK) + 1,
            "condominio_id": condominio_id,
            "data_plantao": data_plantao,
            "escala_plantao": data.get("escala_plantao", "06h às 18h"),
            "log_bruto": f"Início de ronda: {datetime.now().strftime('%H:%M')}",
            "status": "em_andamento",
            "primeiro_evento_utc": datetime.utcnow().isoformat(),
            "supervisor_id": data.get("supervisor_id", 1),
            "data_criacao": datetime.now().isoformat(),
            "data_modificacao": datetime.now().isoformat()
        }

        # Adicionar ao mock
        RONDAS_MOCK.append(nova_ronda)

        return jsonify({
            "sucesso": True,
            "message": "Ronda iniciada com sucesso.",
            "ronda_id": nova_ronda["id"],
            "inicio": nova_ronda["primeiro_evento_utc"]
        }), 201

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao iniciar ronda: {str(e)}"}), 500

@api_bp.route("/rondas/finalizar/<int:ronda_id>", methods=["PUT", "OPTIONS"])
@cross_origin()
@csrf.exempt
def finalizar_ronda(ronda_id):
    """Finaliza uma ronda em andamento."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Encontrar ronda no mock
        ronda = next((r for r in RONDAS_MOCK if r['id'] == ronda_id), None)
        
        if not ronda:
            return jsonify({"sucesso": False, "message": "Ronda não encontrada."}), 404
        
        if ronda['status'] != "em_andamento":
            return jsonify({"sucesso": False, "message": "Apenas rondas em andamento podem ser finalizadas."}), 400

        # Atualizar ronda
        ronda['status'] = "finalizada"
        ronda['ultimo_evento_utc'] = datetime.utcnow().isoformat()
        ronda['log_bruto'] += f"\nTérmino de ronda: {datetime.now().strftime('%H:%M')}"
        ronda['data_modificacao'] = datetime.now().isoformat()

        # Calcular duração se necessário
        if ronda.get('primeiro_evento_utc') and ronda.get('ultimo_evento_utc'):
            inicio = datetime.fromisoformat(ronda['primeiro_evento_utc'].replace('Z', '+00:00'))
            fim = datetime.fromisoformat(ronda['ultimo_evento_utc'].replace('Z', '+00:00'))
            duracao = (fim - inicio).total_seconds() / 60
            ronda['duracao_total_minutos'] = int(duracao)

        return jsonify({
            "sucesso": True,
            "message": "Ronda finalizada com sucesso.",
            "duracao_minutos": ronda.get('duracao_total_minutos', 0)
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao finalizar ronda: {str(e)}"}), 500

@api_bp.route("/rondas/atualizar/<int:ronda_id>", methods=["PUT", "OPTIONS"])
@cross_origin()
@csrf.exempt
def atualizar_ronda(ronda_id):
    """Atualiza uma ronda em andamento."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"sucesso": False, "message": "Dados não fornecidos."}), 400

        # Encontrar ronda no mock
        ronda = next((r for r in RONDAS_MOCK if r['id'] == ronda_id), None)
        
        if not ronda:
            return jsonify({"sucesso": False, "message": "Ronda não encontrada."}), 404

        # Atualizar campos
        if 'log_bruto' in data:
            ronda['log_bruto'] = data['log_bruto']
        if 'observacoes' in data:
            ronda['observacoes'] = data['observacoes']
        
        ronda['data_modificacao'] = datetime.now().isoformat()

        return jsonify({
            "sucesso": True,
            "message": "Ronda atualizada com sucesso."
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao atualizar ronda: {str(e)}"}), 500

@api_bp.route("/rondas/gerar-relatorio/<int:condominio_id>/<data>", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def gerar_relatorio_ronda(condominio_id, data):
    """Gera relatório de rondas para um condomínio em uma data específica."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Filtrar rondas do dia
        rondas_do_dia = [r for r in RONDAS_MOCK if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        if not rondas_do_dia:
            return jsonify({"sucesso": False, "message": "Nenhuma ronda encontrada para esta data."}), 404

        # Gerar relatório mock
        relatorio = f"""
RELATÓRIO DE RONDAS - CONDOMÍNIO {condominio_id}
Data: {data}
Total de Rondas: {len(rondas_do_dia)}

DETALHES:
"""
        
        for ronda in rondas_do_dia:
            relatorio += f"""
Ronda #{ronda['id']}
- Status: {ronda['status']}
- Escala: {ronda.get('escala_plantao', 'N/A')}
- Início: {ronda.get('primeiro_evento_utc', 'N/A')}
- Fim: {ronda.get('ultimo_evento_utc', 'N/A')}
- Duração: {ronda.get('duracao_total_minutos', 0)} minutos
- Log: {ronda.get('log_bruto', 'N/A')}
"""

        return jsonify({
            "sucesso": True,
            "message": "Relatório gerado com sucesso.",
            "relatorio": relatorio
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao gerar relatório: {str(e)}"}), 500

@api_bp.route("/rondas/enviar-whatsapp/<int:condominio_id>/<data>", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def enviar_ronda_whatsapp(condominio_id, data):
    """Simula envio de relatório via WhatsApp."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Simular envio
        return jsonify({
            "sucesso": True,
            "message": "Relatório enviado via WhatsApp com sucesso.",
            "whatsapp_url": f"https://wa.me/?text=Relatório%20de%20Rondas%20-%20Condomínio%20{condominio_id}%20-%20{data}"
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao enviar WhatsApp: {str(e)}"}), 500

@api_bp.route("/rondas/<int:ronda_id>", methods=["GET", "OPTIONS"])
@cross_origin()
@csrf.exempt
def detalhe_ronda(ronda_id):
    """Retorna detalhes de uma ronda específica."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Encontrar ronda no mock
        ronda = next((r for r in RONDAS_MOCK if r['id'] == ronda_id), None)
        
        if not ronda:
            return jsonify({"sucesso": False, "message": "Ronda não encontrada."}), 404

        return jsonify({
            "sucesso": True,
            "ronda": ronda
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao buscar ronda: {str(e)}"}), 500 