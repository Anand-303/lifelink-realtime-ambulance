import { Request, Response } from 'express';
/**
 * Get all campaigns
 * @route GET /api/campaigns
 * @access Public
 */
export declare const getCampaigns: (req: Request, res: Response) => Promise<void>;
/**
 * Get campaign by ID
 * @route GET /api/campaigns/:id
 * @access Public
 */
export declare const getCampaignById: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new campaign
 * @route POST /api/campaigns
 * @access Private/Admin
 */
export declare const createCampaign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Update a campaign
 * @route PUT /api/campaigns/:id
 * @access Private/Admin
 */
export declare const updateCampaign: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a campaign
 * @route DELETE /api/campaigns/:id
 * @access Private/Admin
 */
export declare const deleteCampaign: (req: Request, res: Response) => Promise<void>;
/**
 * Register for a campaign
 * @route POST /api/campaigns/:id/register
 * @access Private
 */
export declare const registerForCampaign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Unregister from a campaign
 * @route DELETE /api/campaigns/:id/register
 * @access Private
 */
export declare const unregisterFromCampaign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=campaignController.d.ts.map