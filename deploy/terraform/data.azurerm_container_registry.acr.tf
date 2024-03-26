data "azurerm_container_registry" "acr" {
  provider            = azurerm.infra
  name                = var.infra_container_registry_name
  resource_group_name = var.infra_resource_group_name
}