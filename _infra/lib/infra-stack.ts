import { Stack, StackProps, RemovalPolicy } from '../$node_modules/aws-cdk-lib/index.js';
import { Construct } from '../$node_modules/constructs/lib/index.js';
import * as s3 from '../$node_modules/aws-cdk-lib/aws-s3/index.js';
import * as cloudfront from '../$node_modules/aws-cdk-lib/aws-cloudfront/index.js';
import * as origins from '../$node_modules/aws-cdk-lib/aws-cloudfront-origins/index.js';
import * as certificatemanager from '../$node_modules/aws-cdk-lib/aws-certificatemanager/index.js';
import * as route53 from '../$node_modules/aws-cdk-lib/aws-route53/index.js';
import * as targets from '../$node_modules/aws-cdk-lib/aws-route53-targets/index.js';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: process.env.AWS_ACCOUNT_ID,
        region: 'us-east-1', // Keep this at us-east-1 for ACM + CloudFront
      },
    });

    // Create a new Hosted Zone
    const zone = new route53.HostedZone(this, 'HostedZone', {
      zoneName: 'davertron.com',
    });

    // Create a new S3 bucket for website hosting
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: 'davertron.com',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create a new SSL certificate (DNS validated)
    const certificate = new certificatemanager.Certificate(this, 'SiteCertificate', {
      domainName: 'davertron.com',
      validation: certificatemanager.CertificateValidation.fromDns(zone),
    });

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: ['davertron.com'],
      certificate: certificate,
      defaultRootObject: 'index.html',
    });

    // Create A Record aliasing domain to CloudFront
    new route53.ARecord(this, 'AliasRecord', {
      recordName: 'davertron.com',
      zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}
