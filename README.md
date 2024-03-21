# core

## Dependencies

### mkcert

#### on Linux

##### Install [homebrew](https://brew.sh/)

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

##### Install nss-tools and mkcert

```
sudo apt install libnss3-tools        # Debian, Ubuntu
sudo yum install nss-tools            # CentOS, RHEL
sudo pacman -S nss                    # Arch Linux
sudo zypper install mozilla-nss-tools # openSUSE
sudo dnf install nss-tools            # Fedora
brew install mkcert                   # Install mkcert
```

#### on macOS

```
brew install mkcert
brew install nss # if you use Firefox
```

### TLS certificates

```
./scripts/create-local-tls-certificate.sh
```

## Database migrations

You can create new database migrations by running:

```
npx knex migrate:make migration_name --knexfile libs/db/knexfile.ts
```

They will run automatically the next time you start the server.
