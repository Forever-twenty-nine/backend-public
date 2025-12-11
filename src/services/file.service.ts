import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  sanitizeImageFileName,
  sanitizeVideoFileName,
  sanitizeAnyFileName,
  isPathInAllowedDirectories,
} from '@/utils/fileSecurity.util';
import logger from '@/utils/logger';
import BunnyCdnService from './bunnyCdn.service';

// Polyfill para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bunnyCdnService = new BunnyCdnService();

export default class FileService {
  /**
   * Obtiene la URL del CDN de Bunny para una imagen
   * Siempre retorna la URL de Bunny (sistema CDN puro)
   */
  getBunnyCdnImageUrl(imageFileName: string): string {
    try {
      const cdnUrlResult = bunnyCdnService.getImageUrl(imageFileName, 'images');
      if (cdnUrlResult.success) {
        return cdnUrlResult.cdnUrl;
      }
      // Si no se pudo generar la URL, lanzar error para que el controlador maneje el 404
      throw new Error(cdnUrlResult.error || 'Failed to generate CDN URL');
    } catch (error) {
      logger.warn(`⚠️ Error getting Bunny CDN URL:`, error);
      throw error; // Re-lanzar para que el controlador capture y retorne 404
    }
  }
  /**
   * Obtiene la imagen de un archivo.
   * En backend-public NO se sirven imágenes locales, solo placeholders.
   * Las imágenes reales deben venir de Bunny CDN.
   * @param imageFileName - Nombre del archivo de la imagen.
   * @param requestIP - IP del cliente (para logging de seguridad)
   * @returns null siempre (el controlador servirá placeholder)
   */
  async getFileImage(imageFileName: string, requestIP?: string): Promise<Buffer | null> {
    try {
      logger.info(`📂 getFileImage called with: "${imageFileName}"`);
      logger.info(`⚠️  Backend-public does not serve static images. Use Bunny CDN or placeholder will be served.`);
      
      // Siempre retornar null para que se use el placeholder
      return null;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ Error in getFileImage:`, error);
        throw new Error(`Error reading file image: ${error.message}`);
      }
      throw new Error('Unknown error reading file image');
    }
  }

  /**
   * Obtiene el video de un archivo.
   * @param videoFileName - Nombre del archivo del video.
   * @param requestIP - IP del cliente (para logging de seguridad)
   * @returns El contenido del video como Buffer o null si no existe.
   */
  async getFileVideo(videoFileName: string, requestIP?: string): Promise<Buffer | null> {
    try {
      // Validar y sanitizar el nombre del archivo
      const sanitizationResult = sanitizeVideoFileName(videoFileName, requestIP);

      if (!sanitizationResult.isValid) {
        throw new Error(`Invalid file name: ${sanitizationResult.reason}`);
      }

      const sanitizedFileName = sanitizationResult.fileName!;

      // Directorios permitidos (local y remoto)
      const allowedDirectories = [
        path.resolve(__dirname, '../static/videos'),
        path.resolve(__dirname, '../static-remote/videos')
      ];

      // Intentar primero el directorio remoto si existe
      let filePath = path.resolve(__dirname, '../static-remote/videos', sanitizedFileName);
      let isRemote = true;

      if (!fs.existsSync(filePath)) {
        // Si no existe en remoto, intentar local
        filePath = path.resolve(__dirname, '../static/videos', sanitizedFileName);
        isRemote = false;
        logger.info(`🔄 Remote video not found, trying local: "${filePath}"`);
      } else {
        logger.info(`🌐 Using remote video: "${filePath}"`);
      }

      // Verificar que el archivo está dentro del directorio permitido
      if (!isPathInAllowedDirectories(filePath, allowedDirectories, requestIP)) {
        throw new Error('Access denied: Path traversal attempt detected');
      }

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileBuffer = fs.readFileSync(filePath);
      logger.info(`✅ Video file read successfully: ${fileBuffer.length} bytes from ${isRemote ? 'remote' : 'local'}`);
      return fileBuffer;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error reading file video: ${error.message}`);
      }
      throw new Error('Unknown error reading file video');
    }
  }

  /**
   * Obtiene un archivo de materiales de soporte.
   * @param fileName - Nombre del archivo.
   * @param requestIP - IP del cliente (para logging de seguridad)
   * @returns El contenido del archivo como Buffer o null si no existe.
   */
  async getFile(fileName: string, requestIP?: string): Promise<Buffer | null> {
    try {
      // Validar y sanitizar el nombre del archivo (permite cualquier tipo)
      const sanitizationResult = sanitizeAnyFileName(fileName, requestIP);

      if (!sanitizationResult.isValid) {
        throw new Error(`Invalid file name: ${sanitizationResult.reason}`);
      }

      const sanitizedFileName = sanitizationResult.fileName!;

      // Directorios permitidos
      const allowedDirectories = [path.resolve(__dirname, '../static/supportMaterials')];

      // Construir ruta del archivo
      const filePath = path.resolve(__dirname, '../static/supportMaterials', sanitizedFileName);

      // Verificar que el archivo está dentro del directorio permitido
      if (!isPathInAllowedDirectories(filePath, allowedDirectories, requestIP)) {
        throw new Error('Access denied: Path traversal attempt detected');
      }

      if (!fs.existsSync(filePath)) {
        return null;
      }

      return fs.readFileSync(filePath);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error reading support material file: ${error.message}`);
      }
      throw new Error('Unknown error reading support material file');
    }
  }

  /**
   * Obtiene un archivo público.
   * @param fileName - Nombre del archivo.
   * @param requestIP - IP del cliente (para logging de seguridad)
   * @returns El contenido del archivo como Buffer o null si no existe.
   */
  async getPublicFile(fileName: string, requestIP?: string): Promise<Buffer | null> {
    try {
      // Validar y sanitizar el nombre del archivo (permite cualquier tipo)
      const sanitizationResult = sanitizeAnyFileName(fileName, requestIP);

      if (!sanitizationResult.isValid) {
        throw new Error(`Invalid file name: ${sanitizationResult.reason}`);
      }

      const sanitizedFileName = sanitizationResult.fileName!;

      // Directorios permitidos
      const allowedDirectories = [path.resolve(__dirname, '../static/filesPublic')];

      // Construir ruta del archivo
      const filePath = path.resolve(__dirname, '../static/filesPublic', sanitizedFileName);

      // Verificar que el archivo está dentro del directorio permitido
      if (!isPathInAllowedDirectories(filePath, allowedDirectories, requestIP)) {
        throw new Error('Access denied: Path traversal attempt detected');
      }

      if (!fs.existsSync(filePath)) {
        return null;
      }

      return fs.readFileSync(filePath);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error reading public file: ${error.message}`);
      }
      throw new Error('Unknown error reading public file');
    }
  }
}

