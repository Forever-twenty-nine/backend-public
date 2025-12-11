/* eslint-env jest */
import CertificateService from '../certificate.service';
import UserRepository from '../../repositories/user.repository';
import CourseRepository from '../../repositories/course.repository';
import CertificateRepository from '../../repositories/certificate.repository';

describe('CertificateService', () => {
  let service: CertificateService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCourseRepository: jest.Mocked<CourseRepository>;
  let mockCertificateRepository: jest.Mocked<CertificateRepository>;

  beforeEach(() => {
    mockUserRepository = {
      getUserById: jest.fn(),
      // Add other methods as needed
    } as any;
    mockCourseRepository = {
      findById: jest.fn(),
      // Add other methods as needed
    } as any;
    mockCertificateRepository = {
      findOneByVerificationCode: jest.fn(),
      findOneById: jest.fn(),
      findExistingCertificate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      validateCertificate: jest.fn(),
      softDelete: jest.fn(),
      findByCourse: jest.fn(),
      findByStudent: jest.fn(),
      findAll: jest.fn(),
    } as any;

    service = new CertificateService(
      mockUserRepository,
      mockCourseRepository,
      mockCertificateRepository
    );

    // Mock the decryptVerificationCode method to avoid crypto issues
    jest.spyOn(service as any, 'decryptVerificationCode').mockReturnValue({
      studentId: 'student1',
      courseId: 'course1',
      teacherId: 'teacher1',
      expiresAt: null,
    });
  });

  describe('validateCertificate', () => {
    it('should validate a certificate successfully', async () => {
      const mockCert = {
        _id: 'cert1',
        verificationCode: 'validCode',
        studentId: 'student1',
        courseId: 'course1',
        teacherId: 'teacher1',
        generatedAt: new Date(),
        generatedBy: 'admin',
        certificateId: 'CERT001',
      };

      const mockStudent = {
        _id: 'student1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const mockCourse = {
        _id: 'course1',
        title: 'Test Course',
      };

      const mockTeacher = {
        _id: 'teacher1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        professionalDescription: 'Test teacher',
        professionalSignatureUrl: 'signature.png',
      };

      mockCertificateRepository.validateCertificate.mockResolvedValue(mockCert as any);
      mockUserRepository.getUserById.mockImplementation((id: string) => {
        if (id === 'student1') return Promise.resolve(mockStudent as any);
        if (id === 'teacher1') return Promise.resolve(mockTeacher as any);
        return Promise.resolve(null);
      });
      mockCourseRepository.findById.mockResolvedValue(mockCourse as any);

      const result = await service.validateCertificate('validCode');

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(mockCertificateRepository.validateCertificate).toHaveBeenCalledWith('validCode');
    });

    it('should return invalid result for invalid certificate', async () => {
      mockCertificateRepository.validateCertificate.mockResolvedValue(null);

      const result = await service.validateCertificate('invalidCode');

      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Certificado no encontrado');
    });
  });

  describe('checkCertificateExists', () => {
    it('should return certificate when certificate exists', async () => {
      const mockCert = {
        _id: 'cert1',
        studentId: 'student1',
        courseId: 'course1',
      };

      mockCertificateRepository.findExistingCertificate.mockResolvedValue(mockCert as any);

      const result = await service.checkCertificateExists('student1', 'course1');

      expect(result).toEqual(mockCert);
      expect(mockCertificateRepository.findExistingCertificate).toHaveBeenCalledWith('student1', 'course1');
    });

    it('should return null when certificate does not exist', async () => {
      mockCertificateRepository.findExistingCertificate.mockResolvedValue(null);

      const result = await service.checkCertificateExists('student1', 'course1');

      expect(result).toBeNull();
    });
  });

  describe('checkCertificateExistsById', () => {
    it('should return certificate when certificate exists by id', async () => {
      const mockCert = {
        _id: 'cert1',
        verificationCode: 'code',
      };

      mockCertificateRepository.findOneById.mockResolvedValue(mockCert as any);

      const result = await service.checkCertificateExistsById('cert1');

      expect(result).toEqual(mockCert);
      expect(mockCertificateRepository.findOneById).toHaveBeenCalledWith('cert1');
    });

    it('should return null when certificate does not exist by id', async () => {
      mockCertificateRepository.findOneById.mockResolvedValue(null);

      const result = await service.checkCertificateExistsById('cert1');

      expect(result).toBeNull();
    });
  });

  describe('getCertificatesByCourse', () => {
    it('should return certificates for a course', async () => {
      const mockCerts = [
        { _id: 'cert1', studentId: 'student1', courseId: 'course1' },
        { _id: 'cert2', studentId: 'student2', courseId: 'course1' },
      ];

      mockCertificateRepository.findByCourse = jest.fn().mockResolvedValue(mockCerts);

      const result = await service.getCertificatesByCourse('course1');

      expect(mockCertificateRepository.findByCourse).toHaveBeenCalledWith('course1');
      expect(result).toEqual(mockCerts);
    });
  });

  describe('getCertificatesByStudent', () => {
    it('should return certificates for a student', async () => {
      const mockCerts = [
        { _id: 'cert1', studentId: 'student1', courseId: 'course1' },
        { _id: 'cert2', studentId: 'student1', courseId: 'course2' },
      ];

      mockCertificateRepository.findByStudent = jest.fn().mockResolvedValue(mockCerts);

      const result = await service.getCertificatesByStudent('student1');

      expect(mockCertificateRepository.findByStudent).toHaveBeenCalledWith('student1');
      expect(result).toEqual(mockCerts);
    });
  });

  describe('debugListAllCertificates', () => {
    it('should return all certificates for debugging', async () => {
      const mockCerts = [
        { _id: 'cert1', verificationCode: 'code1' },
        { _id: 'cert2', verificationCode: 'code2' },
      ];

      mockCertificateRepository.findAll = jest.fn().mockResolvedValue(mockCerts);

      const result = await service.debugListAllCertificates();

      expect(mockCertificateRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCerts);
    });
  });
});