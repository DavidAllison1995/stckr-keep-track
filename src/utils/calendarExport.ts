
export const generateICSFile = (task: any, itemName?: string) => {
  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(task.date);
  const endDate = formatDate(new Date(new Date(task.date).getTime() + 60 * 60 * 1000).toISOString()); // 1 hour duration

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your App//Maintenance Tasks//EN',
    'BEGIN:VEVENT',
    `UID:${task.id}@yourapp.com`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${task.title}`,
    `DESCRIPTION:Maintenance for ${itemName || 'item'}${task.notes ? ` - ${task.notes}` : ''}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Maintenance task reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
