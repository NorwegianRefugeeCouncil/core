resource "random_password" "postgres_admin_password" {
  length  = 128
  special = false
}