import { NextFunction, Request, Response } from 'express'
import { prepareResponse } from '../utils'
import { courseService } from '@/services'

export default class CourseController {
  constructor(private readonly service = courseService) {}

  findForHome = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.service.findForHome()
      return res.json(prepareResponse(200, 'Courses for home fetched successfully', items))
    } catch (err) {
      return next(err)
    }
  }

  findPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page || 1)
      const size = Number(req.query.size || 20)
      const filter = {} as Record<string, any>
      const result = await this.service.findPublished(page, size, filter)
      return res.json(prepareResponse(200, 'Published courses fetched successfully', result))
    } catch (err) {
      return next(err)
    }
  }

  findOnePublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params
      console.log('🔍 Finding course with ID:', courseId)
      const course = await this.service.findOnePublic(courseId)
      console.log('📦 Course found:', course ? 'Yes' : 'No')
      if (!course) return res.status(404).json(prepareResponse(404, 'Course not found'))
      return res.json(prepareResponse(200, 'Course fetched successfully', course))
    } catch (err) {
      console.error('❌ Error in findOnePublic:', err)
      return next(err)
    }
  }
}
