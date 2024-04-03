resource "azurerm_postgresql_flexible_server_database" "db" {
  provider  = azurerm.runtime
  name      = "core"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}