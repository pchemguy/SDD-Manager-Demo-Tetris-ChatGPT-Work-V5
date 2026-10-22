/** Canonical settings and independent persistence through a narrow browser port. */
export const CHOICES={ghost:['hide','dynamic','show'],hardDrop:['on','off'],next:['on','off'],dropLock:['follow','instant'],lock:['interval','failed'],hold:['on','off']} as const;
export type SettingKey=keyof typeof CHOICES;
export type Settings={ [K in SettingKey]:typeof CHOICES[K][number] };
export const KEYS=Object.keys(CHOICES) as SettingKey[];
export const DEFAULTS:Readonly<Settings>=Object.freeze({ghost:'show',hardDrop:'on',next:'on',dropLock:'follow',lock:'interval',hold:'on'});
export function decodeSetting<K extends SettingKey>(key:K,value:unknown):Settings[K]|undefined {
  return typeof value==='string'&&(CHOICES[key] as readonly string[]).includes(value)?value as Settings[K]:undefined;
}

/** Browser effects supplied by composition; the store catches each unavailable effect. */
export interface SettingsPort {
  readUrl():string;
  readCookies():string;
  writeCookie(cookie:string):void;
  replaceUrl(url:string):void;
}

function savedValue<K extends SettingKey>(cookies:string,key:K):Settings[K]|undefined {
  const values=cookies.split(';').map(part=>part.trimStart())
    .filter(part=>part.startsWith(`tetris_${key}=`)).map(part=>part.slice(`tetris_${key}=`.length));
  if(values.length!==1)return undefined;
  try{return decodeSetting(key,decodeURIComponent(values[0]));}catch{return undefined;}
}

/** Restore once without rewriting the URL; persist only explicit overrides and valid changes. */
export class SettingsStore {
  private values:Settings={...DEFAULTS};
  private port:SettingsPort;
  private secure=false;
  /** A snapshot prevents consumers from bypassing validation through mutation. */
  get current():Settings{return {...this.values};}
  constructor(port:SettingsPort){
    this.port=port;
    const url=this.readUrl();let cookies='';
    try{cookies=port.readCookies();}catch{/* Blocked storage leaves URL/default settings usable. */}
    for(const key of KEYS)this.restore(key,url?.searchParams,cookies);
  }
  /** Select in memory first, then independently attempt cookie and history replacement. */
  select<K extends SettingKey>(key:K,raw:unknown):boolean {
    const value=decodeSetting(key,raw);if(value===undefined)return false;
    this.values[key]=value;
    const url=this.readUrl();this.writeCookie(key,value);
    if(url){
      url.searchParams.set(key,value);
      try{this.port.replaceUrl(url.href);}catch{/* Memory and any successful cookie write remain selected. */}
    }
    return true;
  }
  private restore<K extends SettingKey>(key:K,params:URLSearchParams|undefined,cookies:string):void {
    const values=params?.getAll(key)??[];
    const explicit=values.length===1?decodeSetting(key,values[0]):undefined;
    this.values[key]=explicit??savedValue(cookies,key)??DEFAULTS[key];
    if(explicit!==undefined)this.writeCookie(key,explicit);
  }
  private readUrl():URL|undefined {
    try{const url=new URL(this.port.readUrl());this.secure=url.protocol==='https:';return url;}catch{return undefined;}
  }
  private writeCookie<K extends SettingKey>(key:K,value:Settings[K]):void {
    const attributes=`; Path=/; Max-Age=31536000; SameSite=Lax${this.secure?'; Secure':''}`;
    try{this.port.writeCookie(`tetris_${key}=${encodeURIComponent(value)}${attributes}`);}catch{/* URL sharing and memory remain usable. */}
  }
}
