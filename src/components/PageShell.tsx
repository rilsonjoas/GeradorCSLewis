import { ModeToggle } from "@/components/ModeToggle";
import { ClusterFooter } from "@/components/ClusterFooter";
import { AdUnit } from "@/components/AdUnit";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    /* CORREÇÃO 2026-10-16 (layout, medido): o rodapé "Conheça também" só
       aparecia com rolagem no desktop. A página pedia 864px de altura —
       609 do card, 80 de `pt-20`, 48 de margem morta do AdUnit, 36 do
       `mt-9` do rodapé, 67 do rodapé e 24 de `pb-6`. Só monitor 1080p
       com browser magro tem 864px de viewport: em notebook 1366×768
       (~590px úteis) o rodapé ficava 274px abaixo da dobra.

       A página agora é uma coluna de três faixas: o miolo ocupa o que
       sobra (`flex-1`) e o ClusterFooter encosta no fim. Duas decisões
       que não são óbvias:

       1. `min-h-screen`, nunca `h-screen`/`overflow-hidden`. Com altura
          travada, A+ (`md:text-4xl`), 200% de zoom de texto ou celular
          deitado (640×360) cortariam o conteúdo em vez de reflugar —
          é o SC 1.4.10 (Reflow) da auditoria de 2026-09-25 voltando.

       2. O miolo centraliza por `my-auto` no filho, não por
          `justify-center` no pai. `justify-content: center` num flex que
          não cabe empurra o estouro pros DOIS lados e o topo do card
          fica impossível de alcançar com a rolagem. Margem automática
          resolve em zero quando não há espaço sobrando, que é
          exatamente a degradação que queremos. */
    <main className="bg-narniano relative flex min-h-screen flex-col items-center p-4 pt-16 sm:p-6 sm:pt-20 lg:pt-12">
      <header className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ModeToggle />
      </header>
      <div className="flex w-full flex-1 flex-col items-center">
        {/* `flex justify-center` e não só um div block: o Card é um
            block com w-full max-w-2xl, e dentro de um div block ele
            encosta na esquerda. O centro horizontal é do wrapper. */}
        <div className="my-auto flex w-full justify-center">{children}</div>
      </div>
      <AdUnit className="w-full max-w-[650px] my-6 flex justify-center overflow-hidden" />
      <ClusterFooter />
    </main>
  );
}