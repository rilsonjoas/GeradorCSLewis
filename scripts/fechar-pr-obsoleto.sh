#!/usr/bin/env bash
# Chamado por .github/workflows/sync-quotes.yml quando a cópia embutida JÁ está em dia com a API do Scriptorium.
# Se o fluxo tinha aberto um PR da cópia (branch chore/sync-quotes-snapshot) e, antes do merge, a diferença sumiu
# (por exemplo, a citação foi reativada), o PR ficou obsoleto: fecha e apaga a branch, com um comentário.
# Procura só PR aberto, dessa branch e da base BASE (obrigatória): nunca toca em PR de outra base.
set -euo pipefail
BRANCH="${PR_BRANCH:-chore/sync-quotes-snapshot}"
BASE="${BASE:?BASE é obrigatória}"

ABERTO=$(gh pr list --head "$BRANCH" --base "$BASE" --state open --json number --jq '.[0].number // empty')
if [ -z "$ABERTO" ]; then
  echo "Nenhum PR aberto da cópia; nada a fechar."
  exit 0
fi
gh pr close "$ABERTO" --delete-branch --comment "A cópia embutida já está em dia com a API do Scriptorium (a diferença que motivou este PR sumiu antes do merge). Fechado pelo fluxo sync-quotes.yml."
echo "PR #$ABERTO fechado: a cópia já está em dia."
