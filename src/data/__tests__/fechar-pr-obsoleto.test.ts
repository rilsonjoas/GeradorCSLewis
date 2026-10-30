import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * `scripts/fechar-pr-obsoleto.sh`: quando a cópia embutida já está em dia com a API (por exemplo, a citação que
 * motivou o PR foi reativada antes do merge), o PR aberto pelo fluxo `sync-quotes.yml` ficou obsoleto e é fechado.
 * O `gh` é substituído por um falso que registra as chamadas; o script real roda de verdade.
 */
const SCRIPT = path.join(import.meta.dirname, '../../../scripts/fechar-pr-obsoleto.sh');

describe('fechar-pr-obsoleto.sh', () => {
  let dir: string;
  let log: string;

  const rodar = (prAberto: string, extra: Record<string, string> = {}) => {
    // `gh pr list` devolve o número do PR aberto (ou nada); `gh pr close` só registra.
    writeFileSync(
      path.join(dir, 'gh'),
      `#!/usr/bin/env bash\necho "$@" >> "${log}"\nif [ "$1 $2" = "pr list" ]; then echo "${prAberto}"; fi\n`,
    );
    chmodSync(path.join(dir, 'gh'), 0o755);
    return execFileSync('bash', [SCRIPT], {
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, BASE: 'main', ...extra },
      encoding: 'utf8',
    });
  };
  const chamadas = () => (existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : []);

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'fechar-pr-'));
    log = path.join(dir, 'chamadas.log');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('fecha o PR aberto da cópia, apaga a branch e explica no comentário', () => {
    const saida = rodar('7');
    const fechar = chamadas().find((c) => c.startsWith('pr close'))!;
    expect(fechar).toContain('pr close 7');
    expect(fechar).toContain('--delete-branch');
    expect(fechar).toMatch(/--comment .*em dia/);
    expect(saida).toContain('#7');
  });

  it('procura só o PR da branch do fluxo, contra a base certa e aberto', () => {
    rodar('7', { BASE: 'main' });
    const listar = chamadas().find((c) => c.startsWith('pr list'))!;
    expect(listar).toContain('--head chore/sync-quotes-snapshot');
    expect(listar).toContain('--base main');
    expect(listar).toContain('--state open');
  });

  it('sem PR aberto, não fecha nada', () => {
    const saida = rodar('');
    expect(chamadas().some((c) => c.startsWith('pr close'))).toBe(false);
    expect(saida).toMatch(/nada a fechar/i);
  });

  it('exige BASE (sem ela poderia fechar o PR de outra base)', () => {
    expect(() => rodar('7', { BASE: '' })).toThrow();
    expect(chamadas().some((c) => c.startsWith('pr close'))).toBe(false);
  });
});
