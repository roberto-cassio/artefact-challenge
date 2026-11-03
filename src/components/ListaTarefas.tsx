"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    trpc.tarefa.listar.useInfiniteQuery(
      { limit },
      {
        initialData: { pages: [primeiraPagina], pageParams: [null] },
        getNextPageParam: (pagina) => pagina.proximoCursor,
      },
    );

  // Infinite scroll: quando a sentinela no fim da lista aparece, busca a
  // próxima página. O observer é recriado a cada carregamento para que, se a
  // sentinela continuar visível (tela alta), a busca seguinte já dispare.
  // Depois de um erro ele para, e o usuário tenta de novo pelo botão.
  const sentinela = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const alvo = sentinela.current;
    if (!alvo || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(alvo);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

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

      <div ref={sentinela} className="rodape-lista">
        {isFetchingNextPage
          ? "Carregando mais tarefas..."
          : isFetchNextPageError && (
              <>
                Não foi possível carregar mais tarefas.{" "}
                <button onClick={() => fetchNextPage()}>Tentar novamente</button>
              </>
            )}
      </div>
    </>
  );
}
