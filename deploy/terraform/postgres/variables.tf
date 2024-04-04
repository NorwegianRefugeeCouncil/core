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

variable "postgres_sku_name" {
  type        = string
  description = "Name of the postgres SKU"
  default     = "B_Standard_B2ms"
}

variable "postgres_storage_mb" {
  type        = number
  description = "MB for postgres storage"
  default     = 32768
}

variable "postgres_subnet_address_space" {
  type        = string
  description = "Address space for the postgres subnet"
  default     = "10.8.0.64/27"
}

variable "postgres_version" {
  type        = string
  description = "Postgres version"
  default     = "14"
}

variable "postgres_zone" {
  type        = string
  description = "Postgres zone"
  default     = "1"
}

variable rg {
  type = azurerm_resource_group
}

variable "vnet" {
  type = azurerm_virtual_network
}

variable "ag" {
  type = azurerm_monitor_action_group
}

variable "law" {
  type = azurerm_log_analytics_workspace
}

locals {
  app_name = var.app_name
  environment = var.environment
  rg = var.rg
  vnet = var.vnet
  ag = var.ag
  law = var.law
  postgres_sku_name = var.postgres_sku_name
  postgres_storage_mb = var.postgres_storage_mb
  postgres_subnet_address_space = var.postgres_subnet_address_space
  postgres_version = var.postgres_version
  postgres_zone = var.postgres_zone
}