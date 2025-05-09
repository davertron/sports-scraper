import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
} from "https://esm.sh/@aws-sdk/client-s3@3.540.0";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "https://esm.sh/@aws-sdk/client-cloudfront@3.540.0";

const s3Client = new S3Client({});
const cloudfrontClient = new CloudFrontClient({});
const distributionId = Deno.env.get("DATA_CLOUDFRONT_DISTRIBUTION_ID");

async function copyToLatestAndInvalidate(sourceKey: string): Promise<void> {
  const bucket = Deno.env.get("AWS_BUCKET_NAME");
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }

  // Copy to latest.json
  const copyCommand = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey}`,
    Key: "hockey-games/latest.json",
  });

  await s3Client.send(copyCommand);
  console.log(`Successfully copied to s3://${bucket}/hockey-games/latest.json`);

  // Invalidate CloudFront cache if distribution ID is provided
  if (distributionId) {
    const invalidationCommand = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ["/hockey-games/latest.json"],
        },
      },
    });

    await cloudfrontClient.send(invalidationCommand);
    console.log("Successfully invalidated CloudFront cache");
  }
}

export async function uploadToS3(data: unknown, key: string): Promise<boolean> {
  const bucket = Deno.env.get("AWS_BUCKET_NAME");
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }

  try {
    // Check if file exists
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(getCommand);
      console.log("File already exists, skipping upload");
      return false;
    } catch (_error) {
      // File doesn't exist, proceed with upload
    }

    // Upload the new data
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    console.log(`Successfully uploaded data to s3://${bucket}/${key}`);

    // Copy to latest.json and invalidate cache
    await copyToLatestAndInvalidate(key);

    return true;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function uploadCalendarToS3(content: string, key: string): Promise<boolean> {
  const bucket = Deno.env.get("AWS_BUCKET_NAME");
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }

  try {
    // Upload the calendar
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: "text/calendar",
    });

    await s3Client.send(putCommand);
    console.log(`Successfully uploaded calendar to s3://${bucket}/${key}`);

    // Invalidate CloudFront cache if distribution ID is provided
    if (distributionId) {
      const invalidationCommand = new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: 1,
            Items: [`/${key}`],
          },
        },
      });

      await cloudfrontClient.send(invalidationCommand);
      console.log("Successfully invalidated CloudFront cache");
    }

    return true;
  } catch (error) {
    console.error("Error uploading calendar to S3:", error);
    throw error;
  }
}

export async function getFromS3(key: string): Promise<unknown> {
  const bucket = Deno.env.get("AWS_BUCKET_NAME");
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }

  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await s3Client.send(getCommand);
    const data = await response.Body?.transformToString();
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting from S3:", error);
    throw error;
  }
} 