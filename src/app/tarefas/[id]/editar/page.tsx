import { notFound } from "next/navigation";
import { FormTarefa } from "@/components/FormTarefa";
import { createCaller } from "@/server/router";

type Props = { params: Promise<{ id: string }> };

export default async function EditarTarefa({ params }: Props) {
  const { id } = await params;

  // Id inválido (não numérico) ou inexistente: o caller lança erro e a página vira 404.
  const tarefa = await createCaller({})
    .tarefa.buscar({ id: Number(id) })
    .catch(() => null);
  if (!tarefa) notFound();

  return (
    <>
      <h1>Editar tarefa</h1>
      <FormTarefa tarefa={tarefa} />
    </>
  );
}
