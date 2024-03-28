variable "address_space" {
  type        = string  
  description = "Address space for the virtual networgitk"
}

variable "app_name" {
  type        = string  
  description = "Name of the application. e.g. core"
}

variable "app_service_plan_sku" {
  type = string  
  description = "SKU for the app service plan"
}

variable "environment" {
  type        = string  
  description = "Name of the environment. e.g. staging"
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
}

variable "postgres_storage_mb" {
  type = number  
  description = "MB for postgres storage"
}

variable "postgres_subnet_address_space" {
  type        = string  
  description = "Address space for the postgres subnet"
}

variable "postgres_version" {
  type = string  
  description = "Postgres version"
}

variable "postgres_zone" {
  type = string  
  description = "Postgres zone"
}

variable "runtime_subnet_address_space" {
  type        = string  
  description = "Address space for the runtime environment"
}

variable "subscription_id" {
  type        = string  
  description = "Runtime Subscription id"
}
