import { User } from "./users.model";
import { NotFoundError } from "../../core/errors";
import { InsertUser, User as UserType } from "@shared/schema";

export async function getUsers() {
  return await User.find().sort({ createdAt: -1 });
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError("المستخدم");
  }
  return user;
}

export async function createUser(userData: InsertUser) {
  const user = new User(userData);
  return await user.save();
}

export async function updateUser(id: string, updateData: Partial<UserType>) {
  const user = await User.findByIdAndUpdate(id, updateData, { new: true });
  if (!user) {
    throw new NotFoundError("المستخدم");
  }
  return user;
}

export async function deleteUser(id: string) {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new NotFoundError("المستخدم");
  }
  return user;
}

export async function updateUserRole(id: string, role: string) {
  return await updateUser(id, { role } as any);
}

export async function toggleUserStatus(id: string) {
  const user = await getUserById(id);
  const newStatus = user.status === "active" ? "inactive" : "active";
  return await updateUser(id, { status: newStatus } as any);
}
