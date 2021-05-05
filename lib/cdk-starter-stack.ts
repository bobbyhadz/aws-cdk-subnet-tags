/* eslint-disable no-restricted-syntax */
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 create VPC
    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: ec2.SubnetType.ISOLATED,
          cidrMask: 28,
        },
      ],
    });

    // 👇 define function that tags subnets
    const tagAllSubnets = (
      subnets: ec2.ISubnet[],
      tagName: string,
      tagValue: string,
    ) => {
      for (const subnet of subnets) {
        cdk.Tags.of(subnet).add(
          tagName,
          `${tagValue}-${subnet.availabilityZone}`,
        );
      }
    };

    // 👇 tag subnets
    const {stackName} = cdk.Stack.of(this);
    tagAllSubnets(vpc.publicSubnets, 'Name', `${stackName}/public`);
    tagAllSubnets(vpc.isolatedSubnets, 'Name', `${stackName}/isolated`);

    tagAllSubnets(vpc.publicSubnets, 'env', 'staging');
    tagAllSubnets(vpc.isolatedSubnets, 'env', 'dev');
  }
}
