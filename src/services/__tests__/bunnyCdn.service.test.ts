/* eslint-env jest */

// Mock the config before importing the service
jest.mock('@/config/bunny.config', () => ({
  __esModule: true,
  default: {
    storage: {
      cdnHostname: 'https://test-storage.b-cdn.net',
      enabled: true,
    },
    stream: {
      cdnHostname: 'https://test-stream.b-cdn.net',
      enabled: true,
    },
  },
  isBunnyEnabled: true,
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
}));

import BunnyCdnService from '../bunnyCdn.service';

describe('BunnyCdnService', () => {
  let service: BunnyCdnService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    service = new BunnyCdnService();
  });

  describe('isEnabled', () => {
    it('should return true when Bunny is enabled', () => {
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('getImageUrl', () => {
    it('should return success result with correct CDN URL', () => {
      const result = service.getImageUrl('test-image.jpg', 'images');

      expect(result.success).toBe(true);
      expect(result.cdnUrl).toBe('https://test-storage.b-cdn.net/images/test-image.jpg');
      expect(result.error).toBeUndefined();
    });

    it('should use default folder when not specified', () => {
      const result = service.getImageUrl('test-image.jpg');

      expect(result.success).toBe(true);
      expect(result.cdnUrl).toBe('https://test-storage.b-cdn.net/images/test-image.jpg');
    });

    it('should handle different folders', () => {
      const result = service.getImageUrl('course-image.jpg', 'courses');

      expect(result.success).toBe(true);
      expect(result.cdnUrl).toBe('https://test-storage.b-cdn.net/courses/course-image.jpg');
    });
  });

  describe('getVideoPlaylistUrl', () => {
    it('should return success result with correct playlist URL', () => {
      const result = service.getVideoPlaylistUrl('video-guid-123');

      expect(result.success).toBe(true);
      expect(result.cdnUrl).toBe('https://test-stream.b-cdn.net/video-guid-123/playlist.m3u8');
      expect(result.error).toBeUndefined();
    });
  });

  describe('getVideoThumbnailUrl', () => {
    it('should return success result with correct thumbnail URL', () => {
      const result = service.getVideoThumbnailUrl('video-guid-123');

      expect(result.success).toBe(true);
      expect(result.cdnUrl).toBe('https://test-stream.b-cdn.net/video-guid-123/thumbnail.jpg');
      expect(result.error).toBeUndefined();
    });
  });

  describe('extractFileNameFromCdnUrl', () => {
    it('should extract filename from storage CDN URL', () => {
      const cdnUrl = 'https://test-storage.b-cdn.net/images/test-image.jpg';
      const result = service.extractFileNameFromCdnUrl(cdnUrl);

      expect(result).toBe('test-image.jpg');
    });

    it('should extract filename from nested path', () => {
      const cdnUrl = 'https://test-storage.b-cdn.net/courses/videos/lesson1.mp4';
      const result = service.extractFileNameFromCdnUrl(cdnUrl);

      expect(result).toBe('lesson1.mp4');
    });

    it('should return null for non-Bunny CDN URLs', () => {
      const cdnUrl = 'https://other-cdn.com/images/test.jpg';
      const result = service.extractFileNameFromCdnUrl(cdnUrl);

      expect(result).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      const result = service.extractFileNameFromCdnUrl('invalid-url');

      expect(result).toBeNull();
    });
  });

  describe('isBunnyCdnUrl', () => {
    it('should return true for storage CDN URLs', () => {
      const url = 'https://test-storage.b-cdn.net/images/test.jpg';
      expect(service.isBunnyCdnUrl(url)).toBe(true);
    });

    it('should return true for stream CDN URLs', () => {
      const url = 'https://test-stream.b-cdn.net/video-guid/playlist.m3u8';
      expect(service.isBunnyCdnUrl(url)).toBe(true);
    });

    it('should return false for non-Bunny URLs', () => {
      const url = 'https://other-cdn.com/test.jpg';
      expect(service.isBunnyCdnUrl(url)).toBe(false);
    });
  });

  describe('getStorageCdnBaseUrl', () => {
    it('should return the storage CDN base URL', () => {
      expect(service.getStorageCdnBaseUrl()).toBe('https://test-storage.b-cdn.net');
    });
  });

  describe('getStreamCdnBaseUrl', () => {
    it('should return the stream CDN base URL', () => {
      expect(service.getStreamCdnBaseUrl()).toBe('https://test-stream.b-cdn.net');
    });
  });
});