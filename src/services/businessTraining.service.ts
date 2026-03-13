import { IBusinessTraining } from '@/models';
import BusinessTrainingRepository from '@/repositories/businessTraining.repository';
import { CreateBusinessTrainingDTO } from '@/dto';
import { sendEmail, emailTemplate } from '@/utils';
import config from '@/config';

class BusinessTrainingService {
  constructor(private readonly businessTrainingRepository: BusinessTrainingRepository) {}

  /**
   * Creates a new BusinessTraining entry
   * @param businessTrainingData Data to create
   * @returns Created BusinessTraining
   */
  async create(businessTrainingData: CreateBusinessTrainingDTO): Promise<IBusinessTraining> {
    try {
      const created = await this.businessTrainingRepository.create(businessTrainingData);

      // Enviar correo al administrador
      const adminHtml = emailTemplate('Nuevo Lead: Capacitación Empresarial', {
        Nombre: businessTrainingData.name,
        Email: businessTrainingData.email,
        Teléfono: businessTrainingData.phoneNumber,
        Mensaje: businessTrainingData.message,
        'ID de Solicitud': String(created._id),
      });

      await sendEmail({
        email: config.ADMIN_NOTIFICATION_EMAIL || 'info@cursala.com.ar',
        subject: `Nuevo Lead Empresa: ${businessTrainingData.name}`,
        html: adminHtml,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando email BusinessTraining Admin:', err);
      });

      // Enviar correo de confirmación al usuario
      const userHtml = emailTemplate('¡Hemos recibido tu solicitud!', {
        'Hola': businessTrainingData.name,
        'Mensaje': 'Gracias por contactarnos. Un asesor de Cursala se pondrá en contacto contigo a la brevedad para brindarte más información sobre nuestra propuesta para empresas.',
        'Tu Solicitud': businessTrainingData.message,
      });

      await sendEmail({
        email: businessTrainingData.email,
        subject: 'Cursala - Solicitud Recibida',
        html: userHtml,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando email BusinessTraining Usuario:', err);
      });

      return created;
    } catch (error) {
      throw new Error(`Error creating BusinessTraining: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default BusinessTrainingService;