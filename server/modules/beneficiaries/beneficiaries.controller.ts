import { Request, Response } from "express";
import { beneficiariesService } from "./beneficiaries.service";
import { handleError } from "../../core/errors";

export class BeneficiariesController {
  async getBeneficiaries(req: Request, res: Response) {
    try {
      const beneficiaries = await beneficiariesService.getBeneficiaries();
      res.json({ success: true, data: beneficiaries });
    } catch (err) {
      handleError(err, res);
    }
  }

  async getBeneficiaryById(req: Request, res: Response) {
    try {
      const beneficiary = await beneficiariesService.getBeneficiaryById(req.params.id as string);
      res.json({ success: true, data: beneficiary });
    } catch (err) {
      handleError(err, res);
    }
  }

  async createBeneficiary(req: Request, res: Response) {
    try {
      const beneficiary = await beneficiariesService.createBeneficiary(req.body);
      res.status(201).json({ success: true, data: beneficiary });
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateBeneficiary(req: Request, res: Response) {
    try {
      const beneficiary = await beneficiariesService.updateBeneficiary(req.params.id as string, req.body);
      res.json({ success: true, data: beneficiary });
    } catch (err) {
      handleError(err, res);
    }
  }

  async deleteBeneficiary(req: Request, res: Response) {
    try {
      await beneficiariesService.deleteBeneficiary(req.params.id as string);
      res.json({ success: true, message: "تم حذف المستفيد بنجاح" });
    } catch (err) {
      handleError(err, res);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const beneficiary = await beneficiariesService.updateBeneficiaryStatus(req.params.id as string, req.body.status);
      res.json({ success: true, data: beneficiary });
    } catch (err) {
      handleError(err, res);
    }
  }
}

export const beneficiariesController = new BeneficiariesController();
