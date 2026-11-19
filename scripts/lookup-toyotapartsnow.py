#!/usr/bin/env python3
"""Read ToyotaPartsNow's public product page for each part number (price only).

    python3 scripts/lookup-toyotapartsnow.py PN [PN ...]

ToyotaPartsNow is a retailer (Original Parts Giant): its price is one
comparable US price, and its "Compatible Vehicles" table is retailer evidence
only, printed here as a lead for dealer verification, never as proof of fit.
Requests are spaced six seconds apart; the script stops at the first non-200
answer so it never retries against a block.
"""
import html
import re
import subprocess
import sys
import time

UA = "Mozilla/5.0 (compatible; Claude-User; DrivoraParts catalog)"


def text(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


for pn in sys.argv[1:]:
    r = subprocess.run(["curl", "-s", "-m", "30", "-L", "-A", UA, "-w", "\n%{http_code} %{url_effective}",
                        f"https://www.toyotapartsnow.com/oem/toyota~{pn.lower()}"], capture_output=True, text=True)
    body, _, tail = r.stdout.rpartition("\n")
    code, _, url = tail.partition(" ")
    if code != "200":
        print(pn, "STOP http", code)
        break
    t = text(body)
    m = re.search(r"\$ ?([0-9,]+\.\d\d) MSRP: \$ ?([0-9,]+\.\d\d)", t)
    fit = re.search(r"Compatible Vehicles Year Make Model Trim Engine (.*?)(?: Q&A| Customer| Related|$)", t)
    name = re.search(r"Genuine Toyota ([^|]{3,80}?) \|", t) or re.search(r"<title>([^<]+)</title>", body)
    print(f"{pn}\tprice={m.group(1) if m else '-'}\tmsrp={m.group(2) if m else '-'}\t{url}")
    print("   name:", (name.group(1).strip() if name else "-")[:90])
    print("   fit :", (fit.group(1)[:600] if fit else "-"))
    time.sleep(6)
