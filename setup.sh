#!/bin/sh

pushd Api/
docker compose up -d
dotnet run &
popd

pushd Frontend/
pnpm dev
popd
