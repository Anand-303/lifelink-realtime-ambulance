import { Request, Response } from 'express';
/**
 * Register as a blood donor
 * @route PUT /api/blood-donation/register-donor
 * @access Private
 */
export declare const registerAsDonor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get all blood donors
 * @route GET /api/blood-donation/donors
 * @access Private
 */
export declare const getDonors: (req: Request, res: Response) => Promise<void>;
/**
 * Record a blood donation
 * @route POST /api/blood-donation
 * @access Private
 */
export declare const recordBloodDonation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get blood inventory
 * @route GET /api/blood-donation/inventory
 * @access Private
 */
export declare const getBloodInventory: (req: Request, res: Response) => Promise<void>;
/**
 * Request blood
 * @route POST /api/blood-donation/request
 * @access Private
 */
export declare const requestBlood: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get blood request by ID
 * @route GET /api/blood-donation/request/:id
 * @access Private
 */
export declare const getBloodRequestById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get user's blood requests
 * @route GET /api/blood-donation/request/user
 * @access Private
 */
export declare const getUserBloodRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update blood request status
 * @route PUT /api/blood-donation/request/:id/status
 * @access Private/Admin
 */
export declare const updateBloodRequestStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get all blood requests (Admin only)
 * @route GET /api/blood-donation/request/all
 * @access Private/Admin
 */
export declare const getAllBloodRequests: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=bloodDonationController.d.ts.map