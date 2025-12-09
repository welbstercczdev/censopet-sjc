// --- START OF FILE services/uuidService.ts ---

/**
 * Implementação de UUIDv7 adaptada para TypeScript.
 * Baseada na referência fornecida.
 */

// Estado interno para garantir a monotonicidade (ordem) mesmo em gerações rápidas
let lastTimestamp = 0;
let counter = 0;
// Buffer para aleatoriedade
const randomBuffer = new Uint8Array(10); 

const getRandomBytes = (size: number): Uint8Array => {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(size));
  } else {
    // Fallback para ambientes sem crypto.getRandomValues (menos seguro, mas funcional)
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      buffer[i] = Math.trunc(Math.random() * 256);
    }
    return buffer;
  }
};

/**
 * Gera uma string UUIDv7.
 */
export function uuidv7(): string {
  const now = Date.now();

  // Lógica para lidar com geração no mesmo milissegundo (incrementar contador)
  if (now > lastTimestamp) {
    lastTimestamp = now;
    counter = 0;
    // Gera novos bytes aleatórios apenas quando muda o milissegundo
    const newRandom = getRandomBytes(10);
    for(let i=0; i<10; i++) randomBuffer[i] = newRandom[i];
  } else {
    counter++;
    if (counter > 4398046511103) { // Limite de segurança (2^42 - 1)
      counter = 0;
      lastTimestamp++;
    }
  }

  // Preparação dos dados
  const t = lastTimestamp;
  const n = counter;
  
  // Clone do buffer de aleatoriedade para não alterar o estado global diretamente na lógica de bits
  const r = new Uint8Array(randomBuffer);

  // Aplica Version 7 e Variant 1 nos bytes aleatórios
  r[0] = (r[0] & 0x0F) | 0x70; // version 7 (0111)
  r[2] = (r[2] & 0x3F) | 0x80; // variant 1 (10)

  const o = new Uint8Array(16);

  // 48 bits de Timestamp (Big Endian)
  o[0] = Math.trunc(t / (2 ** 40)) & 0xFF;
  o[1] = Math.trunc(t / (2 ** 32)) & 0xFF;
  o[2] = (t >> 24) & 0xFF;
  o[3] = (t >> 16) & 0xFF;
  o[4] = (t >> 8) & 0xFF;
  o[5] = t & 0xFF;

  // Preenche o restante com os bytes aleatórios preparados
  o.set(r, 6);

  // Mistura o contador nos bits apropriados (conforme a implementação de referência LiosK)
  // Nota: Essa lógica específica mistura o contador nos bytes de versão/variante para compactação
  o[6] = Math.trunc(n / (2 ** 36)) | (r[0] & 0xF0); // Mantém a versão 7 no nibble alto
  o[8] = Math.trunc(n / (2 ** 28)) | (r[2] & 0xC0); // Mantém a variante no topo

  // Converte para String Hexadecimal com hifens
  let str = "";
  for (let i = 0; i < o.length; i++) {
    const hex = o[i].toString(16).padStart(2, '0');
    str += hex;
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      str += "-";
    }
  }

  return str;
}

/**
 * Extrai a data de um UUIDv7.
 * Útil para saber quando o registro foi criado apenas pelo ID.
 */
export function getDateFromUuidv7(uuid: string): string | null {
  if (!uuid || typeof uuid !== 'string' || uuid.length < 36) {
    return null;
  }
  try {
    // Pega os primeiros 8 chars + os próximos 4 chars (remove o hífen) = 12 hex chars = 48 bits
    const hexTimestamp = uuid.substring(0, 8) + uuid.substring(9, 13);
    const timestampMillis = parseInt(hexTimestamp, 16);
    
    if (isNaN(timestampMillis)) {
      return null;
    }
    
    const date = new Date(timestampMillis);
    
    // Formata YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    return null;
  }
}