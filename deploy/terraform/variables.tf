variable "address_space" {
  type        = string
  description = "Address space for the virtual network"
  default     = "10.8.0.0/21"
}

variable "app_name" {
  type        = string
  description = "Name of the application. e.g. core"
  default     = "core-v2"
}

variable "app_service_plan_sku" {
  type        = string
  description = "SKU for the app service plan"
  default     = "P1v3"
}

variable "environment" {
  type        = string
  description = "Name of the environment. e.g. staging"
  default     = "dev"
}

variable "infra_container_registry_name" {
  type        = string
  description = "Name of the azure container registry"
}

variable "infra_resource_group_name" {
  type        = string
  description = "Infrastructure Resource Group name"
}

variable "infra_subscription_id" {
  type        = string
  description = "Infrastructure Subscription id"
}

variable "location" {
  type        = string
  description = "Azure Location for deploying resources"
  default     = "westeurope"
}

variable "oidc_client_id" {
  type        = string
  description = "OIDC Client ID"
}

variable "oidc_client_secret" {
  type        = string
  description = "OIDC Client Secret"
}

variable "oidc_well_known_url" {
  type        = string
  description = "OIDC Well Known URL"
}

variable "postgres_sku_name" {
  type        = string
  description = "Name of the postgres SKU"
  default     = "B_Standard_B2ms"
}

variable "postgres_storage_mb" {
  type        = string
  description = "MB for postgres storage"
  default     = "32768"
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

variable "runtime_subnet_address_space" {
  type        = string
  description = "Address space for the runtime environment"
  default     = "10.8.0.0/26"
}

variable "subscription_id" {
  type        = string
  description = "Runtime Subscription id"
  default     = "f7791b2f-bb9b-4f70-813d-d1d2bb9e508e"
}