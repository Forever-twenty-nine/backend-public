import { IBusinessTraining } from "@/models";
import BusinessTrainingRepository from "@/repositories/businessTraining.repository";
import { CreateBusinessTrainingDTO } from "@/dto";
import { sendEmail, sendAndAttachPreview, CORPORATE_MAIL, logger } from "@/utils";
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
      const mailPayload = {
        email: CORPORATE_MAIL,
        subject: "Nuevo BusinessTraining recibido",
        html: `<p>Nuevo BusinessTraining creado:</p><pre>${JSON.stringify(
          {
            id: (created as any)._id || (created as any).id || null,
            data: businessTrainingData,
          },
          null,
          2,
        )}</pre>`,
      };

      if (config.EMAIL_USE_ETHEREAL) {
        await sendAndAttachPreview(created, mailPayload as any);
      } else {
        // non-blocking send in production
        sendEmail(mailPayload).catch((err) =>
          logger.error("Failed to send BusinessTraining notification", err),
        );
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
