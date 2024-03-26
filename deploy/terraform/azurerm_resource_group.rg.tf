resource "azurerm_resource_group" "rg" {
  provider = azurerm.runtime
  location = var.location
  name     = "rg-${var.app_name}-${var.environment}"
}