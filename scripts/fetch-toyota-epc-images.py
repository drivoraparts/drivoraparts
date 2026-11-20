#!/usr/bin/env python3
"""Fetch Toyota's own catalog photos for part numbers, for the Toyota import.

    python3 scripts/fetch-toyota-epc-images.py <out-dir> PN [PN ...]

Toyota's parts site (autoparts.toyota.com) serves its product photos from
epc-images.toyota.com, keyed by part number, at two paths:
    https://epc-images.toyota.com/<PN>.webp              -> <out>/top_<PN>.webp
    https://epc-images.toyota.com/img/<PNNODASH>/<PNNODASH>_<n>.webp
                                                         -> <out>/<PNNODASH>_<n>.webp
    https://epc-images.toyota.com/<PN>_<n>.webp          -> <out>/pn_<PN>_<n>.webp
    https://epc-images.toyota.com/img/<PNNODASH>/<PN>_<n>.webp
                                                         -> <out>/imgpn_<PN>_<n>.webp
For a part number Toyota has no photo of, the host answers 200 with an HTML
"no image" page; anything that is not a WebP is discarded. Prints, per part
number, how many real photos were kept. Requests are spaced one second apart.
"""
import os
import subprocess
import sys
import time

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
UA = "Mozilla/5.0 (compatible; Claude-User; DrivoraParts catalog)"


def get(url, dest):
    r = subprocess.run(["curl", "-s", "-m", "30", "-A", UA, "-o", dest, "-w", "%{http_code}", url], capture_output=True, text=True)
    time.sleep(1)
    try:
        b = open(dest, "rb").read(12)
    except FileNotFoundError:
        return False
    if r.stdout == "200" and b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        return True
    os.remove(dest)
    return False


for pn in sys.argv[2:]:
    n = pn.replace("-", "")
    kept = []
    if get(f"https://epc-images.toyota.com/{pn}.webp", os.path.join(out, f"top_{pn}.webp")):
        kept.append(f"top_{pn}.webp")
    for i in (1, 2, 3):
        if get(f"https://epc-images.toyota.com/img/{n}/{n}_{i}.webp", os.path.join(out, f"{n}_{i}.webp")):
            kept.append(f"{n}_{i}.webp")
        elif i == 1:
            break
    for i in (1, 2, 3):
        if get(f"https://epc-images.toyota.com/{pn}_{i}.webp", os.path.join(out, f"pn_{pn}_{i}.webp")):
            kept.append(f"pn_{pn}_{i}.webp")
        else:
            break
    for i in (1, 2, 3):
        if get(f"https://epc-images.toyota.com/img/{n}/{pn}_{i}.webp", os.path.join(out, f"imgpn_{pn}_{i}.webp")):
            kept.append(f"imgpn_{pn}_{i}.webp")
        else:
            break
    print(pn, len(kept), " ".join(kept))
