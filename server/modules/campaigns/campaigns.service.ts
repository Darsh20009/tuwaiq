import { CampaignModel, ICampaign } from "./campaigns.model";
import { InsertCampaign } from "@shared/schema";
import { NotFoundError } from "../../core/errors";

export class CampaignsService {
  async getCampaigns(filter: any = {}): Promise<ICampaign[]> {
    return await CampaignModel.find(filter).sort({ createdAt: -1 });
  }

  async getActiveCampaigns(): Promise<ICampaign[]> {
    return await CampaignModel.find({ status: "active" }).sort({ createdAt: -1 });
  }

  async getCampaignById(id: string): Promise<ICampaign> {
    const campaign = await CampaignModel.findById(id);
    if (!campaign) {
      throw new NotFoundError("الحملة");
    }
    return campaign;
  }

  async createCampaign(data: InsertCampaign, userId: string): Promise<ICampaign> {
    const campaign = new CampaignModel({
      ...data,
      createdBy: userId,
    });
    return await campaign.save();
  }

  async updateCampaign(id: string, data: Partial<InsertCampaign>): Promise<ICampaign> {
    const campaign = await CampaignModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!campaign) {
      throw new NotFoundError("الحملة");
    }
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    const result = await CampaignModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError("الحملة");
    }
  }

  async updateProgress(id: string, amount: number): Promise<ICampaign> {
    const campaign = await CampaignModel.findByIdAndUpdate(
      id,
      { $inc: { currentAmount: amount } },
      { new: true }
    );
    if (!campaign) {
      throw new NotFoundError("الحملة");
    }
    
    // Check if goal reached
    if (campaign.currentAmount >= campaign.goalAmount && campaign.status === "active") {
      campaign.status = "completed";
      await campaign.save();
    }
    
    return campaign;
  }
}

export const campaignsService = new CampaignsService();
