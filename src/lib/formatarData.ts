// Fuso fixo para que servidor e navegador gerem o mesmo texto; com o fuso de
// cada ambiente o HTML do SSR poderia divergir do render no cliente.
const formato = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatarData(timestamp: number) {
  return formato.format(timestamp);
}
