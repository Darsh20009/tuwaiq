import { DonationModel, CampaignModel, UserModel } from "../../models";
import mongoose from "mongoose";

export class ReportsService {
  async getDailyDonations(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return await DonationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: "confirmed",
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getMonthlyDonations(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return await DonationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: "confirmed",
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getCampaignPerformance() {
    return await CampaignModel.aggregate([
      {
        $lookup: {
          from: "donations",
          let: { campaignId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$campaignId", "$$campaignId"] },
                    { $eq: ["$paymentStatus", "confirmed"] },
                    { $ne: ["$isDeleted", true] },
                  ],
                },
              },
            },
          ],
          as: "donations",
        },
      },
      {
        $project: {
          title: 1,
          titleAr: 1,
          goalAmount: 1,
          currentAmount: 1,
          donationCount: { $size: "$donations" },
          totalDonated: { $sum: "$donations.amount" },
          percentageReached: {
            $cond: [
              { $gt: ["$goalAmount", 0] },
              { $multiply: [{ $divide: ["$currentAmount", "$goalAmount"] }, 100] },
              0,
            ],
          },
        },
      },
    ]);
  }

  async getTopDonors(limit: number = 10) {
    return await UserModel.find({ role: "donor" })
      .sort({ totalDonations: -1 })
      .limit(limit)
      .select("name email mobile totalDonations donationCount level");
  }

  async getRepeatDonors() {
    return await UserModel.find({
      role: "donor",
      donationCount: { $gt: 1 },
    })
      .sort({ donationCount: -1 })
      .select("name email mobile totalDonations donationCount");
  }

  async getDonorRetention() {
    // Basic retention: percentage of donors with > 1 donation
    const totalDonors = await UserModel.countDocuments({ role: "donor" });
    const repeatDonors = await UserModel.countDocuments({
      role: "donor",
      donationCount: { $gt: 1 },
    });

    return {
      totalDonors,
      repeatDonors,
      retentionRate: totalDonors > 0 ? (repeatDonors / totalDonors) * 100 : 0,
    };
  }

  async getDeletedDonations() {
    return await DonationModel.find({ isDeleted: true })
      .populate("donorId", "name email")
      .populate("campaignId", "title")
      .sort({ updatedAt: -1 });
  }
}

export const reportsService = new ReportsService();
