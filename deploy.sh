#!/bin/bash

set -e

echo "Running static site build check..."
npm run build

echo "Build check complete."
echo ""
echo "The published site files are in the repository root:"
echo "  - index.html"
echo "  - academic.html"
echo "  - CS_Zihongluo.pdf"
echo "  - favicon.svg"
echo ""
echo "Next steps:"
echo "  1. git status"
echo "  2. git add -A"
echo "  3. git commit -m 'Update sanitized site'"
echo "  4. git push"
