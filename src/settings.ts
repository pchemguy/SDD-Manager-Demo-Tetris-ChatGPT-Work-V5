/** Canonical session settings; persistence is added in its own increment. */
export const CHOICES={ghost:['hide','dynamic','show'],hardDrop:['on','off'],next:['on','off'],dropLock:['follow','instant'],lock:['interval','failed'],hold:['on','off']} as const;
export type SettingKey=keyof typeof CHOICES;
export type Settings={ [K in SettingKey]:typeof CHOICES[K][number] };
export const KEYS=Object.keys(CHOICES) as SettingKey[];
export const DEFAULTS:Readonly<Settings>=Object.freeze({ghost:'show',hardDrop:'on',next:'on',dropLock:'follow',lock:'interval',hold:'on'});
export function decodeSetting<K extends SettingKey>(key:K,value:unknown):Settings[K]|undefined {
  return typeof value==='string'&&(CHOICES[key] as readonly string[]).includes(value)?value as Settings[K]:undefined;
}
