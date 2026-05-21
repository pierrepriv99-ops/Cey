# CryOS Terraform AWS Infrastructure
# ECS, RDS, ElastiCache, ALB

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = { source = "hashicorp/aws" }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ECR Repositories
resource "aws_ecr_repository" "web" { name = "cryos-web" }
resource "aws_ecr_repository" "api" { name = "cryos-api" }

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "cryos-cluster"
  setting { name = "containerInsights"; value = "enabled" }
}

# ECS Task Definitions
resource "aws_ecs_task_definition" "web" {
  family       = "cryos-web"
  network_mode = "awsvpc"
  cpu         = "256"
  memory     = "512"
  container_definitions = jsonencode([{
    name  = "web"
    image = aws_ecr_repository.web.repository_url
    portMappings = [{ containerPort = 3000 }]
    essential  = true
  }])
}

resource "aws_ecs_task_definition" "api" {
  family       = "cryos-api"
  network_mode = "awsvpc"
  cpu         = "256"
  memory     = "512"
  container_definitions = jsonencode([{
    name  = "api"
    image = aws_ecr_repository.api.repository_url
    portMappings = [{ containerPort = 8080 }]
    essential  = true
  }])
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier     = "cryos-prod"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  username      = "cryos"
  db_name        = "cryos"
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "cryos-redis"
  engine        = "redis"
  node_type     = "cache.t3.micro"
  num_cache_nodes = 1
  port         = 6379
}

# ALB
resource "aws_lb" "main" {
  name               = "cryos-alb"
  load_balancer_type = "application"
}

resource "aws_lb_target_group" "web" {
  name = "cryos-web-tg"
  port = 80
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port            = 80
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# Outputs
output "ecr_web_url" { value = aws_ecr_repository.web.repository_url }
output "ecs_cluster" { value = aws_ecs_cluster.main.name }
output "alb_dns"    { value = aws_lb.main.dns_name }