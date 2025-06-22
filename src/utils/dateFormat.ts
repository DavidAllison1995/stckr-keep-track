
import { format } from 'date-fns';

export const formatDateWithUserPreference = (
  date: Date | string,
  userDateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' = 'MM/dd/yyyy'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formatString = userDateFormat === 'MM/dd/yyyy' ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
  return format(dateObj, formatString);
};

export const formatDateTimeWithUserPreference = (
  date: Date | string,
  userDateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' = 'MM/dd/yyyy'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formatString = userDateFormat === 'MM/dd/yyyy' ? 'MM/dd/yyyy h:mm a' : 'dd/MM/yyyy HH:mm';
  return format(dateObj, formatString);
};
