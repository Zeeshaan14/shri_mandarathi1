import type { Request, Response } from "express";
export declare const createOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=order.controller.d.ts.map