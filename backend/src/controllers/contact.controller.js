import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Contact from '../models/Contact.js';

export const submit = asyncHandler(async (req, res) => {
  const { name, email, message, website } = req.body;

  // Honeypot: bots fill every field, real users never see/fill "website".
  if (website) {
    return res.status(201).json({ success: true });
  }

  await Contact.create({ name, email, message });
  res.status(201).json({ success: true });
});

export const listAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const [messages, total] = await Promise.all([
    Contact.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Contact.countDocuments({}),
  ]);
  res.json({
    success: true,
    messages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const markRead = asyncHandler(async (req, res) => {
  const message = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!message) throw new ApiError(404, 'Message not found');
  res.json({ success: true, message });
});
