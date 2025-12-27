import { IBusinessTraining } from "@/models";
import BusinessTrainingRepository from "@/repositories/businessTraining.repository";
import { CreateBusinessTrainingDTO } from "@/dto";
import { sendEmail, CORPORATE_MAIL, logger } from "@/utils";

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
      // Notificar al mail corporativo (no bloquear la respuesta)
      sendEmail({
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
      }).catch((err) =>
        logger.error("Failed to send BusinessTraining notification", err),
      );

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
