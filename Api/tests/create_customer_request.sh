!#/bin/sh

http --verify=no POST "https://localhost:5001/users" \
  @./create_customer_request.json

