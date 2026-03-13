import { IIWantToTrain } from '@/models';
import IWantToTrainRepository from '@/repositories/iwanttotrain.repository';
import { CreateIWantToTrainDTO } from '@/dto';
import { sendEmail, emailTemplate } from '@/utils';
import config from '@/config';

class IWantToTrainService {
  constructor(private readonly iWantToTrainRepository: IWantToTrainRepository) {}

  /**
   * Creates a new IWantToTrain entry
   * @param iWantToTrainData Data to create
   * @returns Created IWantToTrain
   */
  async create(iWantToTrainData: CreateIWantToTrainDTO): Promise<IIWantToTrain> {
    try {
      const created = await this.iWantToTrainRepository.create(iWantToTrainData);

      // Enviar correo al administrador
      const adminHtml = emailTemplate('Nueva Solicitud: Quiero Entrenar', {
        Nombre: iWantToTrainData.name,
        Empresa: iWantToTrainData.company,
        Email: iWantToTrainData.email,
        Prefijo: iWantToTrainData.phonePrefix,
        Teléfono: iWantToTrainData.phoneNumber,
        Mensaje: iWantToTrainData.message,
        'ID de Solicitud': String(created._id),
      });

      await sendEmail({
        email: config.ADMIN_NOTIFICATION_EMAIL || 'info@cursala.com.ar',
        subject: `Nueva lead: Quiero Entrenar - ${iWantToTrainData.name}`,
        html: adminHtml,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando email IWantToTrain Admin:', err);
      });

      // Enviar correo de confirmación al usuario
      const userHtml = emailTemplate('¡Hemos recibido tu solicitud!', {
        'Hola': iWantToTrainData.name,
        'Empresa': iWantToTrainData.company,
        'Mensaje': 'Gracias por tu interés en capacitarte con nosotros. Hemos recibido tus datos correctamente.',
      });

      await sendEmail({
        email: iWantToTrainData.email,
        subject: 'Cursala - Solicitud de Entrenamiento Recibida',
        html: userHtml,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando email IWantToTrain Usuario:', err);
      });

      return created;
    } catch (error) {
      throw new Error(`Error creating IWantToTrain: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default IWantToTrainService;