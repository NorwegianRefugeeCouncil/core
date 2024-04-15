
# START App environment variables

variable "port" {
  type        = number
  description = "The port the application will listen on"
  default     = 3333
}

variable "oidc_issuer" {
  type = string
  description = "The OIDC issuer URL"
}

variable "oidc_authorization_url" {
  type = string
  description = "The OIDC authorization URL"
}

variable "oidc_token_url" {
  type = string
  description = "The OIDC token URL"
}

variable "oidc_user_info_url" {
  type = string
  description = "The OIDC user info URL"
}

variable "oidc_callback_url" {
  type = string
  description = "The OIDC callback URL"
}

variable "oidc_scope" {
  type = string
  description = "The OIDC scope"
}

variable "oidc_client_id" {
  type        = string
  description = "OIDC Client ID"
}

variable "oidc_client_secret" {
  type        = string
  description = "OIDC Client Secret"
}

variable "okta_scim_api_token" {
  type = string
  description = "The API token Okta will use when calling the SCIM API"
}

#  END App environment variables

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
  # START App environment variables
  port = var.port
  oidc_issuer = var.oidc_issuer
  oidc_authorization_url = var.oidc_authorization_url
  oidc_token_url = var.oidc_token_url
  oidc_user_info_url = var.oidc_user_info_url
  oidc_callback_url = var.oidc_callback_url
  oidc_scope = var.oidc_scope
  oidc_client_id = var.oidc_client_id
  oidc_client_secret = var.oidc_client_secret
  okta_scim_api_token = var.okta_scim_api_token
  # END App environment variables
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
  backend_host_name = var.backend_host_name
  runtime_subnet_address_space = var.runtime_subnet_address_space
  infra_container_registry_name = var.infra_container_registry_name
  infra_resource_group_name = var.infra_resource_group_name
  container_image = var.container_image
  container_image_tag = var.container_image_tag
}
