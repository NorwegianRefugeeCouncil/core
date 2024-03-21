variable "location" {
  type        = string
  description = "Azure Location for deploying resources"
}

variable "subscription_id" {
  type        = string
  description = "Runtime Subscription id"
}

variable "infra_subscription_id" {
  type        = string
  description = "Infrastructure Subscription id"
}

variable "infra_resource_group_name" {
  type        = string
  description = "Infrastructure Resource Group name"
}

variable "infra_container_registry_name" {
  type        = string
  description = "Name of the azure container registry"
}

variable "app_name" {
  type        = string
  description = "Name of the application. e.g. core"
}

variable "environment" {
  type        = string
  description = "Name of the environment. e.g. staging"
}

variable "address_space" {
  type        = string
  description = "Address space for the virtual networgitk"
}

variable "runtime_subnet_address_space" {
  type        = string
  description = "Address space for the runtime environment"
}

variable "postgres_subnet_address_space" {
  type        = string
  description = "Address space for the postgres subnet"
}

variable "postgres_sku_name" {
  type        = string
  description = "Name of the postgres SKU"
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