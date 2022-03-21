import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateWithHour(dateToFormat: string | null) {
  if(dateToFormat !== null){
    let formattedDate = format(new Date(dateToFormat), 'd LLL y', {
      locale: ptBR,
    });
  
    let formattedHour = format(new Date(dateToFormat), 'H:mm', {
      locale: ptBR,
    });
  
    return {
      date: formattedDate,
      hour: formattedHour,
    };
  } else {
    return null
  }
}
