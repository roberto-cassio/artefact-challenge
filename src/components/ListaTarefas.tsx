"use client";

import Link from "next/link";
import { useState } from "react";
import { formatarData } from "@/lib/formatarData";
import { trpc, type RouterOutputs } from "@/lib/trpc";

type Pagina = RouterOutputs["tarefa"]["listar"];
type Tarefa = Pagina["itens"][number];
type Aviso = { tipo: "sucesso" | "erro"; texto: string };

type Props = {
  primeiraPagina: Pagina;
  limit: number;
};

export function ListaTarefas({ primeiraPagina, limit }: Props) {
  const utils = trpc.useUtils();
  const [aviso, setAviso] = useState<Aviso | null>(null);

  // A primeira página chega pronta do servidor e vira o estado inicial da
  // query; as seguintes são buscadas pelo cliente usando o cursor.
  const { data } = trpc.tarefa.listar.useInfiniteQuery(
    { limit },
    {
      initialData: { pages: [primeiraPagina], pageParams: [null] },
      getNextPageParam: (pagina) => pagina.proximoCursor,
    },
  );

  const excluir = trpc.tarefa.excluir.useMutation({
    onSuccess: ({ id }) => {
      // Tira a tarefa do cache em vez de recarregar todas as páginas.
      utils.tarefa.listar.setInfiniteData({ limit }, (dados) =>
        dados && {
          ...dados,
          pages: dados.pages.map((p) => ({ ...p, itens: p.itens.filter((t) => t.id !== id) })),
        },
      );
      setAviso({ tipo: "sucesso", texto: "Tarefa excluída com sucesso." });
    },
    onError: (erro) => setAviso({ tipo: "erro", texto: erro.message }),
  });

  function handleExcluir(tarefa: Tarefa) {
    if (!confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;
    setAviso(null);
    excluir.mutate({ id: tarefa.id });
  }

  const tarefas = data?.pages.flatMap((p) => p.itens) ?? [];

  return (
    <>
      {aviso && (
        <p className={`aviso ${aviso.tipo}`} role="status">
          {aviso.texto}
        </p>
      )}

      {tarefas.length === 0 ? (
        <p className="vazio">Nenhuma tarefa cadastrada.</p>
      ) : (
        <ul className="lista">
          {tarefas.map((tarefa) => (
            <li key={tarefa.id} className="tarefa">
              <div>
                <strong>{tarefa.titulo}</strong>
                {tarefa.descricao && <p>{tarefa.descricao}</p>}
                <time dateTime={new Date(tarefa.dataCriacao).toISOString()}>
                  {formatarData(tarefa.dataCriacao)}
                </time>
              </div>
              <div className="acoes">
                <Link href={`/tarefas/${tarefa.id}/editar`}>Editar</Link>
                <button
                  className="perigo"
                  onClick={() => handleExcluir(tarefa)}
                  disabled={excluir.isPending}
                >
                  {excluir.isPending && excluir.variables?.id === tarefa.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
