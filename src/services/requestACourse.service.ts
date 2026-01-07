import { IIWantToTrain } from "@/models";
import RequestACourseRepository from "@/repositories/requestACourse.repository";
import { CreateRequestACourseDTO } from "@/dto";
import { sendEmail, sendAndAttachPreview, buildContactHtml, buildContactText, buildThankYouHtml, buildThankYouText, CORPORATE_MAIL, logger } from "@/utils";
import config from "@/config";

class RequestACourseService {
  constructor(
    private readonly requestACourseRepository: RequestACourseRepository,
  ) {}

  /**
   * Creates a new RequestACourse entry
   * @param requestACourseData Data to create
   * @returns Created RequestACourse
   */
  async create(
    requestACourseData: CreateRequestACourseDTO,
  ): Promise<IIWantToTrain> {
    try {
      const created =
        await this.requestACourseRepository.create(requestACourseData);
      // Notificar al mail corporativo (centralizado)
      // corporate
      const createdObj = created.toObject ? created.toObject() : created;
      const corporateHtml = buildContactHtml("Nuevo RequestACourse recibido", {
        id: (createdObj as any)._id || (createdObj as any).id || null,
        name: (createdObj as any).name,
        email: (createdObj as any).email,
        phoneNumber: (createdObj as any).phoneNumber,
        message: (createdObj as any).message,
      });
      const corporateText = buildContactText("Nuevo RequestACourse recibido", {
        id: (createdObj as any)._id || (createdObj as any).id || null,
        name: (createdObj as any).name,
        email: (createdObj as any).email,
        phoneNumber: (createdObj as any).phoneNumber,
        message: (createdObj as any).message,
      });

      const corporatePayload = {
        email: CORPORATE_MAIL,
        subject: "Nuevo RequestACourse recibido",
        html: corporateHtml,
        text: corporateText,
        replyTo: (requestACourseData as any).email ?? CORPORATE_MAIL,
      } as any;

      if (config.EMAIL_USE_ETHEREAL) {
        await sendAndAttachPreview(created, corporatePayload, "__etherealPreviewUrlCorporate");
      } else {
        sendEmail(corporatePayload).catch((err) =>
          logger.error("Failed to send RequestACourse notification to corporate", err),
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
        const err = new Error(
          `Error creating RequestACourse: ${error.message}`,
        );
        (err as any).cause = error;
        throw err;
      }
      throw new Error(`Error creating RequestACourse: ${String(error)}`);
    }
  }
}

export default RequestACourseService;
