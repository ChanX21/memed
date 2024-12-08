import express from 'express';
import { fileMiddleware } from '../middlewares/upload.js';
import { pinata } from '../clients/pinata.js';
import fs from 'fs/promises';
import { v4 } from 'uuid';
import path from 'path';
import { z } from 'zod';
import { prisma } from '../clients/prisma.js';

const router = express.Router();

const commentSchema = z.object({
  text: z.string(),
  tokenAddress: z.string().regex(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid Ethereum address"),
  userAddress: z.string().regex(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid Ethereum address"),
  replyToId: z.number().nullable().optional(),
});


router.post('/upload', fileMiddleware, async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!req.file || !filePath) {
      res.status(400).json({ error: "File is required" });
      return;
    }

    const fileName = v4() + path.extname(req.file?.originalname || 'hi.jpg');
    const fileBuffer = await fs.readFile(filePath);
    const blob = new Blob([fileBuffer]);
    const file = new File([blob], fileName, { type: req.file.mimetype });

    const uploadResponse = await pinata.upload.file(file);
    await fs.unlink(filePath);

    res.status(200).json({ success: true, ipfsHash: uploadResponse.IpfsHash });
  } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/comment", async (req, res) => {
  try {
    const { text, tokenAddress, userAddress, replyToId } = commentSchema.parse(req.body);

    let token = await prisma.token.findUnique({
      where: { address: tokenAddress },
    });

    if (!token) {
      token = await prisma.token.create({
        data: { address: tokenAddress },
      });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        tokenId: token.id,
        userAddress,
        replyToId,
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/comment/:tokenAddress", async (req, res) => {
  try {
    const { tokenAddress } = req.params;

    const token = await prisma.token.findUnique({
      where: { address: tokenAddress },
    });

    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    const comments = await prisma.comment.findMany({
      where: { tokenId: token.id },
      include: { replies: true },
    });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;