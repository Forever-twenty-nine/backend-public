import { NextFunction, Request, Response } from 'express';
import { logger, prepareResponse } from '../utils';
import CourseService from '@/services/course.service';
import { ICourse } from '@/models';

export default class CourseController {
  constructor(private readonly courseService: CourseService) { }

  findOneById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.findOneById(courseId);
      if (!course) {
        return res.status(404).json(prepareResponse(404, 'Course not found'));
      }
      return res.json(prepareResponse(200, 'Course fetched successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  findOnePublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.findOnePublic(courseId);
      if (!course) {
        return res.status(404).json(prepareResponse(404, 'Course not found'));
      }
      return res.json(prepareResponse(200, 'Course fetched successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extraemos los datos del body
      const {
        name,
        description,
        longDescription,
        status,
        order,
        days,
        time,
        startDate,
        registrationOpenDate,
        modality,
        price,
        maxInstallments,
        interestFree,
        isPublished,
        imageUrl,
        programUrl,
      } = req.body;

      // Construir el objeto de datos del curso, convirtiendo los tipos si es necesario
      const courseData = {
        name,
        description,
        longDescription,
        status,
        order: order ? Number(order) : 0,
        imageUrl,
        days: typeof days === 'string' ? days.split(',').map((day) => day.trim()) : days,
        time,
        startDate: startDate ? new Date(startDate) : undefined,
        registrationOpenDate: registrationOpenDate ? new Date(registrationOpenDate) : undefined,
        modality,
        price: price ? Number(price) : undefined,
        programUrl,
        maxInstallments: maxInstallments ? Number(maxInstallments) : 0,
        interestFree: interestFree === 'true' || interestFree === true,
        isPublished: (() => {
          if (isPublished === undefined) return true; // Por defecto true para nuevos cursos
          if (typeof isPublished === 'string') return isPublished.toLowerCase() === 'true';
          return Boolean(isPublished);
        })(),
      };

      const course = await this.courseService.create(courseData);
      return res.json(prepareResponse(201, 'Course created successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const existingCourse = await this.courseService.findOneById(id);
      if (!existingCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const updateData: Partial<ICourse> = {};
      const unsetFields: string[] = [];
      const {
        name,
        description,
        longDescription,
        days,
        time,
        startDate,
        registrationOpenDate,
        modality,
        price,
        maxInstallments,
        interestFree,
        numberOfClasses,
        duration,
        imageUrl,
        programUrl,
      } = req.body;

      // Solo actualizar campos si están presentes en req.body
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (longDescription !== undefined) updateData.longDescription = longDescription;
      if (days !== undefined) {
        if (typeof days === 'string') {
          updateData.days = days.split(',').map((day) => day.trim());
        } else {
          updateData.days = days;
        }
      }
      if (time !== undefined) updateData.time = time;
      // Manejar startDate: si no se envía (undefined) o está vacío, eliminarlo de la base de datos
      if (startDate !== undefined) {
        if (startDate === '' || startDate === null) {
          unsetFields.push('startDate');
        } else {
          updateData.startDate = new Date(startDate);
        }
      } else {
        // Si startDate es undefined (no se envió), eliminarlo de la base de datos
        unsetFields.push('startDate');
      }
      // Manejar registrationOpenDate: si no se envía (undefined) o está vacío, eliminarlo de la base de datos
      if (registrationOpenDate !== undefined) {
        if (registrationOpenDate === '' || registrationOpenDate === null) {
          unsetFields.push('registrationOpenDate');
        } else {
          updateData.registrationOpenDate = new Date(registrationOpenDate);
        }
      } else {
        // Si registrationOpenDate es undefined (no se envió), eliminarlo de la base de datos
        unsetFields.push('registrationOpenDate');
      }
      if (modality !== undefined) updateData.modality = modality;
      if (price !== undefined) updateData.price = Number(price);
      if (maxInstallments !== undefined) updateData.maxInstallments = Number(maxInstallments);
      if (interestFree !== undefined) updateData.interestFree = interestFree === 'true' || interestFree === true;
      if (numberOfClasses !== undefined) updateData.numberOfClasses = Number(numberOfClasses);
      if (duration !== undefined) updateData.duration = Number(duration);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (programUrl !== undefined) updateData.programUrl = programUrl;

      let hasUpdates = Object.keys(updateData).length > 0 || unsetFields.length > 0;

      // Validar que se reciba al menos un campo para actualizar
      if (!hasUpdates) {
        return res.status(400).json({ message: 'At least one field must be provided for update' });
      }

      // Realizar la actualización
      const updatedCourse = await this.courseService.update(id, updateData, unsetFields);
      return res.json(prepareResponse(200, 'Course updated successfully', updatedCourse));
    } catch (error) {
      logger.error(`Update course error: ${(error as Error).message}`);
      return next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.delete(courseId);
      return res.json(prepareResponse(200, 'Course deleted successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await this.courseService.findAll();
      // Devolver solo campos esenciales para público
      const coursesPublic = courses.map(course => ({
        _id: course._id,
        name: course.name,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        modality: course.modality,
        duration: course.duration,
        mainTeacher: course.mainTeacher,
        numberOfClasses: course.numberOfClasses,
      }));
      return res.json(prepareResponse(200, 'Courses fetched successfully', coursesPublic));
    } catch (error) {
      return next(error);
    }
  };

  findPublishedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await this.courseService.findPublishedCourses();
      // Devolver solo campos esenciales para público
      const coursesPublic = courses.map((course: any) => ({
        _id: course._id,
        name: course.name,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        modality: course.modality,
        duration: course.duration,
        mainTeacher: course.mainTeacher,
        mainTeacherInfo: course.mainTeacherInfo,
        numberOfClasses: course.numberOfClasses,
        startDate: course.startDate,
        registrationOpenDate: course.registrationOpenDate,
        endDate: course.endDate,
        classCount: course.classCount,
      }));
      return res.json(prepareResponse(200, 'Published courses fetched successfully', coursesPublic));
    } catch (error) {
      return next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { status } = req.body;
      const course = await this.courseService.changeStatus(courseId, status);
      return res.json(prepareResponse(200, 'Course status updated successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  moveUpOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.moveUpOrder(courseId);
      return res.json(prepareResponse(200, 'Course order moved up successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  moveDownOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.moveDownOrder(courseId);
      return res.json(prepareResponse(200, 'Course order moved down successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  getCourseImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageFileName } = req.params;
      const fileBuffer = await this.courseService.getCourseImage(imageFileName);
      if (!fileBuffer) {
        return res.status(404).json({ message: 'Image not found' });
      }
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(fileBuffer);
    } catch (error) {
      return next(error);
    }
  };

  findForHome = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await this.courseService.findForHome();
      // Devolver solo campos esenciales para público
      const coursesPublic = courses.map((course: any) => ({
        _id: course._id,
        name: course.name,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        modality: course.modality,
        duration: course.duration,
        mainTeacher: course.mainTeacher,
        mainTeacherInfo: course.mainTeacherInfo,
        numberOfClasses: course.numberOfClasses,
        startDate: course.startDate,
        registrationOpenDate: course.registrationOpenDate,
        endDate: course.endDate,
        classCount: course.classCount,
      }));
      return res.json(prepareResponse(200, 'Courses for home fetched successfully', coursesPublic));
    } catch (error) {
      return next(error);
    }
  };

  changeShowOnHome = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await this.courseService.changeShowOnHome(courseId);
      return res.json(prepareResponse(200, 'Course show on home status updated successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  assignMainTeacher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { mainTeacherId } = req.body;

      const course = await this.courseService.assignMainTeacher(courseId, mainTeacherId);

      if (!mainTeacherId || mainTeacherId === '') {
        return res.json(prepareResponse(200, 'Main teacher removed successfully', course));
      }
      return res.json(prepareResponse(200, 'Main teacher assigned successfully', course));
    } catch (error) {
      return next(error);
    }
  };

  changePublishedStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { isPublished } = req.body;

      logger.info('=== ENDPOINT changePublishedStatus ===');
      logger.info(`courseId: ${courseId}`);
      logger.info(`isPublished recibido: ${isPublished}, tipo: ${typeof isPublished}`);

      // Validar que courseId existe
      if (!courseId) {
        return res.status(400).json(prepareResponse(400, 'Course ID is required'));
      }

      // Validar que isPublished es un boolean
      if (typeof isPublished !== 'boolean') {
        return res.status(400).json(prepareResponse(400, 'isPublished must be a boolean'));
      }

      // Verificar que el curso existe
      const existingCourse = await this.courseService.findOneById(courseId);
      if (!existingCourse) {
        return res.status(404).json(prepareResponse(404, 'Course not found'));
      }

      // Actualizar solo el campo isPublished
      const updatedCourse = await this.courseService.update(courseId, { isPublished }, []);

      logger.info(`Curso actualizado - isPublished: ${updatedCourse.isPublished}`);

      return res.json(prepareResponse(200, 'Course published status updated successfully', updatedCourse));
    } catch (error) {
      logger.error('Error in changePublishedStatus:', error);
      return next(error);
    }
  };
}
