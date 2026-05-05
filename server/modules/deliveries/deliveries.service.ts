import { DeliveryModel, IDelivery } from "./deliveries.model";
import { NotFoundError } from "../../core/errors";
import type { UpdateQuery } from "mongoose";

export class DeliveriesService {
  async getDeliveries(filter: Record<string, any> = {}) {
    return await DeliveryModel.find(filter)
      .populate("beneficiaryId")
      .populate("campaignId")
      .sort({ createdAt: -1 });
  }

  async getDeliveryById(id: string) {
    const delivery = await DeliveryModel.findById(id)
      .populate("beneficiaryId")
      .populate("campaignId");
    if (!delivery) throw new NotFoundError("التوصيل");
    return delivery;
  }

  async createDelivery(data: Partial<IDelivery>) {
    const delivery = new DeliveryModel(data);
    return await delivery.save();
  }

  async updateDelivery(id: string, data: UpdateQuery<IDelivery>) {
    const delivery = await DeliveryModel.findByIdAndUpdate(id, data, { new: true })
      .populate("beneficiaryId")
      .populate("campaignId");
    if (!delivery) throw new NotFoundError("التوصيل");
    return delivery;
  }

  async assignDeliveryPerson(id: string, deliveryPerson: string) {
    return await this.updateDelivery(id, {
      deliveryPerson,
      status: "in_progress",
    });
  }

  async confirmDelivery(id: string, notes?: string) {
    return await this.updateDelivery(id, {
      status: "completed",
      deliveredAt: new Date(),
      notes,
    });
  }

  async cancelDelivery(id: string, notes?: string) {
    return await this.updateDelivery(id, {
      status: "cancelled",
      notes,
    });
  }
}

export const deliveriesService = new DeliveriesService();
