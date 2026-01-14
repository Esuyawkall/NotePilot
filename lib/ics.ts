export function generateICS({
    title,
    description,
    startDate,
    durationMinutes = 60,
  }: {
    title: string;
    description: string;
    startDate: Date;
    durationMinutes?: number;
  }) {
    const formatDate = (date: Date) =>
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
  
    const start = formatDate(startDate);
    const end = formatDate(
      new Date(startDate.getTime() + durationMinutes * 60000)
    );
  
    return `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//AI Meeting Summarizer//EN
  BEGIN:VEVENT
  UID:${crypto.randomUUID()}
  DTSTAMP:${formatDate(new Date())}
  DTSTART:${start}
  DTEND:${end}
  SUMMARY:${title}
  DESCRIPTION:${description}
  END:VEVENT
  END:VCALENDAR`;
  }
  