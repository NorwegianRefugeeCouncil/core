variable "app_name" {
  type        = string
  description = "Name of the application. e.g. core"
  default     = "core-v2"
}

variable "location" {
  type        = string
  description = "Azure Location for deploying resources"
  default     = "westeurope"
}

variable "environment" {
  type        = string
  description = "Name of the environment. e.g. staging"
  default     = "dev"
}

variable "address_space" {
  type        = string
  description = "Address space for the virtual network"
  default     = "10.8.0.0/21"
}

variable "prevent_deletion" {
  type        = bool
}

variable "action_group_webhook_url" {
  type        = string
}

variable "dns_zone_name" {
  type        = string
}

locals {
  app_name = var.app_name
  environment = var.environment
  location = var.location
  address_space = var.address_space
  prevent_deletion = var.prevent_deletion
  action_group_webhook_url = var.action_group_webhook_url
  dns_zone_name = var.dns_zone_name
}