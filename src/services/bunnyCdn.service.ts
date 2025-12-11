/**
 * BunnyCdnService
 * Servicio de solo lectura para obtener URLs de archivos desde Bunny.net CDN
 * 
 * Este servicio NO sube archivos, solo construye las URLs correctas
 * para servir contenido desde el CDN de Bunny.net
 */

import bunnyConfig, { isBunnyEnabled } from '@/config/bunny.config';
import logger from '@/utils/logger';

export interface CdnUrlResult {
  success: boolean;
  cdnUrl: string;
  error?: string;
}

export default class BunnyCdnService {
  private readonly storageCdnHostname: string;
  private readonly streamCdnHostname: string;

  constructor() {
    const { storage, stream } = bunnyConfig;
    this.storageCdnHostname = storage.cdnHostname;
    this.streamCdnHostname = stream.cdnHostname;
  }

  /**
   * Verifica si el servicio de Bunny CDN está habilitado
   */
  isEnabled(): boolean {
    return isBunnyEnabled;
  }

  /**
   * Obtiene la URL del CDN para una imagen
   * @param fileName - Nombre del archivo
   * @param folder - Carpeta dentro del storage zone (e.g., 'images', 'courses')
   */
  getImageUrl(fileName: string, folder: string = 'images'): CdnUrlResult {
    if (!this.isEnabled() || !bunnyConfig.storage.enabled) {
      return {
        success: false,
        cdnUrl: '',
        error: 'Bunny Storage CDN is not enabled. Check configuration.',
      };
    }

    try {
      // Construir URL del CDN: https://your-storage-zone.b-cdn.net/folder/filename
      const cdnUrl = `${this.storageCdnHostname}/${folder}/${fileName}`;
      
      logger.debug(`🖼️  Image CDN URL: ${cdnUrl}`);

      return {
        success: true,
        cdnUrl,
      };
    } catch (error) {
      const err = error as Error;
      logger.error(`❌ Error building image CDN URL:`, err.message);

      return {
        success: false,
        cdnUrl: '',
        error: err.message,
      };
    }
  }

  /**
   * Obtiene la URL del CDN para un video (playlist HLS)
   * @param videoGuid - GUID del video en Bunny Stream
   */
  getVideoPlaylistUrl(videoGuid: string): CdnUrlResult {
    if (!this.isEnabled() || !bunnyConfig.stream.enabled) {
      return {
        success: false,
        cdnUrl: '',
        error: 'Bunny Stream CDN is not enabled. Check configuration.',
      };
    }

    try {
      // Construir URL del CDN para streaming HLS: https://vz-xxxxx-xxx.b-cdn.net/{guid}/playlist.m3u8
      const cdnUrl = `${this.streamCdnHostname}/${videoGuid}/playlist.m3u8`;
      
      logger.debug(`🎥 Video playlist URL: ${cdnUrl}`);

      return {
        success: true,
        cdnUrl,
      };
    } catch (error) {
      const err = error as Error;
      logger.error(`❌ Error building video CDN URL:`, err.message);

      return {
        success: false,
        cdnUrl: '',
        error: err.message,
      };
    }
  }

  /**
   * Obtiene la URL del thumbnail de un video
   * @param videoGuid - GUID del video en Bunny Stream
   */
  getVideoThumbnailUrl(videoGuid: string): CdnUrlResult {
    if (!this.isEnabled() || !bunnyConfig.stream.enabled) {
      return {
        success: false,
        cdnUrl: '',
        error: 'Bunny Stream CDN is not enabled. Check configuration.',
      };
    }

    try {
      // Bunny Stream genera thumbnails automáticamente
      const cdnUrl = `${this.streamCdnHostname}/${videoGuid}/thumbnail.jpg`;
      
      logger.debug(`🖼️  Video thumbnail URL: ${cdnUrl}`);

      return {
        success: true,
        cdnUrl,
      };
    } catch (error) {
      const err = error as Error;
      logger.error(`❌ Error building video thumbnail URL:`, err.message);

      return {
        success: false,
        cdnUrl: '',
        error: err.message,
      };
    }
  }

  /**
   * Extrae el nombre de archivo de una URL completa de Bunny CDN
   * Útil para convertir URLs existentes en nombres de archivo
   */
  extractFileNameFromCdnUrl(cdnUrl: string): string | null {
    try {
      // Si la URL es de Bunny CDN, extraer el nombre del archivo
      if (cdnUrl.includes(this.storageCdnHostname)) {
        const url = new URL(cdnUrl);
        const pathParts = url.pathname.split('/');
        return pathParts[pathParts.length - 1];
      }

      return null;
    } catch (error) {
      logger.error(`❌ Error extracting filename from CDN URL:`, error);
      return null;
    }
  }

  /**
   * Verifica si una URL es de Bunny CDN
   */
  isBunnyCdnUrl(url: string): boolean {
    return url.includes(this.storageCdnHostname) || url.includes(this.streamCdnHostname);
  }

  /**
   * Obtiene la URL base del Storage CDN
   */
  getStorageCdnBaseUrl(): string {
    return this.storageCdnHostname;
  }

  /**
   * Obtiene la URL base del Stream CDN
   */
  getStreamCdnBaseUrl(): string {
    return this.streamCdnHostname;
  }
}
