resource "random_id" "app_id" {
  byte_length = 8
  keepers = {
    azi_id = 1
  }
}
