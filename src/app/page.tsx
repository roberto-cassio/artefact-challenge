import { ListaTarefas } from "@/components/ListaTarefas";
import { createCaller } from "@/server/router";

// As tarefas vivem em memória e mudam a cada operação, então a página é
// renderizada a cada requisição (sem isso o build a geraria como estática).
export const dynamic = "force-dynamic";

const TAMANHO_PAGINA = 10;

export default async function Home() {
  // No servidor a procedure é chamada direto, sem o custo de uma requisição HTTP.
  const caller = createCaller({});
  const primeiraPagina = await caller.tarefa.listar({ limit: TAMANHO_PAGINA });

  return (
    <>
      <div className="cabecalho">
        <h1>Tarefas</h1>
      </div>
      <ListaTarefas primeiraPagina={primeiraPagina} limit={TAMANHO_PAGINA} />
    </>
  );
}
