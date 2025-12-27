import { IIWantToTrain } from "@/models";
import RequestACourseRepository from "@/repositories/requestACourse.repository";
import { CreateRequestACourseDTO } from "@/dto";
import { sendEmail, CORPORATE_MAIL, logger } from "@/utils";

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
      // Notificar al mail corporativo (no bloquear la respuesta)
      sendEmail({
        email: CORPORATE_MAIL,
        subject: "Nuevo RequestACourse recibido",
        html: `<p>Nuevo RequestACourse creado:</p><pre>${JSON.stringify(
          {
            id: (created as any)._id || (created as any).id || null,
            data: requestACourseData,
          },
          null,
          2,
        )}</pre>`,
      }).catch((err) =>
        logger.error("Failed to send RequestACourse notification", err),
      );

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
