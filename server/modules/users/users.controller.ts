import { Request, Response } from "express";
import * as usersService from "./users.service";
import { handleError } from "../../core/errors";
import { insertUserSchema, userSchema } from "@shared/schema";

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await usersService.getUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const user = await usersService.getUserById(id);
    res.json({ success: true, data: user });
  } catch (err) {
    handleError(err, res);
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const user = await usersService.createUser(validatedData);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    handleError(err, res);
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const validatedData = userSchema.partial().parse(req.body);
    const user = await usersService.updateUser(id, validatedData);
    res.json({ success: true, data: user });
  } catch (err) {
    handleError(err, res);
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await usersService.deleteUser(id);
    res.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    handleError(err, res);
  }
}

export async function toggleUserStatus(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const user = await usersService.toggleUserStatus(id);
    res.json({ success: true, data: user });
  } catch (err) {
    handleError(err, res);
  }
}
