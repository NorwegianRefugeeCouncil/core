terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.97.1"
      configuration_aliases = [azurerm.runtime]
    }
  }
  backend "azurerm" {
  }
}

resource "azurerm_resource_group" "rg" {
  provider = azurerm.runtime
  location = local.location
  name     = "rg-${local.app_name}-${local.environment}"
}

resource "azurerm_management_lock" "deletion_lock" {
  provider   = azurerm.runtime
  count      = local.prevent_deletion ? 1 : 0
  name       = azurerm_resource_group.rg.name
  lock_level = "CanNotDelete"
  scope      = azurerm_resource_group.rg.id
}

resource "azurerm_virtual_network" "vnet" {
  provider            = azurerm.runtime
  name                = "vnet-${local.app_name}-${local.environment}"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = [local.address_space]
}

resource "azurerm_log_analytics_workspace" "law" {
  provider            = azurerm.runtime
  name                = "law-${local.app_name}-${local.environment}"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name
  retention_in_days   = 30
}

resource "azurerm_monitor_action_group" "ag_teams" {
  name                = "send-notification-to-teams-${local.environment}"
  provider            = azurerm.runtime
  resource_group_name = azurerm_resource_group.rg.name
  short_name          = "notify-teams"

  webhook_receiver {
    name                    = "send_alert_to_okta_workflows"
    service_uri             = local.action_group_webhook_url
    use_common_alert_schema = true
  }
}
