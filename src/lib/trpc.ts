import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/router";

// Só o tipo do router vem do servidor: os hooks ficam tipados de ponta a ponta
// sem levar código do backend para o bundle do cliente.
export const trpc = createTRPCReact<AppRouter>();

export type RouterOutputs = inferRouterOutputs<AppRouter>;
