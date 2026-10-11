import { Schema, model, type Document, type Types } from "mongoose";

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "PUBLISH",
  "LOGIN",
  "LOGOUT",
  "STATUS_CHANGE",
  "PASSWORD_CHANGE",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;

  userName?: string;
  userEmail?: string;

  action: AuditAction;

  resource: string;

  resourceId?: string;

  description: string;

  metadata?: Record<string, unknown>;

  ipHash?: string;

  userAgent?: string;

  createdAt: Date;

  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    userName: {
      type: String,
      maxlength: 100,
    },

    userEmail: {
      type: String,
      maxlength: 255,
    },

    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
      index: true,
    },

    resource: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    resourceId: {
      type: String,
      maxlength: 100,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    ipHash: {
      type: String,
      maxlength: 128,
    },

    userAgent: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({
  createdAt: -1,
});

auditLogSchema.index({
  userId: 1,
  createdAt: -1,
});

auditLogSchema.index({
  resource: 1,
  resourceId: 1,
  createdAt: -1,
});

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
    