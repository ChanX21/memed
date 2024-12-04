import express from 'express';
import { fileMiddleware } from '../middlewares/upload.js';
import { pinata } from '../clients/pinata.js';
import fs from 'fs/promises';
import { v4 } from 'uuid';
import path from 'path';

const router = express.Router();

router.post('/upload', fileMiddleware, async (req, res) => {
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

    res.status(200).json({ success: true, url: `https://${process.env.PINATA_GATEWAY}/ipfs/${uploadResponse.IpfsHash}` });

});

export default router;