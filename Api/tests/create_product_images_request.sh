#!/bin/sh

if [ -z "$1" ]; then
  echo "Expected argument 'variantId'"
  exit
fi

variantId="$1"

# Original Monster
http --form --verify=no POST "https://localhost:5001/products/images/${variantId}" \
  files@./images/original_monster_24_pack.jpg \
  files@./images/original_monster.jpg

# White Monster
http --form --verify=no POST "https://localhost:5001/products/images/$((variantId + 1))" \
  files@./images/white_monster_24_pack.jpg \
  files@./images/white_monster.jpg

# Mango Monster
http --form --verify=no POST "https://localhost:5001/products/images/$((variantId + 2))" \
  files@./images/mango_monster_24_pack.jpg \
  files@./images/mango_monster.jpg
