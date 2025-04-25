import { S3Client, PutObjectCommand, GetObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.540.0";
import { createHash } from "node:crypto";

const s3Client = new S3Client({
  region: Deno.env.get("AWS_REGION") || "us-east-1",
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") || "",
  },
});

export async function uploadToS3(data: unknown, key: string): Promise<boolean> {
  const bucket = Deno.env.get("AWS_BUCKET_NAME");
  const prefix = Deno.env.get("AWS_BUCKET_PREFIX") || "";
  
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }

  const fullKey = prefix ? `${prefix}/${key}` : key;
  const dataString = JSON.stringify(data);
  const hash = createHash("sha256").update(dataString).toString();

  try {
    // Check if file exists and get its hash
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: fullKey,
      });
      const response = await s3Client.send(getCommand);
      const existingData = await response.Body?.transformToString() || "";
      const existingHash = createHash("sha256").update(existingData).toString();
      
      if (existingHash === hash) {
        console.log("Data unchanged, skipping upload");
        return false;
      }
    } catch (_error) {
      // File doesn't exist, which is fine - we'll upload it
      console.log("No existing file found, will upload new data");
    }

    // Upload the new data
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: dataString,
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    console.log(`Successfully uploaded data to s3://${bucket}/${fullKey}`);
    return true;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function getFromS3(key: string): Promise<unknown> {
  const bucket = Deno.env.get("AWS_BUCKET_NAME");
  const prefix = Deno.env.get("AWS_BUCKET_PREFIX") || "";
  
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }

  const fullKey = prefix ? `${prefix}/${key}` : key;

  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: fullKey,
    });
    const response = await s3Client.send(getCommand);
    const data = await response.Body?.transformToString();
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting from S3:", error);
    throw error;
  }
} 