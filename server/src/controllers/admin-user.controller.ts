import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/app-error.js";
import { createUser, getUserById, listUsers, updateUser, updateUserPassword, updateUserStatus, countActiveAdmins, deleteUser } from "../services/user.service.js";
import { createAuditLog } from "../services/audit.service.js";

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
    await createAuditLog({ req, action: "CREATE", resource: "USER", resourceId: user._id, description: `Created user "${user.name}" (${user.email})` });

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
    const previousUser = await getUserById(req.params.id);
    const user = await updateUser(req.params.id, req.body);
    if (!user) {
      throw new AppError("[user] User not found", 404);
    }
    if (req.body.role && previousUser && req.body.role !== previousUser.role) {
      await createAuditLog({
        req,
        action: "UPDATE",
        resource: "USER",
        resourceId: user._id,
        description: `Changed role of user "${user.name}" from "${previousUser.role}" to "${user.role}"`,
      });
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

  if (!req.body.isActive) {
    const targetUser = await getUserById(targetUserId);
    if (targetUser?.role === "ADMIN" && targetUser.isActive) {
      const remainingActiveAdmins = await countActiveAdmins(targetUserId);
      if (remainingActiveAdmins === 0) {
        throw new AppError("[user] Cannot deactivate the last active administrator", 400);
      }
    }
  }

  const user = await updateUserStatus( targetUserId, req.body,);

  if (!user) {
    throw new AppError("[user] User not found", 404);
  }

  await createAuditLog({ req, action: "STATUS_CHANGE", resource: "USER", resourceId: user._id, description: `${req.body.isActive ? "Activated" : "Deactivated"} user "${user.name}" (${user.email})` });

  res.status(200).json({ success: true,  message: "[user] User status updated successfully", data: user });
}

export async function deleteAdminUser( req: AuthenticatedRequest & {params: {id: string}}, res: Response ): Promise<void> {
  const targetUserId = req.params.id;

  if (req.user?.userId === targetUserId) {
    throw new AppError("[user] You cannot delete your own account", 400);
  }

  const targetUser = await getUserById(targetUserId);
  if (!targetUser) {
    throw new AppError("[user] User not found", 404);
  }

  if (targetUser.role === "ADMIN" && targetUser.isActive) {
    const remainingActiveAdmins = await countActiveAdmins(targetUserId);
    if (remainingActiveAdmins === 0) {
      throw new AppError("[user] Cannot delete the last active administrator", 400);
    }
  }

  await deleteUser(targetUserId);

  await createAuditLog({ req, action: "DELETE", resource: "USER", resourceId: targetUserId, description: `Deleted user "${targetUser.name}" (${targetUser.email})` });

  res.status(200).json({ success: true, message: "[user] User deleted successfully" });
}

export async function updateAdminUserPassword( req: AuthenticatedRequest & {params: {id: string}}, res: Response ): Promise<void> {
  const user = await updateUserPassword( req.params.id,req.body );

  if (!user) {
    throw new AppError("[user] User not found", 404);
  }
  await createAuditLog({ req, action: "PASSWORD_CHANGE", resource: "USER", resourceId: user._id, description: `Changed password for user "${user.name}"` });
  res.status(200).json({ success: true, message: "[user] User password updated successfully", data: user});
}