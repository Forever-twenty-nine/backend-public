import { Router } from 'express';
import { certificateController } from '@/controllers';

const router = Router();

// GET routes
/**
 * @route GET /download/:verificationCode
 * @desc Descarga un certificado en formato PDF
 * @access Public (no requiere autenticación - el verificationCode es seguro)
 */
router.get('/download/:verificationCode', certificateController.downloadCertificate);

/**
 * @route GET /validate/:verificationCode
 * @desc Valida un certificado usando el código de verificación
 * @access Public (no requiere autenticación)
 */
router.get('/validate/:verificationCode', certificateController.validateCertificate);

export default router;
