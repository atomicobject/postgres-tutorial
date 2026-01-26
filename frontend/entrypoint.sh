#!/bin/sh
set -e

echo "Running database seed..."
npm run seed

echo "Starting dev server..."
exec npm run dev
