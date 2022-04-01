import * as path from "path";
import * as mime from "mime";
import { Bucket } from "@google-cloud/storage";
import { File } from "./FirebaseStorageAdapter";
import { ParseImage } from "parse-cloud-image";

const optional = <T extends string | number | boolean | null | undefined>(
  name: string,
  fallback: T
): string | T => process.env[name] || fallback;

const required = (name: string): string => {
  if (process.env[name] === undefined || process.env[name] === "") {
    throw new Error("Missing required env var: " + name);
  }
  return process.env[name];
};

const persists = (name: string): boolean => {
  return process.env[name] && process.env[name].length > 0;
};

const isImage = (filename: string, contentType?: string): boolean => {
  return (contentType || mime.getType(filename)).startsWith("image/");
};

const generateThumbnail = async (
  bucket: Bucket,
  image: File,
  size: string
): Promise<void> => {
  const filename = path.parse(image.filename);
  const thumbnailName = `${filename.name}_thumb_${size}${filename.ext}`;
  const contentType = image.contentType || mime.getType(image.filename);

  const thumbnailUploadStream = bucket.file(thumbnailName).createWriteStream({
    contentType: image.contentType || mime.getType(image.filename),
    metadata: Object.assign({}, image.options.metadata, image.options.tags),
    public: true,
  });

  const pipeline = new ParseImage(image.filename, image.data, contentType);
  const width = parseInt(size.split("x")[0]);
  const height = parseInt(size.split("x")[1]);

  const sharp = await pipeline.process((sharp) =>
    sharp.resize(
      width === 0 ? undefined : width,
      height === 0 ? undefined : height
    )
  );
  sharp.pipe(thumbnailUploadStream);

  return new Promise((resolve, reject) =>
    thumbnailUploadStream.on("finish", resolve).on("error", reject)
  );
};

const generateThumbnails = async (
  bucket: Bucket,
  image: File
): Promise<void> => {
  const sizes = required("FIREBASE_THUMBNAILS_SIZES").split(",");

  for (const size of sizes) {
    await generateThumbnail(bucket, image, size);
  }
};

export { optional, required, persists, isImage, generateThumbnails };
