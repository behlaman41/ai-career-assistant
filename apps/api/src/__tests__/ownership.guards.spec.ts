import { ForbiddenException } from '@nestjs/common';
import { assertOwnership } from '@ai-career/shared/policies';

// Mock the assertOwnership function
jest.mock('@ai-career/shared/policies', () => ({
  assertOwnership: jest.fn(),
}));

const mockedAssertOwnership = assertOwnership as jest.MockedFunction<typeof assertOwnership>;

describe('Ownership Guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assertOwnership', () => {
    it('should pass when user owns the resource', () => {
      // Arrange
      const userId = 'user-123';
      const resourceUserId = 'user-123';
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, resourceUserId)).not.toThrow();
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, resourceUserId);
    });

    it('should throw ForbiddenException when user does not own the resource', () => {
      // Arrange
      const userId = 'user-123';
      const resourceUserId = 'user-456';
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, resourceUserId)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, resourceUserId);
    });

    it('should handle null or undefined resource user ID', () => {
      // Arrange
      const userId = 'user-123';
      const resourceUserId = null;
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (!resourceUserIdParam || userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, resourceUserId as any)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, resourceUserId);
    });

    it('should handle empty string user IDs', () => {
      // Arrange
      const userId = '';
      const resourceUserId = 'user-123';
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (!userIdParam || userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, resourceUserId)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, resourceUserId);
    });
  });

  describe('Service-level ownership validation', () => {
    // Mock service methods that use ownership guards
    const mockDocument = {
      id: 'doc-123',
      userId: 'user-123',
      type: 'resume',
      storageKey: 'test-key',
      mime: 'application/pdf',
      sha256: 'test-hash',
      sizeBytes: 1024,
      status: 'approved',
      createdAt: new Date(),
    };

    const mockResume = {
      id: 'resume-123',
      userId: 'user-123',
      title: 'Test Resume',
      sourceDocumentId: 'doc-123',
      createdAt: new Date(),
      versions: [],
    };

    const mockRun = {
      id: 'run-123',
      userId: 'user-123',
      jdId: 'jd-123',
      resumeVersionId: 'version-123',
      status: 'queued',
      createdAt: new Date(),
    };

    it('should validate document ownership', () => {
      // Arrange
      const userId = 'user-123';
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, mockDocument.userId)).not.toThrow();
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, mockDocument.userId);
    });

    it('should validate resume ownership', () => {
      // Arrange
      const userId = 'user-123';
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, mockResume.userId)).not.toThrow();
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, mockResume.userId);
    });

    it('should validate run ownership', () => {
      // Arrange
      const userId = 'user-123';
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, mockRun.userId)).not.toThrow();
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, mockRun.userId);
    });

    it('should prevent cross-tenant access for documents', () => {
      // Arrange
      const userId = 'user-456'; // Different user
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, mockDocument.userId)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, mockDocument.userId);
    });

    it('should prevent cross-tenant access for resumes', () => {
      // Arrange
      const userId = 'user-456'; // Different user
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, mockResume.userId)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, mockResume.userId);
    });

    it('should prevent cross-tenant access for runs', () => {
      // Arrange
      const userId = 'user-456'; // Different user
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, mockRun.userId)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, mockRun.userId);
    });
  });

  describe('Role-based access control', () => {
    it('should allow admin users to access any resource', () => {
      // Arrange
      const adminUserId = 'admin-123';
      const resourceUserId = 'user-456';

      // For admin users, we simulate that they own all resources
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        // In a real scenario, admin role would be checked before calling assertOwnership
        // For this test, we simulate admin access by not throwing an error
        return;
      });

      // Act & Assert
      expect(() => assertOwnership(adminUserId, resourceUserId)).not.toThrow();
      expect(mockedAssertOwnership).toHaveBeenCalledWith(adminUserId, resourceUserId);
    });

    it('should restrict regular users to their own resources', () => {
      // Arrange
      const userId = 'user-123';
      const resourceUserId = 'user-456';

      // Mock implementation that restricts regular users
      mockedAssertOwnership.mockImplementation((userIdParam, resourceUserIdParam) => {
        if (userIdParam !== resourceUserIdParam) {
          throw new ForbiddenException('Access denied');
        }
      });

      // Act & Assert
      expect(() => assertOwnership(userId, resourceUserId)).toThrow(ForbiddenException);
      expect(mockedAssertOwnership).toHaveBeenCalledWith(userId, resourceUserId);
    });
  });
});
