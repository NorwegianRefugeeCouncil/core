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

variable "backend_host_name" {
  type        = string
  description = "The hostname of the backend."
}

variable "frontdoor_sku_name" {
  type        = string
  description = "The sku name of the frontdoor."
  default     = "Standard_AzureFrontDoor"
}

variable "action_group_webhook_url" {
  type        = string
  description = "The url of the webhook for the action group."
}

variable "prevent_deletion" {
  type        = bool
  default     = true
  description = <<EOF
Whether or not to prevent the deletion of the resource group.
This is implemented using an Azure Management Lock.
EOF
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
