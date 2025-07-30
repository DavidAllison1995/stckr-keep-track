
import { Capacitor } from '@capacitor/core';

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

  // Check if we're on a mobile platform
  if (Capacitor.isNativePlatform()) {
    // For mobile: Use data URL with calendar intent
    const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    window.open(dataUrl, '_system');
  } else {
    // For web: Use blob download (original method)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
};

// Mobile-specific calendar integration using native URLs
export const addToNativeCalendar = (task: any, itemName?: string) => {
  const taskDate = new Date(task.date);
  const endDate = new Date(taskDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const title = encodeURIComponent(task.title);
  const details = encodeURIComponent(`Maintenance for ${itemName || 'item'}${task.notes ? ` - ${task.notes}` : ''}`);
  const startISO = taskDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endISO = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Try multiple approaches for better mobile compatibility
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isIOS) {
    // iOS Calendar URL scheme
    const iosUrl = `calshow:${taskDate.getTime() / 1000}`;
    window.open(iosUrl, '_system');
    
    // Fallback to data URL if calendar app doesn't open
    setTimeout(() => {
      generateICSFile(task, itemName);
    }, 1000);
  } else if (isAndroid) {
    // Android Calendar intent
    const androidUrl = `content://com.android.calendar/time/${taskDate.getTime()}`;
    window.open(androidUrl, '_system');
    
    // Fallback to Google Calendar web URL
    setTimeout(() => {
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}`;
      window.open(googleCalUrl, '_blank');
    }, 1000);
  } else {
    // Fallback to standard ICS download
    generateICSFile(task, itemName);
  }
};
