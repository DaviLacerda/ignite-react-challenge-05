import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(dateToFormat) {
  return format(new Date(dateToFormat), 'd LLL y', {
    locale: ptBR,
  });
}
