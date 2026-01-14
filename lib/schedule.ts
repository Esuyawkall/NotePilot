export function parseScheduleText(text: string): Date {
    const now = new Date();
    const date = new Date(now);
  
    if (/tomorrow/i.test(text)) {
      date.setDate(now.getDate() + 1);
    }
  
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
  
    for (const day in dayMap) {
      if (new RegExp(day, "i").test(text)) {
        const target = dayMap[day];
        const diff = (target + 7 - now.getDay()) % 7 || 7;
        date.setDate(now.getDate() + diff);
        break;
      }
    }
  
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || "0");
      const period = timeMatch[3].toLowerCase();
  
      if (period === "pm" && hour !== 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
  
      date.setHours(hour, minutes, 0, 0);
    } else {
      date.setHours(10, 0, 0, 0); // default time
    }
  
    return date;
  }
  