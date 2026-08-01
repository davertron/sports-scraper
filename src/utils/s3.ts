import { AwsClient } from "aws4fetch";

const region = process.env.AWS_REGION;

const s3Client = new AwsClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  region,
  service: "s3",
});

// CloudFront is a global service that's always signed against us-east-1,
// regardless of which region the bucket itself lives in.
const cloudfrontClient = new AwsClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  region: "us-east-1",
  service: "cloudfront",
});

const distributionId = process.env.DATA_CLOUDFRONT_DISTRIBUTION_ID;

function encodeS3Key(key: string): string {
  // Encode each path segment separately so the "/" separators survive.
  return key.split("/").map(encodeURIComponent).join("/");
}

// Path-style URL (s3.<region>.amazonaws.com/<bucket>/<key>), not virtual-hosted
// style (<bucket>.s3.amazonaws.com) -- our bucket name has dots in it
// (files.davertron.com), which breaks TLS SNI/cert matching under
// virtual-hosted style addressing.
function s3Url(bucket: string, key: string): string {
  return `https://s3.${region}.amazonaws.com/${bucket}/${encodeS3Key(key)}`;
}

async function assertOk(response: Response, action: string): Promise<void> {
  if (!response.ok) {
    throw new Error(`${action} failed: ${response.status} ${response.statusText} - ${await response.text()}`);
  }
}

async function invalidateCloudFrontPath(path: string): Promise<void> {
  if (!distributionId) {
    return;
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<InvalidationBatch xmlns="http://cloudfront.amazonaws.com/doc/2020-05-31/">
  <CallerReference>${Date.now()}</CallerReference>
  <Paths>
    <Quantity>1</Quantity>
    <Items>
      <Path>${path}</Path>
    </Items>
  </Paths>
</InvalidationBatch>`;

  const response = await cloudfrontClient.fetch(
    `https://cloudfront.amazonaws.com/2020-05-31/distribution/${distributionId}/invalidation`,
    {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body,
    }
  );
  await assertOk(response, "CloudFront invalidation");
  console.log("Successfully invalidated CloudFront cache");
}

function requireBucket(): string {
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    throw new Error("AWS_BUCKET_NAME environment variable is required");
  }
  return bucket;
}

async function copyToLatestAndInvalidate(sourceKey: string): Promise<void> {
  const bucket = requireBucket();

  // Copy to latest.json
  const response = await s3Client.fetch(s3Url(bucket, "hockey-games/latest.json"), {
    method: "PUT",
    headers: { "x-amz-copy-source": `/${bucket}/${encodeS3Key(sourceKey)}` },
  });
  await assertOk(response, "S3 copy to latest.json");
  console.log(`Successfully copied to s3://${bucket}/hockey-games/latest.json`);

  await invalidateCloudFrontPath("/hockey-games/latest.json");
}

export async function uploadToS3(data: unknown, key: string): Promise<boolean> {
  const bucket = requireBucket();

  try {
    // Check if file exists
    const existsResponse = await s3Client.fetch(s3Url(bucket, key), { method: "HEAD" });
    if (existsResponse.ok) {
      console.log("File already exists, skipping upload");
      return false;
    }

    // Upload the new data
    const putResponse = await s3Client.fetch(s3Url(bucket, key), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await assertOk(putResponse, "S3 upload");
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
  const bucket = requireBucket();

  try {
    // Upload the calendar
    const putResponse = await s3Client.fetch(s3Url(bucket, key), {
      method: "PUT",
      headers: { "Content-Type": "text/calendar" },
      body: content,
    });
    await assertOk(putResponse, "S3 calendar upload");
    console.log(`Successfully uploaded calendar to s3://${bucket}/${key}`);

    await invalidateCloudFrontPath(`/${key}`);

    return true;
  } catch (error) {
    console.error("Error uploading calendar to S3:", error);
    throw error;
  }
}

export async function getFromS3(key: string): Promise<unknown> {
  const bucket = requireBucket();

  try {
    const response = await s3Client.fetch(s3Url(bucket, key));
    await assertOk(response, "S3 get");
    return await response.json();
  } catch (error) {
    console.error("Error getting from S3:", error);
    throw error;
  }
}
