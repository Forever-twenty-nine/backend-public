import { IIWantToTrain } from "@/models";
import IWantToTrainRepository from "@/repositories/iwanttotrain.repository";
import { CreateIWantToTrainDTO } from "@/dto";
import { sendEmail, CORPORATE_MAIL, logger } from "@/utils";

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
      // Notificar al mail corporativo (no bloquear la respuesta)
      sendEmail({
        email: CORPORATE_MAIL,
        subject: "Nuevo IWantToTrain recibido",
        html: `<p>Nuevo IWantToTrain creado:</p><pre>${JSON.stringify(
          {
            id: (created as any)._id || (created as any).id || null,
            data: iWantToTrainData,
          },
          null,
          2,
        )}</pre>`,
      }).catch((err) =>
        logger.error("Failed to send IWantToTrain notification", err),
      );

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
