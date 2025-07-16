#!/bin/sh

http --verify=no POST \
  https://localhost:5001/payment/checkout \
  @./create_checkout_session_request.json


