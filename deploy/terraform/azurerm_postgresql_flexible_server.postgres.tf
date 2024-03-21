resource "azurerm_postgresql_flexible_server" "postgres" {
  provider               = azurerm.runtime
  name                   = random_id.postgresql_id.hex
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "14"
  delegated_subnet_id    = azurerm_subnet.postgres_subnet.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres_dns.id
  administrator_login    = random_pet.postgres_admin_username.id
  administrator_password = random_password.postgres_admin_password.result
  zone                   = "1"
  storage_mb             = 32768
  sku_name               = var.postgres_sku_name
  depends_on             = [azurerm_private_dns_zone_virtual_network_link.vnet_link]
}