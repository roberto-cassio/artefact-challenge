import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as store from "./store";
import { createCallerFactory, publicProcedure, router } from "./trpc";

const id = z.number().int().positive();

const dadosTarefa = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(120, "O título deve ter no máximo 120 caracteres"),
  descricao: z.string().trim().max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
});

function naoEncontrada(): never {
  throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
}

const tarefaRouter = router({
  // O nome "cursor" é o que o useInfiniteQuery do tRPC espera no input.
  listar: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.number().int().nullish(),
      }),
    )
    .query(({ input }) => store.listar(input.limit, input.cursor)),

  buscar: publicProcedure
    .input(z.object({ id }))
    .query(({ input }) => store.buscar(input.id) ?? naoEncontrada()),

  criar: publicProcedure.input(dadosTarefa).mutation(({ input }) => store.criar(input)),

  // Substitui título e descrição; omitir a descrição a remove.
  atualizar: publicProcedure.input(dadosTarefa.extend({ id })).mutation(({ input }) => {
    const { id, ...dados } = input;
    return store.atualizar(id, dados) ?? naoEncontrada();
  }),

  excluir: publicProcedure.input(z.object({ id })).mutation(({ input }) => {
    if (!store.remover(input.id)) naoEncontrada();
    return { id: input.id };
  }),
});

export const appRouter = router({ tarefa: tarefaRouter });
export type AppRouter = typeof appRouter;

// Permite chamar as procedures direto em server components, sem passar por HTTP.
export const createCaller = createCallerFactory(appRouter);
