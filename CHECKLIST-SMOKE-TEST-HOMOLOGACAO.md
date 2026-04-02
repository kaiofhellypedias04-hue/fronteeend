# Checklist Manual de Smoke Test para Homologação

**Data de Execução:** [INSIRA A DATA]  
**Executor:** [INSIRA SEU NOME]  
**Ambiente:** [ex: homologação]  

Instruções:  
- Abra o aplicativo no navegador (ex: http://localhost:3000 ou URL de homologação).  
- Execute cada passo sequencialmente.  
- Marque o status:  
  - [ ] OK  
  - [ ] FALHOU  
  - [ ] NÃO SE APLICA  
- Se FALHOU, anote observações.

## 1. Fila de Trabalho A
| # | Ação | Resultado Esperado | Status | Observações |
|---|------|--------------------|--------|-------------|
| 1.1 | Acessar menu/página "Fila de Trabalho A" | Página carrega sem erros, lista itens visíveis | [ ] OK [ ] FALHOU [ ] N/A | |
| 1.2 | Selecionar um item da fila A | Detalhes do item abrem corretamente | [ ] OK [ ] FALHOU [ ] N/A | |
| 1.3 | Atualizar/refrescar a fila A | Lista atualiza sem erros | [ ] OK [ ] FALHOU [ ] N/A | |

## 2. Fila de Trabalho B
| # | Ação | Resultado Esperado | Status | Observações |
|---|------|--------------------|--------|-------------|
| 2.1 | Acessar menu/página "Fila de Trabalho B" | Página carrega sem erros, lista itens visíveis | [ ] OK [ ] FALHOU [ ] N/A | |
| 2.2 | Selecionar um item da fila B | Detalhes do item abrem corretamente | [ ] OK [ ] FALHOU [ ] N/A | |
| 2.3 | Atualizar/refrescar a fila B | Lista atualiza sem erros | [ ] OK [ ] FALHOU [ ] N/A | |

## 3. Documentos da Nota
| # | Ação | Resultado Esperado | Status | Observações |
|---|------|--------------------|--------|-------------|
| 3.1 | Acessar seção "Documentos da Nota" | Lista de documentos carrega, PDF/XML visíveis | [ ] OK [ ] FALHOU [ ] N/A | |
| 3.2 | Clicar em um documento para visualizar | Documento abre/preview sem erros | [ ] OK [ ] FALHOU [ ] N/A | |
| 3.3 | Baixar um documento | Download inicia corretamente | [ ] OK [ ] FALHOU [ ] N/A | |

## 4. Regressão Básica de NFS-e
| # | Ação | Resultado Esperado | Status | Observações |
|---|------|--------------------|--------|-------------|
| 4.1 | Acessar página/fluxo de NFS-e | Página NFS-e carrega sem erros | [ ] OK [ ] FALHOU [ ] N/A | |
| 4.2 | Buscar uma NFS-e por número/chave | Resultados aparecem corretamente | [ ] OK [ ] FALHOU [ ] N/A | |
| 4.3 | Visualizar detalhes de NFS-e | Dados da nota exibidos integralmente | [ ] OK [ ] FALHOU [ ] N/A | |

## 5. Regressão Básica de Certificados, Credenciais, Processos e Relatórios
| # | Ação | Resultado Esperado | Status | Observações |
|---|------|--------------------|--------|-------------|
| 5.1 | Acessar configurações de Certificados/Credenciais | Campos carregam, sem erros de autenticação | [ ] OK [ ] FALHOU [ ] N/A | |
| 5.2 | Acessar lista de Processos | Processos listados, filtros funcionam | [ ] OK [ ] FALHOU [ ] N/A | |
| 5.3 | Gerar/exportar um Relatório | Relatório gera e baixa sem erros | [ ] OK [ ] FALHOU [ ] N/A | |
| 5.4 | Navegar entre telas principais (home, menus) | Todas as navegações fluem sem crashes | [ ] OK [ ] FALHOU [ ] N/A | |

**Resumo Final:**  
- Total OK: ___ / ___  
- Falhas: ___  
- Observações Gerais:  

**Assinatura:** ____________________
