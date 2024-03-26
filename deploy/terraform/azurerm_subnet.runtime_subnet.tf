resource "azurerm_subnet" "runtime_subnet" {
  provider             = azurerm.runtime
  name                 = "runtime"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = [var.runtime_subnet_address_space]
  delegation {
    name = "appService"
    service_delegation {
      name = "Microsoft.Web/serverFarms"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}