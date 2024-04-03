resource "random_id" "postgresql_id" {
  byte_length = 8
  keepers = {
    pg_id = 1
  }
}
