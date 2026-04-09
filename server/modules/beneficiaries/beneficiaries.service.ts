import { BeneficiaryModel, IBeneficiary } from "./beneficiaries.model";
import { NotFoundError } from "../../core/errors";

export class BeneficiariesService {
  async getBeneficiaries() {
    return await BeneficiaryModel.find().sort({ createdAt: -1 });
  }

  async getBeneficiaryById(id: string) {
    const beneficiary = await BeneficiaryModel.findById(id);
    if (!beneficiary) {
      throw new NotFoundError("المستفيد");
    }
    return beneficiary;
  }

  async createBeneficiary(data: Partial<IBeneficiary>) {
    const beneficiary = new BeneficiaryModel(data);
    return await beneficiary.save();
  }

  async updateBeneficiary(id: string, data: Partial<IBeneficiary>) {
    const beneficiary = await BeneficiaryModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!beneficiary) {
      throw new NotFoundError("المستفيد");
    }
    return beneficiary;
  }

  async deleteBeneficiary(id: string) {
    const beneficiary = await BeneficiaryModel.findByIdAndDelete(id);
    if (!beneficiary) {
      throw new NotFoundError("المستفيد");
    }
    return beneficiary;
  }

  async updateBeneficiaryStatus(id: string, status: string) {
    const beneficiary = await BeneficiaryModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!beneficiary) {
      throw new NotFoundError("المستفيد");
    }
    return beneficiary;
  }
}

export const beneficiariesService = new BeneficiariesService();
