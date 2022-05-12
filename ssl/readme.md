# openssl for https server
---

## self signed certification
---
1. openssl genrsa -aes256 -out rootca.key 2048
2. openssl req -new -key rootca.key -out rootca.csr -config rootca.conf
3. openssl x509 -req -days 3650 -extensions v3_ca -in rootca.csr -signkey rootca.key -out rootca.crt -extfile rootca.conf

## server certification by my rootca
---
1. openssl genrsa -out ry.key
2. openssl req -new -key ry.key -out ry.csr -config ry.conf
3. openssl x509 -req -days 3650 -in ry.csr -extensions v3_req -CA rootca.crt -CAcreateserial -CAkey rootca.key -out ry.crt -extfile ry.conf
