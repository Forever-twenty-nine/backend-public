import { IIWantToTrain } from "@/models";
import IWantToTrainRepository from "@/repositories/iwanttotrain.repository";
import { CreateIWantToTrainDTO } from "@/dto";
import { sendEmail, sendAndAttachPreview, buildContactHtml, buildContactText, buildThankYouHtml, buildThankYouText, CORPORATE_MAIL, logger } from "@/utils";
import config from "@/config";

class IWantToTrainService {
  constructor(
    private readonly iWantToTrainRepository: IWantToTrainRepository,
  ) {}

  /**
   * Creates a new IWantToTrain entry
   * @param iWantToTrainData Data to create
   * @returns Created IWantToTrain
   */
  async create(
    iWantToTrainData: CreateIWantToTrainDTO,
  ): Promise<IIWantToTrain> {
    try {
      const created =
        await this.iWantToTrainRepository.create(iWantToTrainData);
      // Notificar al mail corporativo (centralizado)
      // corporate
      const createdObj = created.toObject ? created.toObject() : created;
      const corporateHtml = buildContactHtml("Nuevo IWantToTrain recibido", {
        id: (createdObj as any)._id || (createdObj as any).id || null,
        name: (createdObj as any).name,
        email: (createdObj as any).email,
        phoneNumber: (createdObj as any).phoneNumber,
        message: (createdObj as any).message,
      });
      const corporateText = buildContactText("Nuevo IWantToTrain recibido", {
        id: (createdObj as any)._id || (createdObj as any).id || null,
        name: (createdObj as any).name,
        email: (createdObj as any).email,
        phoneNumber: (createdObj as any).phoneNumber,
        message: (createdObj as any).message,
      });

      const corporatePayload = {
        email: CORPORATE_MAIL,
        subject: "Nuevo IWantToTrain recibido",
        html: corporateHtml,
        text: corporateText,
        replyTo: (iWantToTrainData as any).email ?? CORPORATE_MAIL,
      } as any;

      if (config.EMAIL_USE_ETHEREAL) {
        await sendAndAttachPreview(created, corporatePayload, "__etherealPreviewUrlCorporate");
      } else {
        sendEmail(corporatePayload).catch((err) =>
          logger.error("Failed to send IWantToTrain notification to corporate", err),
        );
      }

      // thank-you to contact
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
        const err = new Error(`Error creating IWantToTrain: ${error.message}`);
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error creating IWantToTrain: ${String(error)}`);
    }
  }
}

export default IWantToTrainService;
