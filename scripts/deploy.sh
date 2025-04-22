#!/bin/bash
# Script to manually deploy the AWS Pricing Tool to EKS

# Set variables
CLUSTER_NAME="aws-pricing-cluster"
REGION="us-east-1"
NAMESPACE="aws-pricing-tool"
ECR_REPOSITORY_BACKEND="aws-pricing-tool/backend"
ECR_REPOSITORY_FRONTEND="aws-pricing-tool/frontend"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Build and push Docker images
echo "Building and pushing Docker images..."

# Backend
cd ../backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY_BACKEND:latest .
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY_BACKEND:latest

# Frontend
cd ../frontend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY_FRONTEND:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPOSITORY_FRONTEND:latest

# Update kubeconfig
echo "Updating kubeconfig..."
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Replace placeholders in Kubernetes manifests
echo "Preparing Kubernetes manifests..."
cd ..
find k8s -type f -name "*.yaml" -exec sed -i "s|\${AWS_ACCOUNT_ID}|$AWS_ACCOUNT_ID|g" {} \;
find k8s -type f -name "*.yaml" -exec sed -i "s|\${AWS_REGION}|$REGION|g" {} \;

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/backend -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=300s

echo "Deployment complete!"
echo "To access the application, use the ALB URL:"
kubectl get ingress aws-pricing-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
