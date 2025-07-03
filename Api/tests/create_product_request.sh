!#/bin/sh

http --verify=no POST https://localhost:5001/products @./create_product_request.json
