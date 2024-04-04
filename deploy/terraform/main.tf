terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.97.1"
    }
  }
  backend "azurerm" {
  }
}

provider "azurerm" {
  alias           = "runtime"
  subscription_id = var.subscription_id
  features {
  }
}

provider "azurerm" {
  alias           = "infra"
  subscription_id = var.infra_subscription_id
  features {
  }
}

module "base" {
  source = "./base"

  providers = {
    azurerm.runtime = azurerm.runtime
  }

  app_name = var.app_name
  environment = var.environment
  location = var.location
  prevent_deletion = var.prevent_deletion
  action_group_webhook_url = var.action_group_webhook_url
}

module "postgres" {
  source = "./postgres"

  providers = {
    azurerm.runtime = azurerm.runtime
  }

  rg = module.base.rg 
  vnet = module.base.vnet
  ag = module.base.ag_teams
  law = module.base.law

  app_name = var.app_name
  environment = var.environment
  postgres_sku_name = var.postgres_sku_name
  postgres_storage_mb = var.postgres_storage_mb
  postgres_subnet_address_space = var.postgres_subnet_address_space
  postgres_version = var.postgres_version
  postgres_zone = var.postgres_zone
}

module ingress {
  source = "./ingress"

  providers = {
    azurerm.runtime = azurerm.runtime
  }

  rg = module.base.rg
  law = module.base.law

  app_name = var.app_name
  environment = var.environment
  frontdoor_sku_name = var.frontdoor_sku_name
}

module "web_app" {
  source = "./web_app"

  providers = {
    azurerm.runtime = azurerm.runtime
    azurerm.infra = azurerm.infra
  }

  rg = module.base.rg
  vnet = module.base.vnet
  ag = module.base.ag_teams
  law = module.base.law

  app_name = var.app_name
  environment = var.environment
  app_service_plan_sku = var.app_service_plan_sku
  oidc_client_id = var.oidc_client_id
  oidc_client_secret = var.oidc_client_secret
  oidc_well_known_url = var.oidc_well_known_url
  backend_host_name = var.backend_host_name
  runtime_subnet_address_space = var.runtime_subnet_address_space
  infra_container_registry_name = var.infra_container_registry_name
  infra_resource_group_name = var.infra_resource_group_name
}