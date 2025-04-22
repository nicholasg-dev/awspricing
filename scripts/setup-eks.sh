#!/bin/bash
# Script to set up an EKS cluster for the AWS Pricing Tool

# Set variables
CLUSTER_NAME="aws-pricing-cluster"
REGION="us-east-1"
NODE_GROUP_NAME="aws-pricing-nodes"
NODE_TYPE="t3.medium"
MIN_NODES=2
MAX_NODES=5
DESIRED_NODES=2

# Create EKS cluster
echo "Creating EKS cluster: $CLUSTER_NAME"
aws eks create-cluster \
  --name $CLUSTER_NAME \
  --region $REGION \
  --role-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/EksClusterRole" \
  --resources-vpc-config subnetIds=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=*Public*" --query "Subnets[*].SubnetId" --output text | tr '\t' ','),securityGroupIds=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=default" --query "SecurityGroups[0].GroupId" --output text)

# Wait for cluster to be active
echo "Waiting for cluster to be active..."
aws eks wait cluster-active --name $CLUSTER_NAME --region $REGION

# Create node group
echo "Creating node group: $NODE_GROUP_NAME"
aws eks create-nodegroup \
  --cluster-name $CLUSTER_NAME \
  --nodegroup-name $NODE_GROUP_NAME \
  --node-role "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/EksNodeRole" \
  --subnets $(aws ec2 describe-subnets --filters "Name=tag:Name,Values=*Public*" --query "Subnets[*].SubnetId" --output text) \
  --instance-types $NODE_TYPE \
  --scaling-config minSize=$MIN_NODES,maxSize=$MAX_NODES,desiredSize=$DESIRED_NODES \
  --region $REGION

# Wait for node group to be active
echo "Waiting for node group to be active..."
aws eks wait nodegroup-active --cluster-name $CLUSTER_NAME --nodegroup-name $NODE_GROUP_NAME --region $REGION

# Update kubeconfig
echo "Updating kubeconfig..."
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Install AWS Load Balancer Controller
echo "Installing AWS Load Balancer Controller..."
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller/crds?ref=master"

helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  --set clusterName=$CLUSTER_NAME \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=$REGION \
  --set vpcId=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text) \
  --namespace kube-system

# Install metrics server for HPA
echo "Installing metrics server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Create ECR repositories
echo "Creating ECR repositories..."
aws ecr create-repository --repository-name aws-pricing-tool/backend --region $REGION || true
aws ecr create-repository --repository-name aws-pricing-tool/frontend --region $REGION || true

echo "EKS cluster setup complete!"
echo "Cluster name: $CLUSTER_NAME"
echo "Region: $REGION"
echo "Node group: $NODE_GROUP_NAME"
echo "Node type: $NODE_TYPE"
echo "Min nodes: $MIN_NODES"
echo "Max nodes: $MAX_NODES"
echo "Desired nodes: $DESIRED_NODES"
