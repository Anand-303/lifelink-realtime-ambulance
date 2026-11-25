import { Request, Response } from 'express';
/**
 * @route   GET /api/blood-inventory
 * @desc    Get all blood inventory with all blood groups represented
 * @access  Private/Admin
 */
export declare const getBloodInventory: (req: Request, res: Response) => Promise<void>;
/**
 * @route   PUT /api/blood-inventory/:bloodGroup
 * @desc    Update blood inventory for a specific blood group
 * @access  Private/Admin
 */
export declare const updateBloodInventory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @route   DELETE /api/blood-inventory/:bloodGroup
 * @desc    Delete blood inventory (set units to 0)
 * @access  Private/Admin
 */
export declare const deleteBloodInventory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * @route   POST /api/blood-inventory/initialize
 * @desc    Initialize all blood groups with zero units
 * @access  Private/Admin
 */
export declare const initializeBloodInventory: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=bloodInventoryController.d.ts.map