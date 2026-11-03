# Gerenciador de tarefas

Aplicação simples de tarefas com Next.js 15 e tRPC. O backend mantém as tarefas em memória e expõe o CRUD via tRPC. O frontend consome esses endpoints com React Query.

## Como rodar

Requer Node 18.18 ou superior (testado com Node 22).

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Para rodar a versão de produção:

```bash
npm run build
npm start
```

O servidor já sobe com 25 tarefas de exemplo, para a paginação aparecer sem precisar cadastrar nada. Como os dados ficam em memória, a lista volta ao estado inicial sempre que o servidor reinicia.

## Funcionalidades

- Listagem com SSR e infinite scroll (10 tarefas por página)
- Exclusão direto na listagem, com confirmação e mensagem de sucesso ou erro
- Criação e edição no mesmo formulário, com validação no front e no back
- Estados de carregamento nos botões e na paginação, e 404 para tarefa inexistente

## Estrutura

```
src/
  server/
    store.ts                  lista em memória e suas operações
    trpc.ts                   inicialização do tRPC e formatação de erros
    router.ts                 procedures de tarefa, com validação via zod
  app/
    api/trpc/[trpc]/route.ts  handler HTTP do tRPC
    providers.tsx             React Query + cliente tRPC
    page.tsx                  listagem (SSR)
    tarefas/nova/             criação
    tarefas/[id]/editar/      edição
  components/
    ListaTarefas.tsx          listagem, exclusão e infinite scroll
    FormTarefa.tsx            formulário de criação/edição
  lib/
    trpc.ts                   hooks tipados do tRPC
    formatarData.ts
```

## API

Tarefa: `{ id: number, titulo: string, descricao?: string, dataCriacao: number }`. `dataCriacao` é um timestamp em ms.

| Procedure          | Tipo     | Entrada                      | Retorno                    |
| ------------------ | -------- | ---------------------------- | -------------------------- |
| `tarefa.listar`    | query    | `{ limit?, cursor? }`        | `{ itens, proximoCursor }` |
| `tarefa.buscar`    | query    | `{ id }`                     | tarefa                     |
| `tarefa.criar`     | mutation | `{ titulo, descricao? }`     | tarefa criada              |
| `tarefa.atualizar` | mutation | `{ id, titulo, descricao? }` | tarefa atualizada          |
| `tarefa.excluir`   | mutation | `{ id }`                     | `{ id }`                   |

Erros principais:

- título vazio: `BAD_REQUEST` com "O título é obrigatório"
- id inexistente em buscar, atualizar ou excluir: `NOT_FOUND` com "Tarefa não encontrada"

## Decisões

- **Store no `globalThis`.** Em dev o Next recarrega módulos (HMR) e pode avaliar o mesmo arquivo em bundles diferentes. Com a lista no `globalThis`, existe uma única instância por processo.
- **SSR sem passar por HTTP.** A página de listagem chama o router direto com `createCaller` e entrega a primeira página como `initialData` do `useInfiniteQuery`. A página é `force-dynamic`, senão o build a geraria como estática.
- **Paginação por cursor.** O cursor é o id da última tarefa recebida. Como os ids são incrementais, a próxima página é "ids menores que o cursor". Assim nada é pulado nem repetido quando alguma tarefa é excluída no meio do caminho.
- **Validação nas duas pontas.** O formulário bloqueia título vazio antes de enviar. O zod no backend garante a mesma regra para quem chama a API direto. O `errorFormatter` transforma o erro do zod em uma mensagem legível, que o front exibe sem tratamento extra.
- **Cache.** Ao excluir, a tarefa sai do cache local sem recarregar a lista. Ao criar ou editar, a listagem é invalidada e busca os dados de novo quando é aberta.
- **Datas.** Como `dataCriacao` é numérico, não é preciso um transformer (superjson). A formatação usa um fuso fixo para o HTML do servidor bater com o render do cliente.
