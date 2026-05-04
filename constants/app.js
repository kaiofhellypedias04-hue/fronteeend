(function (global) {
  const APP_LOCALE = 'pt-BR';
  const APP_TIME_ZONE = 'America/Sao_Paulo';

  const RELATORIO_COLUNAS = [
    { header: 'Competência',            key: 'competencia' },
    { header: 'Município',              key: 'municipio' },
    { header: 'Chave de Acesso',        key: 'chave_acesso' },
    { header: 'Data de Emissão',        key: 'data_emissao' },
    { header: 'CNPJ/CPF',              key: 'cnpj_cpf' },
    { header: 'Razão Social',           key: 'razao_social' },
    { header: 'N° Documento',           key: 'numero_documento' },
    { header: 'Valor Total',            key: 'valor_total' },
    { header: 'Valor B/C',              key: 'valor_base' },
    { header: 'Status Base de Cálculo', key: 'status_base_calculo' },
    { header: 'CSRF',                   key: 'csrf' },
    { header: 'IRRF',                   key: 'irrf' },
    { header: 'Percentual IRRF',        key: 'percentual_irrf' },
    { header: 'INSS',                   key: 'inss' },
    { header: 'ISS',                    key: 'iss' },
    { header: 'Valor Líquido',          key: 'valor_liquido' },
    { header: 'Valor Líquido Correto',  key: 'valor_liquido_correto' },
    { header: 'Status Valor Líquido',   key: 'status_valor_liquido' },
    { header: 'Campos ausentes no XML', key: 'campos_ausentes_xml' },
    { header: 'Incidência do ISS',      key: 'incidencia_iss' },
    { header: 'Data do pagamento',      key: 'data_pagamento' },
    { header: 'Código de serviço',      key: 'codigo_servico' },
    { header: 'Descrição do Serviço',   key: 'descricao_servico' },
    { header: 'Código NBS',             key: 'codigo_nbs' },
    { header: 'Código CNAE',            key: 'cnae' },
    { header: 'Descrição CNAE',         key: 'descricao_cnae' },
    { header: 'Simples Nacional / XML', key: 'simples_nacional' },
    { header: 'Consulta Simples API',   key: 'consulta_simples_api' },
    { header: 'Status Simples Nacional',key: 'status_simples_nacional' },
    { header: 'Status nota',            key: 'status_nota' },
    { header: 'Status nota PDF',        key: 'status_nota_pdf' },
    { header: 'Status',                 key: 'status' },
    { header: 'Prioridade',             key: 'prioridade' },
    { header: 'Responsável',            key: 'responsavel' },
    { header: 'Conferência',            key: 'conferencia' },
    { header: 'Observação interna',     key: 'observacao_interna' },
    { header: 'Status CSRF',            key: 'status_csrf' },
    { header: 'Status IRRF',            key: 'status_irrf' },
    { header: 'Status INSS',            key: 'status_inss' },
    { header: 'Alertas Fiscais',        key: 'alertas_fiscais' },
    { header: 'dia processado',         key: 'dia_processado' },
  ];

  global.NFSEConstants = Object.freeze({
    APP_LOCALE,
    APP_TIME_ZONE,
    RELATORIO_COLUNAS,
  });
})(window);
