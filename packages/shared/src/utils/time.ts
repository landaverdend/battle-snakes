export function getCurrentTimeISOString() {
  const now = new Date();

  // Get UTC components
  const hours = now.getUTCHours().toString().padStart(2, '0');
  const minutes = now.getUTCMinutes().toString().padStart(2, '0');
  const seconds = now.getUTCSeconds().toString().padStart(2, '0');

  const day = now.getUTCDate().toString().padStart(2, '0');
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
  const year = now.getUTCFullYear().toString().slice(-2); // Last 2 digits of the year

  return `${hours}:${minutes}:${seconds} ${month}-${day}-${year}`;
}
