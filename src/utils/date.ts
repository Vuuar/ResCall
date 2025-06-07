import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(dateString: string, formatString: string = 'PPP'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatString, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
