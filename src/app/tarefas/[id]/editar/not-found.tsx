import Link from "next/link";

export default function TarefaNaoEncontrada() {
  return (
    <div className="vazio">
      <p>Tarefa não encontrada.</p>
      <Link href="/">Voltar para a lista</Link>
    </div>
  );
}
