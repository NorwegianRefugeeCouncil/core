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

variable "app_service_plan_sku" {
  type        = string
  description = "SKU for the app service plan"
  default     = "P1v3"
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

variable "backend_host_name" {
  type        = string
  description = "The hostname of the backend."
}

variable "runtime_subnet_address_space" {
  type        = string
  description = "Address space for the runtime environment"
  default     = "10.8.0.0/26"
}

variable "infra_container_registry_name" {
  type        = string
  description = "Name of the azure container registry"
}

variable "infra_resource_group_name" {
  type        = string
  description = "Infrastructure Resource Group name"
}

variable "container_image" {
  type        = string
  description = <<EOF
The container image of the application.

The container image must be located in the shared container registry, or
in a public container registry.
EOF
}

variable "container_image_tag" {
  type        = string
  description = <<EOF
The tag of the container image of the application.
EOF
}

variable "okta_scim_api_token" {
  type = string
  description = "The API token Okta will use when calling the SCIM API"
 }

variable rg {
}

variable "vnet" {
}

variable "ag" {
}

variable "law" {
}

variable "fd" {
}

variable "db_user" {

}

variable "postgres" {

}

variable "db" {

}

locals {
  app_name = var.app_name
  location = var.location
  environment = var.environment
  rg = var.rg
  vnet = var.vnet
  ag = var.ag
  law = var.law
  fd = var.fd
  db_user = var.db_user
  postgres = var.postgres
  db = var.db
  app_service_plan_sku = var.app_service_plan_sku
  oidc_client_id = var.oidc_client_id
  oidc_client_secret = var.oidc_client_secret
  oidc_well_known_url = var.oidc_well_known_url
  backend_host_name = var.backend_host_name
  runtime_subnet_address_space = var.runtime_subnet_address_space
  infra_container_registry_name = var.infra_container_registry_name
  infra_resource_group_name = var.infra_resource_group_name
  container_image = var.container_image
  container_image_tag = var.container_image_tag
  okta_scim_api_token = var.okta_scim_api_token
}
