import { Injectable } from '@nestjs/common';

@Injectable()
export class AttendanceDateTimeHelper {
  /**
   * 📅 NORMALIZAR FECHA Y HORA PARA ASISTENCIA
   */
  normalizeDateTime(date?: string, time?: string) {
    const currentDate = date || new Date().toISOString().split('T')[0];
    const currentTime = time || new Date().toTimeString().split(' ')[0];

    return {
      date: currentDate,
      time: currentTime,
    };
  }

  /**
   * 🕐 OBTENER FECHA ACTUAL EN FORMATO YYYY-MM-DD
   */

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 🕐 OBTENER HORA ACTUAL EN FORMATO HH:MM:SS
   */
  getCurrentTime(): string {
    return new Date().toTimeString().split(' ')[0];
  }

  /**
   * 📅 VALIDAR FORMATO DE FECHA
   */
  isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }

  /**
   * 🕐 VALIDAR FORMATO DE HORA
   */
  isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(time);
  }

  /**
   * 📊 PARSEAR TIEMPO PARA COMPARACIONES
   */
  parseTime(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  }

  /**
   * 🕐 FORMATEAR TIEMPO DESDE DATE OBJECT
   */
  formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  }

  /**
   * 📅 OBTENER TIMESTAMP ISO ACTUAL
   */
  getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * 🕐 FORMATEAR FECHA A HH:MM
   */

  formatTimeFromDate(date: Date): string {
    return date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  }

  /**
   * 📊 CALCULAR DIFERENCIA EN MINUTOS ENTRE DOS TIEMPOS
   */
  calculateTimeDifferenceInMinutes(startTime: string, endTime: string): number {
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }

  /**
   * 🕐 FORMATEAR MINUTOS A FORMATO LEGIBLE
   */
  formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * ⏳ RETRASAR EJECUCIÓN POR UN TIEMPO DADO
   */
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
