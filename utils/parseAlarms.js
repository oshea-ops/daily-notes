import * as chrono from 'chrono-node';

export function parseAlarmFromText(text) {
  if (!text) return null;

  // Truncate text to max 500 characters to prevent chrono-node from freezing 
  // the main thread on massive copy-pastes or Zalgo text.
  const textToParse = text.length > 500 ? text.substring(0, 500) : text;

  // Attempt to parse a date from the text
  const parsedResults = chrono.parse(textToParse);
  
  if (parsedResults.length > 0) {
    // Return the first found date
    const date = parsedResults[0].start.date();
    
    // Only return if the date is in the future
    if (date > new Date()) {
      return date;
    }
  }
  
  return null;
}
