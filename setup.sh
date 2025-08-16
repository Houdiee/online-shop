#!/bin/sh

pushd Api/
docker compose up -d
dotnet run &
stripe listen --forward-to http://localhost:5000/payment/webhook &
popd

pushd Frontend/
pnpm dev
popd
