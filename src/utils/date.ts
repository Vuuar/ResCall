import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string, formatString: string = 'PPP'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatString, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

export const formatDateRange = (startDateString: string, endDateString: string): string => {
  try {
    const startDate = parseISO(startDateString);
    const endDate = parseISO(endDateString);
    
    const startDay = format(startDate, 'PPP', { locale: fr });
    const startTime = format(startDate, 'HH:mm', { locale: fr });
    const endTime = format(endDate, 'HH:mm', { locale: fr });
    
    return `${startDay} de ${startTime} à ${endTime}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '';
  }
};
