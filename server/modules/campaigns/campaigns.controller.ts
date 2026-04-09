import { Request, Response } from "express";
import { campaignsService } from "./campaigns.service";
import { insertCampaignSchema } from "@shared/schema";
import { handleError, ValidationError } from "../../core/errors";
import { ZodError } from "zod";

export class CampaignsController {
  async getCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const filter = status ? { status: status as string } : {};
      const campaigns = await campaignsService.getCampaigns(filter);
      res.json({ success: true, data: campaigns });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getActiveCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const campaigns = await campaignsService.getActiveCampaigns();
      res.json({ success: true, data: campaigns });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getCampaignById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const campaign = await campaignsService.getCampaignById(id);
      res.json({ success: true, data: campaign });
    } catch (error) {
      handleError(error, res);
    }
  }

  async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const currentUser = (req as any).currentUser;
      const campaign = await campaignsService.createCampaign(validatedData, currentUser.userId);
      res.status(201).json({ success: true, data: campaign });
    } catch (error: any) {
      if (error instanceof ZodError) {
        handleError(new ValidationError("بيانات الحملة غير صالحة"), res);
      } else {
        handleError(error, res);
      }
    }
  }

  async updateCampaign(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = insertCampaignSchema.partial().parse(req.body);
      const campaign = await campaignsService.updateCampaign(id, validatedData);
      res.json({ success: true, data: campaign });
    } catch (error: any) {
      if (error instanceof ZodError) {
        handleError(new ValidationError("بيانات الحملة غير صالحة"), res);
      } else {
        handleError(error, res);
      }
    }
  }

  async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await campaignsService.deleteCampaign(id);
      res.json({ success: true, message: "تم حذف الحملة بنجاح" });
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const campaignsController = new CampaignsController();
