from flask import request, jsonify
from flask_cors import cross_origin
from app import csrf
from datetime import datetime, time
# from app.models.ronda_esporadica import RondaEsporadica  # Comentado
from app.models.condominio import Condominio
from app.models.user import User
# from app.services.ronda_esporadica_service import RondaEsporadicaService  # Comentado
from app import db
from . import api_bp

# Mock data para simular rondas esporádicas
RONDAS_ESPORADICAS_MOCK = []

@api_bp.route("/rondas-esporadicas/validar-horario", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def validar_horario_entrada():
    """Valida se o horário informado está próximo do horário atual."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"sucesso": False, "message": "Dados não fornecidos."}), 400

        # Extrair horário do request
        hora_str = data.get("hora_entrada")
        if not hora_str:
            return jsonify({"sucesso": False, "message": "Hora de entrada é obrigatória."}), 400

        # Converter string para time
        try:
            hora_entrada = datetime.strptime(hora_str, "%H:%M").time()
        except ValueError:
            return jsonify({"sucesso": False, "message": "Formato de hora inválido. Use HH:MM."}), 400

        # Validar horário (simulação)
        hora_atual = datetime.now().time()
        diferenca = abs((hora_entrada.hour * 60 + hora_entrada.minute) - (hora_atual.hour * 60 + hora_atual.minute))
        
        horario_valido = diferenca <= 30  # 30 minutos de tolerância
        mensagem = "Horário válido" if horario_valido else "Horário muito diferente do atual"
        
        return jsonify({
            "sucesso": True,
            "horario_valido": horario_valido,
            "mensagem": mensagem,
            "hora_atual": hora_atual.strftime("%H:%M"),
            "hora_informada": hora_str
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao validar horário: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/em-andamento/<int:condominio_id>", methods=["GET"])
@cross_origin()
@csrf.exempt
def ronda_esporadica_em_andamento(condominio_id):
    """Verifica se existe uma ronda esporádica em andamento para o condomínio."""
    try:
        data_plantao = request.args.get("data_plantao")
        if not data_plantao:
            return jsonify({"sucesso": False, "message": "Data do plantão é obrigatória."}), 400

        # Verificar ronda em andamento no mock
        ronda_ativa = next((r for r in RONDAS_ESPORADICAS_MOCK 
                           if r['condominio_id'] == condominio_id 
                           and r['data_plantao'] == data_plantao 
                           and r['status'] == 'em_andamento'), None)
        
        if ronda_ativa:
            return jsonify({
                "em_andamento": True,
                "ronda": {
                    "id": ronda_ativa['id'],
                    "hora_entrada": ronda_ativa.get('hora_entrada'),
                    "data_plantao": ronda_ativa.get('data_plantao'),
                    "escala_plantao": ronda_ativa.get('escala_plantao'),
                    "turno": ronda_ativa.get('turno'),
                    "observacoes": ronda_ativa.get('observacoes'),
                    "user_id": ronda_ativa.get('user_id'),
                    "supervisor_id": ronda_ativa.get('supervisor_id')
                }
            })
        else:
            return jsonify({"em_andamento": False, "ronda": None})
            
    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao verificar ronda em andamento: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/iniciar", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def iniciar_ronda_esporadica():
    """Inicia uma nova ronda esporádica."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"sucesso": False, "message": "Dados não fornecidos."}), 400

        # Campos obrigatórios
        condominio_id = data.get("condominio_id")
        user_id = data.get("user_id")
        data_plantao = data.get("data_plantao")
        hora_entrada = data.get("hora_entrada")
        escala_plantao = data.get("escala_plantao")
        turno = data.get("turno")
        
        if not all([condominio_id, user_id, data_plantao, hora_entrada, escala_plantao, turno]):
            return jsonify({"sucesso": False, "message": "Todos os campos são obrigatórios."}), 400

        # Verificar se já existe ronda em andamento
        ronda_ativa = next((r for r in RONDAS_ESPORADICAS_MOCK 
                           if r['condominio_id'] == condominio_id 
                           and r['data_plantao'] == data_plantao 
                           and r['status'] == 'em_andamento'), None)
        
        if ronda_ativa:
            return jsonify({"sucesso": False, "message": "Já existe uma ronda em andamento para este condomínio nesta data."}), 400

        # Criar nova ronda esporádica mock
        nova_ronda = {
            "id": len(RONDAS_ESPORADICAS_MOCK) + 1,
            "condominio_id": condominio_id,
            "user_id": user_id,
            "data_plantao": data_plantao,
            "hora_entrada": hora_entrada,
            "escala_plantao": escala_plantao,
            "turno": turno,
            "observacoes": data.get("observacoes", ""),
            "supervisor_id": data.get("supervisor_id"),
            "status": "em_andamento",
            "data_criacao": datetime.now().isoformat(),
            "data_modificacao": datetime.now().isoformat()
        }

        # Adicionar ao mock
        RONDAS_ESPORADICAS_MOCK.append(nova_ronda)

        return jsonify({
            "sucesso": True,
            "message": "Ronda esporádica iniciada com sucesso.",
            "ronda_id": nova_ronda["id"]
        }), 201

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao iniciar ronda esporádica: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/finalizar/<int:ronda_id>", methods=["PUT", "OPTIONS"])
@cross_origin()
@csrf.exempt
def finalizar_ronda_esporadica(ronda_id):
    """Finaliza uma ronda esporádica em andamento."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"sucesso": False, "message": "Dados não fornecidos."}), 400

        hora_saida = data.get("hora_saida")
        if not hora_saida:
            return jsonify({"sucesso": False, "message": "Hora de saída é obrigatória."}), 400

        # Encontrar ronda no mock
        ronda = next((r for r in RONDAS_ESPORADICAS_MOCK if r['id'] == ronda_id), None)
        
        if not ronda:
            return jsonify({"sucesso": False, "message": "Ronda não encontrada."}), 404
        
        if ronda['status'] != "em_andamento":
            return jsonify({"sucesso": False, "message": "Apenas rondas em andamento podem ser finalizadas."}), 400

        # Atualizar ronda
        ronda['hora_saida'] = hora_saida
        ronda['status'] = "finalizada"
        ronda['observacoes'] = data.get("observacoes", ronda.get("observacoes", ""))
        ronda['data_modificacao'] = datetime.now().isoformat()

        return jsonify({
            "sucesso": True,
            "message": "Ronda esporádica finalizada com sucesso."
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao finalizar ronda esporádica: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/atualizar/<int:ronda_id>", methods=["PUT", "OPTIONS"])
@cross_origin()
@csrf.exempt
def atualizar_ronda_esporadica(ronda_id):
    """Atualiza uma ronda esporádica em andamento."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"sucesso": False, "message": "Dados não fornecidos."}), 400

        # Encontrar ronda no mock
        ronda = next((r for r in RONDAS_ESPORADICAS_MOCK if r['id'] == ronda_id), None)
        
        if not ronda:
            return jsonify({"sucesso": False, "message": "Ronda não encontrada."}), 404

        # Atualizar campos
        if 'observacoes' in data:
            ronda['observacoes'] = data['observacoes']
        
        ronda['data_modificacao'] = datetime.now().isoformat()

        return jsonify({
            "sucesso": True,
            "message": "Ronda esporádica atualizada com sucesso."
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao atualizar ronda esporádica: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/do-dia/<int:condominio_id>/<data>", methods=["GET"])
@cross_origin()
@csrf.exempt
def listar_rondas_esporadicas_do_dia(condominio_id, data):
    """Lista todas as rondas esporádicas de um condomínio em uma data específica."""
    try:
        # Filtrar rondas esporádicas do dia
        rondas_do_dia = [r for r in RONDAS_ESPORADICAS_MOCK 
                         if r['condominio_id'] == condominio_id and r['data_plantao'] == data]
        
        resultado = []
        for ronda in rondas_do_dia:
            resultado.append({
                "id": ronda.get('id'),
                "condominio_id": ronda.get('condominio_id'),
                "user_id": ronda.get('user_id'),
                "data_plantao": ronda.get('data_plantao'),
                "hora_entrada": ronda.get('hora_entrada'),
                "hora_saida": ronda.get('hora_saida'),
                "escala_plantao": ronda.get('escala_plantao'),
                "turno": ronda.get('turno'),
                "observacoes": ronda.get('observacoes'),
                "supervisor_id": ronda.get('supervisor_id'),
                "status": ronda.get('status'),
                "data_criacao": ronda.get('data_criacao'),
                "data_modificacao": ronda.get('data_modificacao')
            })
        
        return jsonify({"rondas": resultado})
        
    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao listar rondas esporádicas: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/consolidar-turno/<int:condominio_id>/<data>", methods=["POST", "OPTIONS"])
@cross_origin()
@csrf.exempt
def consolidar_turno_rondas_esporadicas(condominio_id, data):
    """Consolida rondas esporádicas de um turno."""
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

        return jsonify({
            "sucesso": True,
            "message": "Turno consolidado com sucesso.",
            "relatorio_consolidado": relatorio,
            "total_rondas": len(rondas_do_dia),
            "periodo": f"{data}"
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro na consolidação: {str(e)}"}), 500

@api_bp.route("/rondas-esporadicas/<int:ronda_id>", methods=["GET", "OPTIONS"])
@cross_origin()
@csrf.exempt
def detalhe_ronda_esporadica(ronda_id):
    """Retorna detalhes de uma ronda esporádica específica."""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Encontrar ronda no mock
        ronda = next((r for r in RONDAS_ESPORADICAS_MOCK if r['id'] == ronda_id), None)
        
        if not ronda:
            return jsonify({"sucesso": False, "message": "Ronda não encontrada."}), 404

        return jsonify({
            "sucesso": True,
            "ronda": ronda
        })

    except Exception as e:
        return jsonify({"sucesso": False, "message": f"Erro ao buscar ronda: {str(e)}"}), 500 