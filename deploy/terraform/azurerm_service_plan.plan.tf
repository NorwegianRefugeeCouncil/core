resource "azurerm_service_plan" "plan" {
  provider            = azurerm.runtime
  name                = "asp-${var.app_name}-${var.environment}"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "P1v2"
}
