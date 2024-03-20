#!/bin/bash

# Install the local CA
mkcert -install

# Generate the certificate
mkcert -cert-file config/certs/tls.crt -key-file config/certs/tls.key core.dev "*.core.dev" localhost 127.0.0.1 ::1
