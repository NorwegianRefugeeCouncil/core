variable "app_name" {
  type        = string
  description = "Name of the application. e.g. core"
  default     = "core-v2"
}

variable "environment" {
  type        = string
  description = "Name of the environment. e.g. staging"
  default     = "dev"
}

variable "frontdoor_sku_name" {
  type        = string
  description = "The sku name of the frontdoor."
  default     = "Standard_AzureFrontDoor"
}

variable rg {
}

variable "law" {
}

locals {
  app_name = var.app_name
  environment = var.environment
  frontdoor_sku_name = var.frontdoor_sku_name
  rg = var.rg
  law = var.law
}