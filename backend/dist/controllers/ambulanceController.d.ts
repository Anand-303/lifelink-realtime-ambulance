import { Request, Response } from 'express';
/**
 * Get all ambulances
 * @route GET /api/ambulance
 * @access Private/Admin
 */
export declare const getAmbulances: (req: Request, res: Response) => Promise<void>;
/**
 * Get ambulance by ID
 * @route GET /api/ambulance/:id
 * @access Private
 */
export declare const getAmbulanceById: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new ambulance
 * @route POST /api/ambulance
 * @access Private/Admin
 */
export declare const createAmbulance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update ambulance location
 * @route PUT /api/ambulance/:id/location
 * @access Private
 */
export declare const updateAmbulanceLocation: (req: Request, res: Response) => Promise<void>;
/**
 * Update ambulance status
 * @route PUT /api/ambulance/:id/status
 * @access Private/Admin
 */
export declare const updateAmbulanceStatus: (req: Request, res: Response) => Promise<void>;
/**
 * Request an ambulance
 * @route POST /api/ambulance/request
 * @access Private
 */
export declare const requestAmbulance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get ambulance request by ID
 * @route GET /api/ambulance/request/:id
 * @access Private
 */
export declare const getAmbulanceRequestById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update ambulance request status
 * @route PUT /api/ambulance/request/:id/status
 * @access Private
 */
export declare const updateAmbulanceRequestStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get user's ambulance requests
 * @route GET /api/ambulance/request/user
 * @access Private
 */
export declare const getUserAmbulanceRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get all ambulance requests (Admin only)
 * @route GET /api/ambulance/request/all
 * @access Private/Admin
 */
export declare const getAllAmbulanceRequests: (req: Request, res: Response) => Promise<void>;
/**
 * Allocate a specific ambulance to a request (Admin)
 * @route PUT /api/ambulance/request/:id/allocate
 * @access Private/Admin
 */
export declare const allocateAmbulanceToRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Delete an ambulance (Admin only)
 * @route DELETE /api/ambulance/:id
 * @access Private/Admin
 */
export declare const deleteAmbulance: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ambulanceController.d.ts.map