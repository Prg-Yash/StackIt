import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import mime from "mime-types";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const data = await req.formData();
  const file = data.get("file");

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split(".").pop();
  const contentType = mime.lookup(fileExt) || "application/octet-stream";

  const fileKey = `${randomUUID()}.${fileExt}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  return NextResponse.json({
    key: fileKey,
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
  });
}
