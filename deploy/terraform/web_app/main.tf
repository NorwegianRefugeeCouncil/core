terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.97.1"
      configuration_aliases = [azurerm.runtime, azurerm.infra]
    }
  }
  backend "azurerm" {
  }
}

resource "random_id" "app_id" {
  byte_length = 8
  keepers = {
    azi_id = 1
  }
}

resource "random_password" "session_secret" {
  length           = 32
  special          = true
  override_special = "_%@"
}

data "azurerm_container_registry" "acr" {
  provider            = azurerm.infra
  name                = local.infra_container_registry_name
  resource_group_name = local.infra_resource_group_name
}

resource "azurerm_user_assigned_identity" "app" {
  provider            = azurerm.runtime
  name                = "id-${local.app_name}-${local.environment}"
  location            = local.location
  resource_group_name = local.rg.name
}

resource "azurerm_subnet" "runtime_subnet" {
  provider             = azurerm.runtime
  name                 = "runtime"
  resource_group_name  = local.rg.name
  virtual_network_name = local.vnet.name
  address_prefixes     = [local.runtime_subnet_address_space]
  delegation {
    name = "appService"
    service_delegation {
      name = "Microsoft.Web/serverFarms"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

resource "azurerm_role_assignment" "acr_pull" {
  provider             = azurerm.runtime
  principal_id         = azurerm_user_assigned_identity.app.principal_id
  role_definition_name = "AcrPull"
  scope                = data.azurerm_container_registry.acr.id
}

resource "azurerm_service_plan" "plan" {
  provider            = azurerm.runtime
  name                = "asp-${local.app_name}-${local.environment}"
  location            = local.location
  resource_group_name = local.rg.name
  os_type             = "Linux"
  sku_name            = local.app_service_plan_sku
}

resource "azurerm_linux_web_app" "app" {
  provider                  = azurerm.runtime
  location                  = local.location
  name                      = "${local.app_name}-${local.environment}-${random_id.app_id.hex}"
  resource_group_name       = local.rg.name
  service_plan_id           = azurerm_service_plan.plan.id
  https_only                = true
  virtual_network_subnet_id = azurerm_subnet.runtime_subnet.id

  identity {
    type         = "SystemAssigned, UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  site_config {
    ftps_state                                    = "Disabled"
    container_registry_use_managed_identity       = true
    container_registry_managed_identity_client_id = azurerm_user_assigned_identity.app.client_id

    application_stack {
      docker_image_name = "${local.container_image}:${local.container_image_tag}"
      docker_registry_url = "https://${data.azurerm_container_registry.acr.login_server}"
    }

    ip_restriction {
        name = "Allow Azure Front Door"
        service_tag = "AzureFrontDoor.Backend"

        headers {
            x_azure_fdid = [local.fd.resource_guid]
        }
    }
  }

  app_settings = {
    PORT = local.port

    SESSION_SECRET = random_password.session_secret.result

    OIDC_ISSUER = local.oidc_issuer
    OIDC_AUTHORIZATION_URL = local.oidc_authorization_url
    OIDC_TOKEN_URL = local.oidc_token_url
    OIDC_USER_INFO_URL = local.oidc_user_info_url
    OIDC_CALLBACK_URL = local.oidc_callback_url
    OIDC_SCOPE = local.oidc_scope
    OIDC_CLIENT_ID = local.oidc_client_id
    OIDC_CLIENT_SECRET = local.oidc_client_secret
    OKTA_SCIM_API_TOKEN = local.okta_scim_api_token

    DB_HOST = local.postgres.fqdn
    DB_NAME = local.db.name
    DB_USER = local.db_user.username
    DB_PASSWORD = local.db_user.password
    DB_MIGRATIONS_DIR = "/api/libs/db/migrations"
    DB_SEEDS_DIR = "/api/libs/db/seeds"
  }

  depends_on = [
    azurerm_role_assignment.acr_pull
  ]
}

resource "azurerm_cdn_frontdoor_custom_domain_association" "backend" {
  provider                       = azurerm.runtime
  cdn_frontdoor_custom_domain_id = azurerm_cdn_frontdoor_custom_domain.backend.id
  cdn_frontdoor_route_ids        = [azurerm_cdn_frontdoor_route.backend.id]
}

resource "azurerm_cdn_frontdoor_custom_domain" "backend" {
  provider                 = azurerm.runtime
  name                     = "backend"
  cdn_frontdoor_profile_id = local.fd.id
  host_name                = local.backend_host_name

  tls {
    certificate_type    = "ManagedCertificate"
    minimum_tls_version = "TLS12"
  }
}

resource "azurerm_cdn_frontdoor_endpoint" "backend" {
  provider                 = azurerm.runtime
  name                     = "backend-${random_id.app_id.hex}"
  cdn_frontdoor_profile_id = local.fd.id
}

resource "azurerm_cdn_frontdoor_origin_group" "backend" {
  provider                 = azurerm.runtime
  name                     = "backend"
  cdn_frontdoor_profile_id = local.fd.id
  session_affinity_enabled = false
  load_balancing {
    sample_size                 = 4
    successful_samples_required = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "backend" {
  provider                       = azurerm.runtime
  name                           = "backend"
  cdn_frontdoor_origin_group_id  = azurerm_cdn_frontdoor_origin_group.backend.id
  enabled                        = true
  certificate_name_check_enabled = true
  host_name                      = azurerm_linux_web_app.app.default_hostname
  http_port                      = 80
  https_port                     = 443
  origin_host_header             = azurerm_linux_web_app.app.default_hostname
  priority                       = 1
  weight                         = 1000
}

resource "azurerm_cdn_frontdoor_route" "backend" {
  provider                      = azurerm.runtime
  name                          = "fdr-${random_id.app_id.hex}"
  cdn_frontdoor_endpoint_id     = azurerm_cdn_frontdoor_endpoint.backend.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.backend.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.backend.id]
  cdn_frontdoor_rule_set_ids    = [azurerm_cdn_frontdoor_rule_set.backend.id]
  enabled                       = true

  forwarding_protocol    = "HttpsOnly"
  https_redirect_enabled = true
  patterns_to_match      = ["/*"]
  supported_protocols    = ["Http", "Https"]

  cdn_frontdoor_custom_domain_ids = [
    azurerm_cdn_frontdoor_custom_domain.backend.id,
  ]
  link_to_default_domain = false
  cache {
    query_string_caching_behavior = "UseQueryString"
    compression_enabled           = true
    content_types_to_compress = [
      "application/eot",
      "application/font",
      "application/font-sfnt",
      "application/javascript",
      "application/json",
      "application/opentype",
      "application/otf",
      "application/pkcs7-mime",
      "application/truetype",
      "application/ttf",
      "application/vnd.ms-fontobject",
      "application/xhtml+xml",
      "application/xml",
      "application/xml+rss",
      "application/x-font-opentype",
      "application/x-font-truetype",
      "application/x-font-ttf",
      "application/x-httpd-cgi",
      "application/x-mpegurl",
      "application/x-otf",
      "application/x-perl",
      "application/x-ttf",
      "application/x-javascript",
      "font/eot",
      "font/ttf",
      "font/otf",
      "font/opentype",
      "image/svg+xml",
      "text/css",
      "text/csv",
      "text/html",
      "text/javascript",
      "text/js",
      "text/plain",
      "text/richtext",
      "text/tab-separated-values",
      "text/xml",
      "text/x-script",
      "text/x-component",
      "text/x-java-source"
    ]
  }
}

resource "azurerm_cdn_frontdoor_rule_set" "backend" {
  provider                 = azurerm.runtime
  cdn_frontdoor_profile_id = local.fd.id
  name                     = "backend"
}

resource "azurerm_cdn_frontdoor_rule" "backend_disable_auth_cache" {
  provider = azurerm.runtime
  # Required as per terraform documentation
  depends_on = [
    azurerm_cdn_frontdoor_origin_group.backend,
    azurerm_cdn_frontdoor_origin.backend,
  ]

  name                      = "disableAuthCache"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.backend.id
  order                     = 1
  behavior_on_match         = "Continue"

  actions {
    route_configuration_override_action {
      cache_behavior = "Disabled"
    }
  }

  conditions {
    request_uri_condition {
      operator     = "BeginsWith"
      match_values = ["/authorization-code", "/scim"]
    }
  }
}

resource "azurerm_cdn_frontdoor_rule" "backend_disable_download_compression" {
  provider = azurerm.runtime
  # Required as per terraform documentation
  depends_on = [
    azurerm_cdn_frontdoor_origin_group.backend,
    azurerm_cdn_frontdoor_origin.backend,
  ]

  name                      = "disableDownloadCompression"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.backend.id
  order                     = 2
  behavior_on_match         = "Continue"

  actions {
    route_configuration_override_action {
      compression_enabled = false
    }
  }

  conditions {
    request_uri_condition {
      operator     = "EndsWith"
      match_values = ["/download"]
    }
  }
}

resource "azurerm_monitor_diagnostic_setting" "backend" {
  provider                   = azurerm.runtime
  name                       = "diag-app-service-${azurerm_linux_web_app.app.name}"
  target_resource_id         = azurerm_linux_web_app.app.id
  log_analytics_workspace_id = local.law.id

  enabled_log {
    category = "AppServiceAntivirusScanAuditLogs"
  }

  enabled_log {
    category = "AppServiceHTTPLogs"
  }

  enabled_log {
    category = "AppServiceConsoleLogs"
  }

  enabled_log {
    category = "AppServiceAppLogs"
  }

  enabled_log {
    category = "AppServiceFileAuditLogs"
  }

  enabled_log {
    category = "AppServiceAuditLogs"
  }

  enabled_log {
    category = "AppServiceIPSecAuditLogs"
  }

  enabled_log {
    category = "AppServicePlatformLogs"
  }

  metric {
    category = "AllMetrics"
  }
}

resource "azurerm_monitor_metric_alert" "app_health_check" {
  provider            = azurerm.runtime
  name                = "health-check-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_linux_web_app.app.id]
  description         = "${local.environment} - Web App: HealthCheckStatus is less than 100% okay."
  severity            = 1
  frequency           = "PT1M"
  enabled             = true

  criteria {
    threshold         = 1
    operator          = "LessThan"
    aggregation       = "Average"
    metric_namespace  = "Microsoft.Web/sites"
    metric_name       = "HealthCheckStatus"
    skip_metric_validation = true
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "app_response_time" {
  provider            = azurerm.runtime
  name                = "app-response-time-over-threshold-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_linux_web_app.app.id]
  description         = "${local.environment} - Web App: Response time average is greater than 5s."
  severity            = 3
  frequency           = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 5
    skip_metric_validation = true
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "app_4xx_status_codes" {
  provider            = azurerm.runtime
  name                = "app-4xx-status-codes-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_linux_web_app.app.id]
  description         = "${local.environment} - Web App: more than 30 4xx Errors are returned per hour."
  severity            = 3
  frequency           = "PT1H"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http4xx"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 30
    skip_metric_validation = true

  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "app_5xx_status_codes" {
  provider            = azurerm.runtime
  name                = "app-5xx-status-codes${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_linux_web_app.app.id]
  description         = "${local.environment} - Web App: any 5xx Error, per minute"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT1M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http5xx"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = 1
    skip_metric_validation = true
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "asp_cpu_over_threshold" {
  provider            = azurerm.runtime
  name                = "asp-cpu-over-threshold-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_service_plan.plan.id]
  description         = "${local.environment} - App Service Plan: CPU percentage average is greater than 70%."
  severity            = 2
  frequency           = "PT1H"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.Web/serverfarms"
    metric_name      = "CpuPercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 70
    skip_metric_validation = true
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "asp_memory_over_threshold" {
  provider            = azurerm.runtime
  name                = "asp-memory-over-threshold-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_service_plan.plan.id]
  description         = "${local.environment} - App Service Plan: Memory percentage average is greater than 70%."
  severity            = 2
  frequency           = "PT1H"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.Web/serverfarms"
    metric_name      = "MemoryPercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 70
    skip_metric_validation = true
  }

  action {
    action_group_id = local.ag.id
  }
}
