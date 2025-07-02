// Utilitários para formatação de data e hora

/**
 * Converte data para formato ISO com timezone brasileiro (-03:00)
 */
export function formatDateTimeWithBrazilTimezone(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const offset = -3; // GMT-3 para Brasil
  
  // Se a data já tem timezone, preserve a parte da data mas ajuste o timezone
  if (typeof date === 'string' && (date.includes('+') || date.includes('-') || date.endsWith('Z'))) {
    const baseDateStr = date.includes('T') ? date.split('T')[0] : date.substring(0, 10);
    const timeStr = date.includes('T') && !date.endsWith('Z') 
      ? date.split('T')[1].split(/[+-]/)[0] 
      : '00:00:00';
    
    return `${baseDateStr}T${timeStr}${offset >= 0 ? '+' : ''}${String(Math.abs(offset)).padStart(2, '0')}:00`;
  }
  
  // Para datetime-local input, não ajustar o tempo, apenas adicionar timezone
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  const offsetSign = offset >= 0 ? '+' : '-';
  const offsetHours = String(Math.abs(offset)).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:00`;
}

/**
 * Converte datetime-local input para formato ISO com timezone
 */
export function convertDateTimeLocalToBrazilTimezone(datetimeLocal: string): string {
  if (!datetimeLocal) return '';
  
  // datetime-local format: 2025-07-01T14:27
  const offset = -3; // GMT-3 para Brasil
  const offsetSign = offset >= 0 ? '+' : '-';
  const offsetHours = String(Math.abs(offset)).padStart(2, '0');
  
  return `${datetimeLocal}:00${offsetSign}${offsetHours}:00`;
}

/**
 * Converte formato ISO com timezone para datetime-local input
 */
export function convertBrazilTimezoneToDateTimeLocal(isoString: string): string {
  if (!isoString) return '';
  
  // Remove timezone info para datetime-local input
  return isoString.substring(0, 16);
}

/**
 * Obtém data/hora atual no formato brasileiro
 */
export function getCurrentBrazilDateTime(): string {
  return formatDateTimeWithBrazilTimezone(new Date());
}