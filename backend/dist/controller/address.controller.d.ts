import type { Request, Response } from "express";
export declare const listAddresses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAddress: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=address.controller.d.ts.map