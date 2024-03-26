resource "azurerm_user_assigned_identity" "app" {
  provider            = azurerm.runtime
  name                = "id-${var.app_name}-${var.environment}"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
}