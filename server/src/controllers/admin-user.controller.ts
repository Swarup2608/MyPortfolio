import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/app-error.js";
import { createUser, getUserById, listUsers, updateUser, updateUserPassword, updateUserStatus } from "../services/user.service.js";

export async function getUsersController(_req: AuthenticatedRequest, res: Response): Promise<void>{
    const users = await listUsers();
    res.status(200).json({success:true, data: users});
}

export async function getUserByIDController(_req: AuthenticatedRequest & {params: {id: string}},res: Response) : Promise<void>{
    const user = await getUserById(_req.params.id);
    if(!user){
        throw new AppError("[user] User not found",404);
    }
    res.status(200).json({success: true, data: user});
}

export async function createAdminUser(req: AuthenticatedRequest,res: Response ): Promise<void> {
  try {
    const user = await createUser(req.body);

    res.status(201).json({ success: true, message: "[user] User created successfully", data: user, });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      throw new AppError("[user] A user with this email already exists", 409);
    }

    throw error;
  }
}

export async function updateAdminUser( req: AuthenticatedRequest & {params: {id: string}},  res: Response ): Promise<void> {
  try {
    const user = await updateUser(req.params.id, req.body);
    if (!user) {
      throw new AppError("[user] User not found", 404);
    }
    res.status(200).json({
      success: true, message: "[user] User updated successfully", data: user, });
    } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      throw new AppError("[user] A user with this email already exists", 409);
    }
    throw error;
  }
}

export async function updateAdminUserStatus( req: AuthenticatedRequest & {params: {id: string}}, res: Response ): Promise<void> {
  const targetUserId = req.params.id;
  // Prevent an admin from disabling themselves.
  if (req.user?.userId === targetUserId && !req.body.isActive) {
    throw new AppError("[User] You cannot deactivate your own account", 400);
  }
  const user = await updateUserStatus( targetUserId, req.body,);

  if (!user) {
    throw new AppError("[user] User not found", 404);
  }

  res.status(200).json({ success: true,  message: "[user] User status updated successfully", data: user });
}

export async function updateAdminUserPassword( req: AuthenticatedRequest & {params: {id: string}}, res: Response ): Promise<void> {
  const user = await updateUserPassword( req.params.id,req.body );

  if (!user) {
    throw new AppError("[user] User not found", 404);
  }
  res.status(200).json({ success: true, message: "[user] User password updated successfully", data: user});
}