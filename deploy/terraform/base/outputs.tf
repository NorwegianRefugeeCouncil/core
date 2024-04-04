output "rg" {
  value = azurerm_resource_group.rg
}

output "vnet" {
  value = azurerm_virtual_network.vnet
}

output "ag" {
  value = azurerm_monitor_action_group.ag_teams
}

output "law" {
  value = azurerm_log_analytics_workspace.law
}