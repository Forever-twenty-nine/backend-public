import { IBusinessTraining } from "@/models";
import BusinessTrainingRepository from "@/repositories/businessTraining.repository";
import { CreateBusinessTrainingDTO } from "@/dto";
import { sendEmail, sendAndAttachPreview, buildContactHtml, buildContactText, buildThankYouHtml, buildThankYouText, CORPORATE_MAIL, logger } from "@/utils";
import config from "@/config";

class BusinessTrainingService {
  constructor(
    private readonly businessTrainingRepository: BusinessTrainingRepository,
  ) {}

  /**
   * Creates a new BusinessTraining entry
   * @param businessTrainingData Data to create
   * @returns Created BusinessTraining
   */
  async create(
    businessTrainingData: CreateBusinessTrainingDTO,
  ): Promise<IBusinessTraining> {
    try {
      const created =
        await this.businessTrainingRepository.create(businessTrainingData);
      // Notificar al mail corporativo (centralizado)
      // Enviar mail a corporate con detalles
      const createdObj = created.toObject ? created.toObject() : created;
      const corporateHtml = buildContactHtml("Nuevo BusinessTraining recibido", {
        id: (createdObj as any)._id || (createdObj as any).id || null,
        name: (createdObj as any).name,
        email: (createdObj as any).email,
        phoneNumber: (createdObj as any).phoneNumber,
        message: (createdObj as any).message,
      });
      const corporateText = buildContactText("Nuevo BusinessTraining recibido", {
        id: (createdObj as any)._id || (createdObj as any).id || null,
        name: (createdObj as any).name,
        email: (createdObj as any).email,
        phoneNumber: (createdObj as any).phoneNumber,
        message: (createdObj as any).message,
      });

      const corporatePayload = {
        email: CORPORATE_MAIL,
        subject: "Nuevo BusinessTraining recibido",
        html: corporateHtml,
        text: corporateText,
        replyTo: (businessTrainingData as any).email ?? CORPORATE_MAIL,
      } as any;

      if (config.EMAIL_USE_ETHEREAL) {
        await sendAndAttachPreview(created, corporatePayload, "__etherealPreviewUrlCorporate");
      } else {
        sendEmail(corporatePayload).catch((err) =>
          logger.error("Failed to send BusinessTraining notification to corporate", err),
        );
      }

      // Enviar mail de agradecimiento al contacto (si existe)
      if ((createdObj as any).email) {
        const contactHtml = buildThankYouHtml((createdObj as any).name ?? "");
        const contactText = buildThankYouText((createdObj as any).name ?? "");
        const contactPayload = {
          email: (createdObj as any).email as string,
          subject: "Gracias por contactarte con Cursala",
          html: contactHtml,
          text: contactText,
          replyTo: CORPORATE_MAIL,
        } as any;

        if (config.EMAIL_USE_ETHEREAL) {
          await sendAndAttachPreview(created, contactPayload, "__etherealPreviewUrlContact");
        } else {
          sendEmail(contactPayload).catch((err) =>
            logger.error("Failed to send thank-you email to contact", err),
          );
        }
      }

      return created;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const err = new Error(
          `Error creating BusinessTraining: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error creating BusinessTraining: ${String(error)}`);
    }
  }
}

export default BusinessTrainingService;
