#!/bin/bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dev_dir="$repo_root/dev"
dist_dir="$dev_dir/dist"

if [[ ! -f "$dev_dir/package.json" ]]; then
  echo "Error: local development source not found at $dev_dir" >&2
  exit 1
fi

echo "Building the private development site..."
npm --prefix "$dev_dir" run build

if find "$dist_dir" -type f -name '*.map' -print -quit | grep -q .; then
  echo "Error: source maps were generated; refusing to publish them." >&2
  exit 1
fi

echo "Publishing static build output to the repository root..."

published_files=(
  index.html
  academic.html
  CS_Zihongluo.pdf
  favicon.svg
  og-image.jpg
)

published_dirs=(
  assets
  models
  research
)

for file in "${published_files[@]}"; do
  cp "$dist_dir/$file" "$repo_root/$file"
done

for dir in "${published_dirs[@]}"; do
  mkdir -p "$repo_root/$dir"
  rsync -a --delete "$dist_dir/$dir/" "$repo_root/$dir/"
done

echo "Build output is ready for GitHub Pages."
echo ""
echo "Next steps:"
echo "  1. git status"
echo "  2. git add -A"
echo "  3. git commit -m 'Update site'"
echo "  4. git push"
