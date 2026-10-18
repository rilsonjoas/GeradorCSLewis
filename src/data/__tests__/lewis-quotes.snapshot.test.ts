import { describe, expect, it } from 'vitest';
import snapshot from '../lewis-quotes.snapshot.json';
import { isApiQuote } from '@/lib/quote-api';
import { reservaEmbutida } from '@/lib/quote-store';

/**
 * A cópia embutida é a última linha de defesa quando o Scriptorium está fora e o processo acabou de subir.
 * Se ela estiver corrompida, vazia ou com itens quebrados, o Gerador perde a única garantia de funcionar
 * sozinho, e ninguém perceberia até a próxima queda. Estes testes rodam em todo CI e no portão do deploy.
 *
 * Eles NÃO verificam se a cópia está em dia com a API (isso exige rede): quem faz isso é `npm run quotes:sync
 * -- --check` e o canário do cluster, que também acusa citação RETIRADA do acervo.
 */

describe('cópia embutida das citações (src/data/lewis-quotes.snapshot.json)', () => {
  const { citacoes } = snapshot as { citacoes: unknown[] };

  it('tem citações suficientes para ser uma reserva de verdade', () => {
    expect(citacoes.length).toBeGreaterThanOrEqual(50);
    expect(snapshot.total).toBe(citacoes.length);
  });

  it('todo item é uma citação exibível, com id e texto não vazios', () => {
    for (const q of citacoes) expect(isApiQuote(q), JSON.stringify(q).slice(0, 80)).toBe(true);
  });

  it('ids únicos', () => {
    const ids = (citacoes as { id: string }[]).map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ordenada por id (a diferença no git mostra só o que entrou, saiu ou mudou)', () => {
    const ids = (citacoes as { id: string }[]).map((q) => q.id);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });

  it('o carimbo de geração é uma data válida e não é do futuro', () => {
    const quando = new Date(snapshot.geradoEm).getTime();
    expect(Number.isNaN(quando)).toBe(false);
    expect(quando).toBeLessThanOrEqual(Date.now() + 60_000);
  });

  it('links de compra, quando existem, são do domínio esperado (nenhum link inventado na cópia)', () => {
    for (const q of citacoes as { affiliateUrl: string | null }[]) {
      if (q.affiliateUrl) expect(q.affiliateUrl).toMatch(/^https:\/\/www\.amazon\.com\.br\//);
    }
  });

  it('a reserva lida pelo armazém tem o mesmo tamanho da cópia (nada é descartado na leitura)', () => {
    expect(reservaEmbutida()).toHaveLength(citacoes.length);
  });

  it('a citação fabricada removida do acervo em 26/09/2026 NÃO está na cópia', () => {
    const textos = (citacoes as { text: string }[]).map((q) => q.text).join('\n');
    expect(textos).not.toContain('milésimo das coisas que estão dentro de mim');
  });
});
