#!/usr/bin/env bash
# Rebuild every painted plate and cutout from source (offline; ~3-5 minutes).
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=${RAW:-/tmp/ke-art-raw}
mkdir -p "$RAW" assets/img
python3 tools/build_svgs.py
node tools/render_svg.mjs "$RAW" tools/svg/*.svg
for f in "$RAW"/*.png; do
  n=$(basename "$f" .png)
  if [[ $n == cut_paper* ]]; then
    python3 tools/paint.py "$f" "assets/img/${n#cut_}.webp" --cutout --border 14 --fine 2 --grain 3 &
  elif [[ $n == cut_* ]]; then
    python3 tools/paint.py "$f" "assets/img/${n#cut_}.webp" --cutout --border 12 --fine 2 &
  else
    python3 tools/paint.py "$f" "assets/img/$n.webp" --quality 80 &
  fi
  while (( $(jobs -r | wc -l) >= 4 )); do sleep 0.2; done
done
wait
python3 -c "import json;print('window.LAYOUT='+json.dumps(json.load(open('tools/svg/layout.json')))+';')" > js/layout.js
echo "art built"
