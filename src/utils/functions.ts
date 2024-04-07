export function until(predicate: any) {
  const poll = (resolve: any) => {
    if (predicate()) resolve();
    else setTimeout((_: any) => poll(resolve), 10);
  }
  return new Promise(poll);
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function rgba2hex(rgba: {r: number, g: number, b: number, a: number}): string {
  const rHex = Math.round(rgba.r * 255).toString(16).padStart(2, '0');
  const gHex = Math.round(rgba.g * 255).toString(16).padStart(2, '0');
  const bHex = Math.round(rgba.b * 255).toString(16).padStart(2, '0');
  const aHex = Math.round(rgba.a * 255).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}${aHex}`;
}
