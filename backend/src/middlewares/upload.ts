import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const upload = multer({
  dest: "tmp/",
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

export const fileMiddleware = upload.single("image");

