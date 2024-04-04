terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.97.1"
      configuration_aliases = [runtime]
    }
  }
  backend "azurerm" {
  }
}

resource "random_id" "waf_id" {
  byte_length = 8
  keepers = {
    azi_id = 1
  }
}

resource "azurerm_cdn_frontdoor_profile" "fd" {
  provider            = runtime
  name                = "fd-${local.app_name}-${local.environment}"
  resource_group_name = local.rg.name
  sku_name            = local.frontdoor_sku_name
}

resource "azurerm_web_application_firewall_policy" "backend" {
  provider            = runtime
  name                = "waf${random_id.waf_id.hex}"
  resource_group_name = local.rg.name
  location            = local.rg.location

  policy_settings {
    file_upload_limit_in_mb     = 800
    max_request_body_size_in_kb = 128
  }

  managed_rules {
    managed_rule_set {
      version = "3.2"
      type    = "OWASP"
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "frontdoor" {
  provider                   = runtime
  name                       = "diag-frontdoor-${azurerm_cdn_frontdoor_profile.fd.name}"
  target_resource_id         = azurerm_cdn_frontdoor_profile.fd.id
  log_analytics_workspace_id = local.law.id

  log {
    category = "FrontDoorAccessLog"
  }
  log {
    category = "FrontDoorHealthProbeLog"
  }
  log {
    category = "FrontDoorWebApplicationFirewallLog"
  }
  metric {
    category = "AllMetrics"
  }
}