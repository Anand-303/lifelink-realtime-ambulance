import { Request, Response } from 'express';
/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
export declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export declare const getUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
export declare const updateUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map