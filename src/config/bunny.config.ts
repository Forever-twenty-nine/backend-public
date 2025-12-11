/**
 * Configuración de Bunny.net CDN para backend-public
 * Solo lectura - sirve archivos desde CDN de Bunny
 */

export interface BunnyPublicConfig {
  storage: {
    cdnHostname: string; // e.g., 'https://your-storage-zone.b-cdn.net'
    enabled: boolean;
  };
  stream: {
    cdnHostname: string; // e.g., 'https://vz-xxxxx-xxx.b-cdn.net'
    enabled: boolean;
  };
}

const bunnyConfig: BunnyPublicConfig = {
  storage: {
    cdnHostname: process.env.BUNNY_STORAGE_CDN_HOSTNAME || '',
    enabled: !!process.env.BUNNY_STORAGE_CDN_HOSTNAME,
  },
  stream: {
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME || '',
    enabled: !!process.env.BUNNY_STREAM_CDN_HOSTNAME,
  },
};

// Validar configuración
export const validateBunnyConfig = (): boolean => {
  if (!bunnyConfig.storage.cdnHostname) {
    console.warn('⚠️  Missing BUNNY_STORAGE_CDN_HOSTNAME. Bunny CDN features will be disabled.');
    return false;
  }

  if (!bunnyConfig.stream.cdnHostname) {
    console.warn('⚠️  Missing BUNNY_STREAM_CDN_HOSTNAME. Bunny Stream features will be disabled.');
    return false;
  }

  return true;
};

export const isBunnyEnabled = validateBunnyConfig();

export default bunnyConfig;
