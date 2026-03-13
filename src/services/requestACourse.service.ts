import { IIWantToTrain } from '@/models';
import RequestACourseRepository from '@/repositories/requestACourse.repository';
import { CreateRequestACourseDTO } from '@/dto';
import { sendEmail, emailTemplate } from '@/utils';
import config from '@/config';

class RequestACourseService {
  constructor(private readonly requestACourseRepository: RequestACourseRepository) {}

  /**
   * Creates a new RequestACourse entry
   * @param requestACourseData Data to create
   * @returns Created RequestACourse
   */
  async create(requestACourseData: CreateRequestACourseDTO): Promise<IIWantToTrain> {
    try {
      const created = await this.requestACourseRepository.create(requestACourseData);

      // Enviar correo al administrador
      const adminHtml = emailTemplate('Nueva Solicitud: Pedir un Curso', {
        Nombre: requestACourseData.name,
        Empresa: requestACourseData.company,
        Email: requestACourseData.email,
        Prefijo: requestACourseData.phonePrefix,
        Teléfono: requestACourseData.phoneNumber,
        Mensaje: requestACourseData.message,
        'ID de Solicitud': String(created._id),
      });

      await sendEmail({
        email: config.ADMIN_NOTIFICATION_EMAIL || 'info@cursala.com.ar',
        subject: `Nuevo lead: Solicitud de curso - ${requestACourseData.name}`,
        html: adminHtml,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando email RequestACourse Admin:', err);
      });

      // Enviar correo de confirmación al usuario
      const userHtml = emailTemplate('¡Hemos recibido tu solicitud de curso!', {
        'Hola': requestACourseData.name,
        'Mensaje': 'Gracias por sugerirnos un nuevo tema de capacitación. Evaluaremos tu propuesta y te contactaremos.',
      });

      await sendEmail({
        email: requestACourseData.email,
        subject: 'Cursala - Solicitud de Curso Recibida',
        html: userHtml,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando email RequestACourse Usuario:', err);
      });

      return created;
    } catch (error) {
      throw new Error(`Error creating RequestACourse: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default RequestACourseService;