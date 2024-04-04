output "admin_user" {
  value = {
    username = random_pet.postgres_admin_username.id
    password = random_password.postgres_admin_password.result
  }
}

output "postgres" {
  value = azurerm_postgresql_flexible_server.postgres
}

output "db" {
  value = azurerm_postgresql_flexible_server_database.db
}