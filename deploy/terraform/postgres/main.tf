resource "random_id" "postgresql_id" {
  byte_length = 8
  keepers = {
    pg_id = 1
  }
}

resource "random_pet" "postgres_admin_username" {
  length    = 3
  separator = ""
}

resource "random_password" "postgres_admin_password" {
  length  = 128
  special = false
}

resource "azurerm_private_dns_zone" "postgres_dns" {
  provider            = runtime
  name                = "${local.app_name}-${local.environment}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "postgres_subnet" {
  provider             = runtime
  name                 = "postgres"
  resource_group_name  = local.rg.name
  virtual_network_name = local.vnet.name
  address_prefixes     = [local.postgres_subnet_address_space]
  delegation {
    name = "flexiblePostgres"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

resource "azurerm_private_dns_zone_virtual_network_link" "vnet_link" {
  provider              = runtime
  name                  = azurerm_private_dns_zone.postgres_dns.name
  private_dns_zone_name = azurerm_private_dns_zone.postgres_dns.name
  virtual_network_id    = local.vnet.id
  resource_group_name   = local.rg.name
}

resource "azurerm_postgresql_flexible_server" "postgres" {
  provider               = runtime
  name                   = random_id.postgresql_id.hex
  resource_group_name    = local.rg.name
  location               = local.rg.location
  version                = local.postgres_version
  delegated_subnet_id    = azurerm_subnet.postgres_subnet.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres_dns.id
  administrator_login    = random_pet.postgres_admin_username.id
  administrator_password = random_password.postgres_admin_password.result
  zone                   = local.postgres_zone
  storage_mb             = local.postgres_storage_mb
  sku_name               = local.postgres_sku_name
  depends_on             = [azurerm_private_dns_zone_virtual_network_link.vnet_link]
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  provider  = runtime
  name      = "core"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_monitor_metric_alert" "postgres_cpu_over_threshold" {
  provider            = runtime
  name                = "postgres-cpu-over-threshold-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_postgresql_flexible_server.postgres.id]
  description         = "${local.environment} - Postgres server: CPU percentage average is greater than 95 in the last 5 minutes."
  frequency           = "PT5M"
  severity            = 3
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 95
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "postgres_memory_usage" {
  provider            = runtime
  name                = "postgres-memory-usage-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_postgresql_flexible_server.postgres.id]
  description         = "${local.environment} - Postgres server: Memory usage average is greater than 70% within the last hour."
  severity            = 3
  window_size         = "PT1H"
  frequency           = "PT30M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "memory_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 70
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_metric_alert" "postgres_storage_percent" {
  provider            = runtime
  name                = "postgres-storage-percent-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_postgresql_flexible_server.postgres.id]
  description         = "${local.environment} - Postgres server: Storage percent average is greater than 80% within the last hour."
  severity            = 3
  window_size         = "PT1H"
  frequency           = "PT30M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "storage_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_activity_log_alert" "postgres_health" {
  provider            = runtime
  name                = "postgres-health-${local.environment}"
  resource_group_name = local.rg.name
  scopes              = [azurerm_postgresql_flexible_server.postgres.id]
  description         = "${local.environment} - Postgres server: health check"

  criteria {
    resource_id    = azurerm_postgresql_flexible_server.postgres.id
    operation_name = "Microsoft.Resourcehealth/healthevent/Activated/action"
    category       = "ResourceHealth"
  }

  action {
    action_group_id = local.ag.id
  }
}

resource "azurerm_monitor_diagnostic_setting" "postgres" {
  provider                   = runtime
  name                       = "diag-postgres-${azurerm_postgresql_flexible_server.postgres.name}"
  target_resource_id         = azurerm_postgresql_flexible_server.postgres.id
  log_analytics_workspace_id = local.law.id

  log {
    category = "PostgreSQLLogs"
  }
  metric {
    category = "AllMetrics"
  }
}