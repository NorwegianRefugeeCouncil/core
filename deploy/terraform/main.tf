terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.27.0"
    }
  }
  backend "azurerm" {
  }
}

provider "azurerm" {
  alias           = "runtime"
  subscription_id = var.subscription_id
  features {
  }
}

provider "azurerm" {
  alias           = "infra"
  subscription_id = var.infra_subscription_id
  features {
  }
}

