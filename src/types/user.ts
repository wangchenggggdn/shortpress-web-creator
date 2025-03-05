/**
 * Interface for user login state
 */
export interface IUserLoginState {
    /** JWT access token */
    accessToken: string;
    /** User's name */
    name: string;
    /** User's avatar URL */
    avatar: string;
    /** User's email address */
    email: string;
}


// User role enum
/**
 * Enum for user roles
 */
export enum UserRole {
    /** Administrator role */
    ADMIN = 0,
    /** Regular user role */
    OTHER = 1
}

// User status enum
/**
 * Enum for user status
 */
export enum UserStatus {
    /** User account is inactive */
    INACTIVE = 0,
    /** User account is active */
    ACTIVE = 1,
    /** User account is disabled */
    DISABLED = 2,
    /** User account is deleted */
    DELETED = 3
}

// User type enum
/**
 * Enum for user types
 */
export enum UserType {
    /** Email-based user */
    EMAIL = 0
}

// Base user interface
/**
 * Interface for user profile information
 */
export interface IUserProfile {
    /** Unique creator identifier */
    creatorId: string;
    /** Creator's unique name */
    creatorName: string;
    /** Default site domain */
    defultSiteDomain?: string;
    /** User's display name */
    nickname: string;
    /** User's avatar URL */
    avatarUrl: string;
    /** User's email address */
    email: string;
    /** User type */
    type: UserType;
    /** User role */
    role: UserRole;
    /** User status */
    status: UserStatus;
    /** Account creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
    /** Last login timestamp */
    lastLoginAt: string;
}

// Verify token type enum
/**
 * Enum for token verification types
 */
export enum VerifyTokenType {
    /** Login verification */
    LOGIN = 1,
    /** Password reset verification */
    RESET_PASSWORD = 2
}

/**
 * Interface for user statistics
 */
export interface IUserStats {
    /** Number of playlists created */
    playlistCount: number;
    /** Number of videos uploaded */
    videoCount: number;
    /** Number of sites created */
    siteCount: number;
}

