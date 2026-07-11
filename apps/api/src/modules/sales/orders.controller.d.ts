import { OnlineOrderService } from './online-order.service';
export declare class OrdersController {
    private readonly onlineOrderService;
    constructor(onlineOrderService: OnlineOrderService);
    findAll(page?: number, limit?: number, search?: string, status?: string): Promise<{
        data: import("./entities/online-order.entity").OnlineOrder[];
        total: number;
    }>;
    findById(id: string): Promise<import("./entities/online-order.entity").OnlineOrder>;
    updateStatus(id: string, status: string): Promise<import("./entities/online-order.entity").OnlineOrder>;
    cancelOrder(id: string): Promise<import("./entities/online-order.entity").OnlineOrder>;
}
//# sourceMappingURL=orders.controller.d.ts.map