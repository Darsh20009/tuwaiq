import { Request, Response } from "express";
import { deliveriesService } from "./deliveries.service";
import { handleError, ValidationError } from "../../core/errors";
import { insertDeliverySchema } from "@shared/schema";

export class DeliveriesController {
  async getDeliveries(req: Request, res: Response) {
    try {
      const { status, beneficiaryId, campaignId, deliveryPerson } = req.query;
      const filter: any = {};
      if (status) filter.status = status;
      if (beneficiaryId) filter.beneficiaryId = beneficiaryId;
      if (campaignId) filter.campaignId = campaignId;
      if (deliveryPerson) filter.deliveryPerson = deliveryPerson;

      const deliveries = await deliveriesService.getDeliveries(filter);
      res.json({ success: true, data: deliveries });
    } catch (err) {
      handleError(err, res);
    }
  }

  async getDeliveryById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const delivery = await deliveriesService.getDeliveryById(id);
      res.json({ success: true, data: delivery });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async createDelivery(req: Request, res: Response) {
    try {
      const validatedData = insertDeliverySchema.parse(req.body);
      const delivery = await deliveriesService.createDelivery(validatedData as any);
      res.status(201).json({ success: true, data: delivery });
    } catch (err: any) {
      if (err.name === "ZodError") {
        return handleError(new ValidationError(err.errors[0].message), res);
      }
      handleError(err, res);
    }
  }

  async updateDelivery(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const delivery = await deliveriesService.updateDelivery(id, req.body);
      res.json({ success: true, data: delivery });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async assignDeliveryPerson(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { deliveryPerson } = req.body;
      if (!deliveryPerson) throw new ValidationError("اسم الشخص المكلف بالتوصيل مطلوب");
      const delivery = await deliveriesService.assignDeliveryPerson(id, deliveryPerson);
      res.json({ success: true, data: delivery });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async confirmDelivery(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { notes } = req.body;
      const delivery = await deliveriesService.confirmDelivery(id, notes);
      res.json({ success: true, data: delivery });
    } catch (err: any) {
      handleError(err, res);
    }
  }
}

export const deliveriesController = new DeliveriesController();
