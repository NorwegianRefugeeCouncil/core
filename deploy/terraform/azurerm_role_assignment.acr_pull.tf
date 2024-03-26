resource "azurerm_role_assignment" "acr_pull" {
  provider             = azurerm.runtime
  principal_id         = azurerm_user_assigned_identity.app.principal_id
  role_definition_name = "AcrPull"
  scope                = data.azurerm_container_registry.acr.id
}