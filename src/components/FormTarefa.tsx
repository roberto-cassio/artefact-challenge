"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc, type RouterOutputs } from "@/lib/trpc";

type Tarefa = RouterOutputs["tarefa"]["buscar"];
type Aviso = { tipo: "sucesso" | "erro"; texto: string };

// O mesmo formulário serve para criar e editar: com `tarefa`, entra em modo edição.
export function FormTarefa({ tarefa }: { tarefa?: Tarefa }) {
  const utils = trpc.useUtils();
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const mostrarErro = (erro: { message: string }) => setAviso({ tipo: "erro", texto: erro.message });

  const criar = trpc.tarefa.criar.useMutation({
    onSuccess: () => {
      setTitulo("");
      setDescricao("");
      setAviso({ tipo: "sucesso", texto: "Tarefa criada com sucesso." });
      // Marca a listagem como desatualizada para ela buscar de novo ao ser aberta.
      utils.tarefa.listar.invalidate();
    },
    onError: mostrarErro,
  });

  const atualizar = trpc.tarefa.atualizar.useMutation({
    onSuccess: () => {
      setAviso({ tipo: "sucesso", texto: "Tarefa atualizada com sucesso." });
      utils.tarefa.listar.invalidate();
    },
    onError: mostrarErro,
  });

  const salvando = criar.isPending || atualizar.isPending;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Mesma regra do backend, checada aqui para dar o retorno sem ir ao servidor.
    if (!titulo.trim()) {
      setAviso({ tipo: "erro", texto: "O título é obrigatório" });
      return;
    }

    setAviso(null);
    const dados = { titulo, descricao };
    if (tarefa) atualizar.mutate({ id: tarefa.id, ...dados });
    else criar.mutate(dados);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {aviso && (
        <p className={`aviso ${aviso.tipo}`} role="status">
          {aviso.texto}
        </p>
      )}

      <label>
        Título
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={120}
          aria-invalid={aviso?.tipo === "erro" && !titulo.trim()}
          autoFocus
        />
      </label>

      <label>
        Descrição <span>(opcional)</span>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={500} rows={4} />
      </label>

      <div className="acoes">
        <button type="submit" className="primario" disabled={salvando}>
          {salvando ? "Salvando..." : tarefa ? "Salvar alterações" : "Criar tarefa"}
        </button>
        <Link href="/">Voltar para a lista</Link>
      </div>
    </form>
  );
}
