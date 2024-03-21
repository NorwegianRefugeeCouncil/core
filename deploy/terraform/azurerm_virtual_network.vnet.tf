resource "azurerm_virtual_network" "vnet" {
  provider            = azurerm.runtime
  name                = "vnet-${var.app_name}-${var.environment}"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = [var.address_space]
}