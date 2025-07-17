#!/bin/sh

http --verify=no POST \
  https://localhost:5001/users/1/shoppingcart \
  @./add_shopping_cart_item_request.json


