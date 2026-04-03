/**
 * Generate an ICS calendar event string.
 * When attached to an email, the recipient can add it to Google Calendar, Outlook, Apple Calendar, etc.
 */
export function generateICS({
  title,
  description,
  startDate,
  startTime,
  durationMinutes,
  location,
  organizerEmail,
  organizerName,
  attendeeEmail,
  attendeeName,
}: {
  title: string
  description: string
  startDate: string      // YYYY-MM-DD
  startTime: string      // HH:MM (24h)
  durationMinutes: number
  location?: string
  organizerEmail: string
  organizerName: string
  attendeeEmail: string
  attendeeName: string
}): string {
  // Parse date and time
  const [year, month, day] = startDate.split('-').map(Number)
  const [hour, minute] = startTime.split(':').map(Number)

  // Create start/end in UTC format (YYYYMMDDTHHMMSSZ)
  // Assuming times are in Asia/Dhaka (UTC+6)
  const startUTC = new Date(Date.UTC(year, month - 1, day, hour - 6, minute))
  const endUTC = new Date(startUTC.getTime() + durationMinutes * 60 * 1000)

  const formatDT = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const uid = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}@digititanai.com`
  const now = formatDT(new Date())

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DigiTitanAI//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDT(startUTC)}`,
    `DTEND:${formatDT(endUTC)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    location ? `LOCATION:${escapeICS(location)}` : '',
    `ORGANIZER;CN=${escapeICS(organizerName)}:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escapeICS(attendeeName)};RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:${attendeeEmail}`,
    `ATTENDEE;CN=${escapeICS(organizerName)};RSVP=FALSE;PARTSTAT=ACCEPTED:mailto:${organizerEmail}`,
    'STATUS:CONFIRMED',
    `SEQUENCE:0`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  return ics
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
