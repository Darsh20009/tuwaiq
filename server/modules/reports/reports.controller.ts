import { Request, Response } from "express";
import { reportsService } from "./reports.service";
import { handleError } from "../../core/errors";

export class ReportsController {
  async getDailyDonations(req: Request, res: Response) {
    try {
      const date = req.query.date as string;
      const data = await reportsService.getDailyDonations(date);
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getMonthlyDonations(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
      const data = await reportsService.getMonthlyDonations(year, month);
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getCampaignPerformance(req: Request, res: Response) {
    try {
      const data = await reportsService.getCampaignPerformance();
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getTopDonors(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await reportsService.getTopDonors(limit);
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getRepeatDonors(req: Request, res: Response) {
    try {
      const data = await reportsService.getRepeatDonors();
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getDonorRetention(req: Request, res: Response) {
    try {
      const data = await reportsService.getDonorRetention();
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getDeletedDonations(req: Request, res: Response) {
    try {
      const data = await reportsService.getDeletedDonations();
      res.json({ success: true, data });
    } catch (error) {
      handleError(error, res);
    }
  }
}

export const reportsController = new ReportsController();
