export function getCurrentTimeISOString() {

  return new Date(Date.now()).toUTCString();
}
