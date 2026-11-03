export type Tarefa = {
  id: number;
  titulo: string;
  descricao?: string;
  dataCriacao: number;
};

type DadosTarefa = Pick<Tarefa, "titulo" | "descricao">;

type Store = {
  tarefas: Map<number, Tarefa>;
  proximoId: number;
};

function criarStore(): Store {
  const store: Store = { tarefas: new Map(), proximoId: 1 };

  // Tarefas de exemplo para a listagem (e o infinite scroll) já terem conteúdo.
  const agora = Date.now();
  for (let i = 1; i <= 25; i++) {
    const id = store.proximoId++;
    store.tarefas.set(id, {
      id,
      titulo: `Tarefa de exemplo ${i}`,
      descricao: i % 3 === 0 ? undefined : `Descrição da tarefa ${i}`,
      dataCriacao: agora - (25 - i) * 60_000,
    });
  }

  return store;
}

// O Next pode avaliar este módulo mais de uma vez (HMR em dev e bundles
// separados para route handlers e server components). Guardando a store no
// globalThis, todos enxergam a mesma lista enquanto o processo estiver de pé.
const globalComStore = globalThis as typeof globalThis & { __tarefas?: Store };
const store = (globalComStore.__tarefas ??= criarStore());

// Como os ids são incrementais e o Map mantém a ordem de inserção, basta
// inverter a lista para ter as mais recentes primeiro. O cursor é o id da
// última tarefa já entregue, o que continua válido mesmo após exclusões.
export function listar(limite: number, cursor?: number | null) {
  const ordenadas = [...store.tarefas.values()].reverse();
  const restantes = cursor ? ordenadas.filter((t) => t.id < cursor) : ordenadas;
  const itens = restantes.slice(0, limite);
  const proximoCursor = restantes.length > limite ? itens[itens.length - 1].id : null;

  return { itens, proximoCursor };
}

export function buscar(id: number) {
  return store.tarefas.get(id);
}

export function criar(dados: DadosTarefa) {
  const tarefa: Tarefa = {
    id: store.proximoId++,
    titulo: dados.titulo,
    descricao: dados.descricao || undefined,
    dataCriacao: Date.now(),
  };
  store.tarefas.set(tarefa.id, tarefa);
  return tarefa;
}

export function atualizar(id: number, dados: DadosTarefa) {
  const atual = store.tarefas.get(id);
  if (!atual) return undefined;

  const tarefa: Tarefa = { ...atual, titulo: dados.titulo, descricao: dados.descricao || undefined };
  store.tarefas.set(id, tarefa);
  return tarefa;
}

export function remover(id: number) {
  return store.tarefas.delete(id);
}
