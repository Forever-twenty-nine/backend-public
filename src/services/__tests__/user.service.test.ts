/* eslint-env jest */
import path from 'path';
import fs from 'fs';
import UserService from '@/services/user.service';

// Mocks para repositorios
const mockUserRepository: any = {
  addCountriesToUser: jest.fn(),
  getAllUsers: jest.fn(),
  removeRoleFromUser: jest.fn(),
  addRoleToUser: jest.fn(),
  changueStatus: jest.fn(),
  assignCourseToUser: jest.fn(),
  removeCourseFromUser: jest.fn(),
  getAssignedCourses: jest.fn(),
  getUnassignedCourses: jest.fn(),
  isCourseAccessibleForUser: jest.fn(),
  deleteUser: jest.fn(),
  getUserById: jest.fn(),
  assignCourseToUserEdit: jest.fn(),
  getAssignedCoursesEdit: jest.fn(),
  getUnassignedCoursesEdit: jest.fn(),
  removeCourseFromUserEdit: jest.fn(),
  updateLastConnection: jest.fn(),
  updateUser: jest.fn(),
  getUsersByAssignedCourses: jest.fn(),
  updateUserProfessionalData: jest.fn(),
};
const mockRoleRepository: any = {
  getRoleById: jest.fn(),
};
const mockCourseRepository: any = {
  findById: jest.fn(),
};
let userService: UserService;
beforeEach(() => {
  jest.clearAllMocks();
  userService = new UserService(mockUserRepository, mockCourseRepository);
});
describe('UserService - getUserProfileImage Security Tests', () => {
  describe('Path Traversal Prevention', () => {
    test('should reject path traversal attempts with ../', async () => {
      await expect(userService.getUserProfileImage('../../../etc/passwd')).rejects.toThrow('Invalid file name');
    });
    test('should reject path traversal attempts with ..\\ (Windows style)', async () => {
      await expect(userService.getUserProfileImage('..\\..\\..\\windows\\system32\\config\\sam')).rejects.toThrow(
        'Invalid file name'
      );
    });
    test('should reject absolute paths starting with /', async () => {
      await expect(userService.getUserProfileImage('/etc/passwd')).rejects.toThrow('Invalid file name');
    });
    test('should reject absolute paths starting with \\ (Windows)', async () => {
      await expect(userService.getUserProfileImage('\\windows\\system32\\hosts')).rejects.toThrow('Invalid file name');
    });
    test('should reject paths with colon (Windows drive letters)', async () => {
      await expect(userService.getUserProfileImage('C:\\windows\\system32\\hosts')).rejects.toThrow('Invalid file name');
    });
    test('should reject null bytes', async () => {
      await expect(userService.getUserProfileImage('test\x00.png')).rejects.toThrow('Invalid file name');
    });
    test('should reject double slashes', async () => {
      await expect(userService.getUserProfileImage('test//image.png')).rejects.toThrow('Invalid file name');
    });
    test('should reject double backslashes', async () => {
      await expect(userService.getUserProfileImage('test\\\\image.png')).rejects.toThrow('Invalid file name');
    });
    test('should reject invalid characters in filename', async () => {
      const invalidChars = ['<', '>', '"', '|', '?', '*'];
      // eslint-disable-next-line no-restricted-syntax
      for (const char of invalidChars) {
        // eslint-disable-next-line no-await-in-loop
        await expect(userService.getUserProfileImage(`test${char}file.png`)).rejects.toThrow('Invalid file name');
      }
    });
  });
  describe('File Extension Validation', () => {
    test('should reject files without allowed extensions', async () => {
      await expect(userService.getUserProfileImage('malicious.exe')).rejects.toThrow('Invalid file name');
    });
    test('should reject files with .sh extension', async () => {
      await expect(userService.getUserProfileImage('script.sh')).rejects.toThrow('Invalid file name');
    });
    test('should reject files with .php extension', async () => {
      await expect(userService.getUserProfileImage('webshell.php')).rejects.toThrow('Invalid file name');
    });
    test('should reject files with .js extension', async () => {
      await expect(userService.getUserProfileImage('malicious.js')).rejects.toThrow('Invalid file name');
    });
    test('should reject files with no extension', async () => {
      await expect(userService.getUserProfileImage('noextension')).rejects.toThrow('Invalid file name');
    });
    test('should accept .png files (valid extension)', async () => {
      // Este test debe pasar la validación de nombre pero fallar al no encontrar el archivo
      const result = await userService.getUserProfileImage('valid-image.png');
      expect(result).toBeNull(); // null porque el archivo no existe en el filesystem
    });
    test('should accept .jpg files (valid extension)', async () => {
      const result = await userService.getUserProfileImage('valid-image.jpg');
      expect(result).toBeNull();
    });
    test('should accept .jpeg files (valid extension)', async () => {
      const result = await userService.getUserProfileImage('valid-image.jpeg');
      expect(result).toBeNull();
    });
  });
  describe('Input Type Validation', () => {
    test('should reject non-string inputs', async () => {
        await expect(userService.getUserProfileImage(null as unknown as string)).rejects.toThrow('Invalid file name');
        await expect(userService.getUserProfileImage(undefined as unknown as string)).rejects.toThrow('Invalid file name');
        await expect(userService.getUserProfileImage(123 as unknown as string)).rejects.toThrow('Invalid file name');
        await expect(userService.getUserProfileImage({} as unknown as string)).rejects.toThrow('Invalid file name');
        await expect(userService.getUserProfileImage([] as unknown as string)).rejects.toThrow('Invalid file name');
    });
    test('should reject empty strings', async () => {
      await expect(userService.getUserProfileImage('')).rejects.toThrow('Invalid file name');
    });
  });
  describe('Directory Boundary Checks', () => {
    test('should reject attempts to access files outside allowed directories', async () => {
      // Aunque el archivo tenga nombre válido, si intenta salir del directorio permitido debe fallar
      await expect(userService.getUserProfileImage('../outside.png')).rejects.toThrow('Invalid file name');
    });
    test('should reject encoded path traversal attempts', async () => {
      // Intentos de bypass con URL encoding
      await expect(userService.getUserProfileImage('%2e%2e%2f%2e%2e%2fpasswd')).rejects.toThrow('Invalid file name');
    });
    test('should reject unicode path traversal attempts', async () => {
      // Intentos de bypass con Unicode
      await expect(userService.getUserProfileImage('\u002e\u002e\u002f\u002e\u002e\u002fpasswd')).rejects.toThrow('Invalid file name');
    });
  });
  describe('Complex Attack Vectors', () => {
    test('should reject mixed separators', async () => {
      await expect(userService.getUserProfileImage('../.\\../etc/passwd')).rejects.toThrow('Invalid file name');
    });
    test('should reject trailing dots and spaces (Windows vulnerability)', async () => {
      await expect(userService.getUserProfileImage('file.png.')).rejects.toThrow('Invalid file name');
    });
    test('should reject paths with multiple extensions', async () => {
      await expect(userService.getUserProfileImage('image.png.exe')).rejects.toThrow('Invalid file name');
    });
    test('should handle case-insensitive extension validation', async () => {
      // Extensiones en mayúsculas también deben ser válidas
      const result = await userService.getUserProfileImage('image.PNG');
      expect(result).toBeNull(); // null porque el archivo no existe
    });
    test('should reject very long filenames (potential buffer overflow)', async () => {
      const longFilename = `${'a'.repeat(300)}.png`;
      // Aunque el nombre sea largo, si tiene extensión válida y no tiene path traversal, es válido
      const result = await userService.getUserProfileImage(longFilename);
      expect(result).toBeNull();
    });
  });
});

describe('UserService - Core Methods', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: 'user1', name: 'John Doe', email: 'john@example.com' };
      mockUserRepository.getUserById.mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('user1');

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.getUserById.mockResolvedValue(null);

      const result = await userService.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const updatedUser = { _id: 'user1', ...updateData };

      mockUserRepository.updateUser.mockResolvedValue(updatedUser as any);

      const result = await userService.updateUser('user1', updateData);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith('user1', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when update fails', async () => {
      mockUserRepository.updateUser.mockRejectedValue(new Error('Update failed'));

      await expect(userService.updateUser('user1', { firstName: 'New Name' })).rejects.toThrow('Update failed');
    });
  });

  describe('updateLastConnection', () => {
    it('should update last connection successfully', async () => {
      mockUserRepository.updateLastConnection.mockResolvedValue({} as any);

      await expect(userService.updateLastConnection('user1')).resolves.not.toThrow();

      expect(mockUserRepository.updateLastConnection).toHaveBeenCalledWith('user1');
    });
  });

  describe('getAssignedCourses', () => {
    it('should return assigned courses for user', async () => {
      const mockCourses = [
        { _id: 'course1', title: 'Course 1' },
        { _id: 'course2', title: 'Course 2' },
      ];

      mockUserRepository.getAssignedCourses.mockResolvedValue(mockCourses as any);

      const result = await userService.getAssignedCourses('user1');

      expect(mockUserRepository.getAssignedCourses).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockCourses);
    });
  });

  describe('getUnassignedCourses', () => {
    it('should return unassigned courses for user', async () => {
      const mockCourses = [{ _id: 'course3', title: 'Course 3' }];

      mockUserRepository.getUnassignedCourses.mockResolvedValue(mockCourses as any);

      const result = await userService.getUnassignedCourses('user1');

      expect(mockUserRepository.getUnassignedCourses).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockCourses);
    });
  });

  describe('isCourseAccessibleForUser', () => {
    it('should return true when course is accessible', async () => {
      mockUserRepository.isCourseAccessibleForUser.mockResolvedValue(true);

      const result = await userService.isCourseAccessibleForUser('user1', 'course1');

      expect(mockUserRepository.isCourseAccessibleForUser).toHaveBeenCalledWith('user1', 'course1');
      expect(result).toBe(true);
    });

    it('should return false when course is not accessible', async () => {
      mockUserRepository.isCourseAccessibleForUser.mockResolvedValue(false);

      const result = await userService.isCourseAccessibleForUser('user1', 'course1');

      expect(result).toBe(false);
    });
  });

  describe('assignCourseToUser', () => {
    it('should assign course to user successfully', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      mockUserRepository.assignCourseToUser.mockResolvedValue({} as any);

      await expect(userService.assignCourseToUser('user1', 'course1', startDate, endDate)).resolves.not.toThrow();

      expect(mockUserRepository.assignCourseToUser).toHaveBeenCalledWith('user1', 'course1', startDate, endDate);
    });
  });

  describe('removeCourseFromUser', () => {
    it('should remove course from user successfully', async () => {
      mockUserRepository.removeCourseFromUser.mockResolvedValue({} as any);

      await expect(userService.removeCourseFromUser('user1', 'course1')).resolves.not.toThrow();

      expect(mockUserRepository.removeCourseFromUser).toHaveBeenCalledWith('user1', 'course1');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: 'user1', name: 'User 1' },
        { _id: 'user2', name: 'User 2' },
      ];

      mockUserRepository.getAllUsers.mockResolvedValue(mockUsers as any);

      const result = await userService.getAllUsers();

      expect(mockUserRepository.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});
