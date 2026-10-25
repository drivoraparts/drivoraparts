# Catalog research log

Every package-contents entry that was researched from an outside source is recorded here: the listings it applies to, the source, the date it was checked, what was deliberately left out, and what is still open. Entries live in `lib/inventory/package-contents.ts`; each carries its `sources` so the page shows where the facts came from.

Rules used: manufacturer pages are the primary source; retailer pages are only used to cross-check. A listing is only updated when the source's part number or exact variant matches the listing. Where sources disagree, the disputed detail is left out and noted. Page text was read through a summarizing fetch tool and spot-checked against a second search result; re-verify before relying on any single figure.

## BD Diesel / D&J Heavy Hauler Ready Run engines (checked 2026-10-09)

| Listing | Part | Source |
|---|---|---|
| #3943 | DJPLB100102, 2004-2005 5.9L Cummins | us.bddiesel.com `heavy-hauler-ready-run-engine-dodge-ram-2500-3500-5-9l-cummins-2004-2005` |
| #3944 | DJPLB100101, 2006-2007 5.9L Cummins | `...-5-9l-cummins-2006-2007` |
| #3945 | DJPLB100100, 2007-2012 6.7L Cummins | `...-6-7l-cummins-2007-2012` |
| #3946 | DJPLB100098, 2013-2018 6.7L Cummins | `...-6-7l-cummins-2013-2018` |

Part numbers on each page matched the listing. Variants differ (heads, turbocharger, injectors) and are written out per listing.

Left out on purpose:
- Injector power rating on #3943 and #3944: the manufacturer page says up to 15 HP, a retailer says 30 HP. The manufacturer figure is used where the page states it; #3946's own page says 30 HP.
- Valve cover: each page's description says a new valve cover completes the package, but the component list does not include one. Not claimed. **Open: confirm with BD whether a valve cover ships.**
- Core deposit ($4,200 or $4,700 refundable) and warranty (24 months or 100,000 miles, parts): stated on the pages, not added to the listings because core charge and warranty are handled by the existing core-charge and warranty fields and policies. **Open: reconcile the listings' core charge and warranty fields with the manufacturer's figures.**
- Not for sale on licensed California vehicles (manufacturer wording): added to vehicle requirements.

## ATS Diesel Allison conversions (checked 2026-10-09)

Listings #3177, #3178, #3179, #3180 (Stage 3, 4, 5, 5; part numbers 319-932-2356, 319-943-2392, 319-953-2464, 319-955-2464).

Source: atsdiesel.com "Full Allison Conversion Kit, 2WD Ram Cummins 6.7L 2007.5-2019".

The page does **not** show these part numbers, lists the package contents generally under "Specific Parts Vary Depending On Year And Model", and describes Stages 1-4 only. So the general package list is attached to all four **with that qualifier stated on the page**, Stage 3 and 4 builds use the manufacturer's stage table, and Stage 5 is marked as not itemized. **Open: ask ATS for per-SKU contents for the 319-9xx numbers, especially the 4WD kit's transfer-case items.**

## BD Diesel / D&J Precision Plus engines (checked 2026-10-09)

| Listing | Part | Page |
|---|---|---|
| #3950 | DJPLB100092, Ready Run, 2004.5-2005 5.9L | `engine-package-dodge-ram-2500-3500-5-9l-cummins-2004-5-2007` |
| #3909 | DJPLB100097, Ready Run, 2006-2007 5.9L | `precision-plus-ready-run-engine-dodge-ram-2500-3500-5-9l-cummins-2006-2007` |
| #3948 | DJPLB100094, Ready Run, 2013-2018 6.7L | `engine-package-dodge-ram-2500-3500-6-7l-cummins-2013-2018` |
| #3949 | DJPLB100093, Ready Run, 2007.5-2012 6.7L | `engine-package-dodge-ram-2500-3500-6-7l-cummins-2007-5-2012` |
| #3960 | DJPLB100022, long block, 2013-2018 6.7L | `precision-plus-long-block-engine-dodge-ram-6-7l-cummins-2013-2018` |
| #3947 | DJPLB100086, long block, 2021-2024 6.7L | `precision-plus-long-block-engine-dodge-ram-6-7l-cummins-2021-2024` |
| #3952 | DJPLB100080, long block, 2019-2020 6.7L | `precision-plus-long-block-engine-dodge-ram-6-7l-cummins-2019-2020` |

All under https://us.bddiesel.com/products/. Part numbers matched on every page.

Left out or flagged:
- #3960: the manufacturer's description says 2007.5-2018 while its title and part number say 2013-2018. Both are stated on the listing as a "confirm your year" note. **Open: ask BD which years DJPLB100022 fits.**
- Valve cover: described in text, absent from component lists. Not claimed on any Ready Run listing.
- #3938 (DJPLB100099, 3500/4500/5500 cab and chassis): not on the pages fetched, so not updated.
- Long-block warranty terms: the pages disagree between fetches; not added.
- Not yet fetched: the short blocks #3900-#3903 and the Heavy Hauler long blocks #3953, #3957, #3959, #3962, #3965; Precision Plus long blocks #3963, #3966.

## BD Diesel transmission-only units (checked 2026-10-09)

| Listing | Part | Page (under https://us.bddiesel.com/products/) |
|---|---|---|
| #2205, #4119 | 1064294 / 1064292, TowMaster 68RFE 2019-2024 | `towmaster-ram-6-7l-cummins-68rfe-transmission-2019-2024` |
| #2744 | 1064264, TowMaster 68RFE 2007.5-2018 | `towmaster-dodge-68rfe-transmission-2007-5-2018` |
| #2721, #4118 | 1064294B / 1064292B, TorqueMaster 68RFE 2019-2024, billet shaft | `torquemaster-transmission-dodge-68rfe-2019-2024-c-w-billet-input-shaft` |
| #2807 | 1064264B, TorqueMaster 68RFE 2007.5-2018 4WD, billet shaft | `torquemaster-dodge-68rfe-transmission-2007-5-2018-4wd-c-w-billet-input-shaft` |
| #2773 | 1064744, TowMaster Allison 1000, 2007-2010 LMM 4WD | `towmaster-chevy-allison-1000-transmission-2007-2010-lmm-4wd` |
| #2803 | 1064444F, TowMaster 4R100 1999-2003 4WD | `towmaster-ford-4r100-transmission-1999-2003-4wd` |
| #2793 | 1064494, TowMaster 5R110 2008-2010 6.4L 4WD | `towmaster-ford-5r110-transmission-2008-2010-6-4l-power-stroke-4wd` |

What this adds that customers need: BD's transmission-only pages state that a **BD torque converter is required and not included** (installed at the same time; a third-party or factory converter voids the transmission warranty), that **2019-and-newer applications need special tuning** to raise line pressure and that the **line pressure controller is not included**, a 300-mile break-in advisory, and installation times. These are listed as Required Separately, Programming and Tuning and Installation on each listing. The 5R110 page says nothing about a converter, so none is claimed there.

Second round (same day):

| Listing | Part | Page |
|---|---|---|
| #2745, #4173 | 1064194F, TowMaster 48RE 2003-2004 | `towmaster-dodge-48re-transmission-2003-2004` |
| #2724, #4122 | 1064234F, TowMaster 48RE 2005-2007 with TVV stepper motor | `towmaster-dodge-48re-transmission-2005-2007-w-tvv-stepper-motor` |
| #2731, #4130 | 1064184F, TowMaster 47RE 2000-2002 | `towmaster-dodge-47re-transmission-2000-2002` |
| #2796 | 1064484, TowMaster 5R110 2005-2007 4WD | `towmaster-ford-5r110-transmission-2005-2007-4wd` |
| #2788 | 1064704, TowMaster Allison 1000, 2001-2004 LB7 4WD | `towmaster-chevy-allison-1000-transmission-2001-2004-lb7-4wd` |

For the 47RE and 48RE units the page's feature list mentions a new-model shift lever, BD control module, gear selection display and wiring harness (the TapShift items) and says the auxiliary filter kit comes with "most packages". The pages do not say whether these come with the plain unit, so the listings state that as "confirm before ordering" instead of listing them as included. The 47RE page also names an "Upgraded 48RE sunshell" and attaches the burst-pressure claim to a different part than the 48RE pages do; both are left out.

Skipped on purpose: #2808 (our SKU 1064234F, but BD's TapShifter page is 1064234FT, a different part); the 47RH page (404); the LLY and LMM 2WD Allison pages (404); the LML Allison unit (BD's page for it is a different product, billet input with triple-torque and controller).

Left out or flagged:
- #2205/#4119 and #2721/#4118: each page lists 4WD and 2WD variants without separate part numbers, so the page is applied to both listings and says so. **Open: confirm the 2WD part numbers (1064292, 1064292B) with BD.**
- The 4R100 page contradicts itself on whether the base unit has PTO provision; stated as "confirm with us".
- Warranty and core deposit figures differ by page ($1,200 to $1,800 core on the units fetched); not added, because the listings' own core-charge and warranty fields govern. **Open: reconcile those fields with BD's figures.**
- Two earlier URL guesses returned 404 (the 4WD-suffixed TowMaster 68RFE slug), and BD's collection pages show only 12 of 43 products, so product URLs came from site-restricted searches and were then fetched directly.

Third round (same day):

| Listing | Part | Page (under https://us.bddiesel.com/products/) |
|---|---|---|
| #2726, #4125 | 1064302-series Roadmaster 68RFE 2007.5-2018 | `roadmaster-dodge-68rfe-transmission-2007-5-2018` |
| #2804 | 1064442FPTO, TowMaster 4R100 2WD with PTO | `towmaster-ford-4r100-transmission-1999-2003-2wd-pto` |

#2726 and #4125 share one page (4WD and 2WD, no separate displayed SKU); #4125 says so. The Roadmaster adds no clutches (stock counts); the page frames it for stock or mildly tuned trucks.

**Transmission & Converter Packages** (converter included, unlike the transmission-only units):

| Listing | Part | Page |
|---|---|---|
| #2204 | 1064304SS, Roadmaster 68RFE 2019-2024 | `roadmaster-68rfe-transmission-converter-package-ram-6-7l-cummins-2019-2024` |
| #2768 | 1064264SS, TowMaster 68RFE 2007.5-2018 | `towmaster-dodge-68rfe-transmission-converter-package-2007-5-2018` |
| #2723 | 1064234SS, TowMaster 48RE 2005-2007 TVV | `towmaster-dodge-48re-transmission-converter-package-2005-2007-w-tvv-stepper-motor` |

Left out or flagged:
- #2722 (1064234SST, TapShifter) is a different part from the page's 1064234SS; not updated. #4116 (1064302SS), #4195 (1064262SS), #4120/#4121 (1064232SS) are the 2WD-style numbers that the pages do not display; not updated.
- #2723: the page shows both a ProForce 3D (triple-disc) and a standard ProForce converter section without saying which ships; stated as "confirm". Billet input shaft and auxiliary filter kit are options, not included. Remote filter required.
- 2019-and-newer package (#2204): special tuning needed; the line pressure controller is not included. **Open: BD's 2WD part numbers for these three pages.**

**Allison 1000 packages (Duramax)**, same day:

| Listing | Part | Page (under https://us.bddiesel.com/products/) |
|---|---|---|
| #2771 | 1064744SS, TowMaster LMM 2007-2010 4WD | `duramax-allison-transmission-converter-package-lml` (slug says "lml"; the page content is the LMM 4WD package and its part number matched) |
| #2786, #2789 | 1064704SS TowMaster LB7 4WD; 2WD sibling 1064702SS | `towmaster-chevy-allison-1000-transmission-converter-package-2001-2004-lb7-4wd` |
| #2787 | 1064704BM, TorqueMaster LB7 4WD, billet input and triple-disc converter | `torquemaster-chevy-allison-1000-transmission-converter-package-c-w-billet-input-triple-torque-2001-2004-lb7-4wd` |
| #2701, #4051 | 1064854SS Roadmaster LB7 4WD; 2WD sibling 1064852SS | `roadmaster-transmission-converter-package-allison-1000-chevrolet-silverado-gmc-sierra-2500hd-3500hd-6-6l-lb7-duramax-2001-2004` |

The converter is included in these packages. The pages state no break-in or tuning requirement, so none is claimed. "Triple Torque" is not defined on the TorqueMaster page beyond the triple-disc converter, so only that is stated. Warranty and core ($2,000-$2,100) and price differ from the listings' own fields and are not copied; the pages also mark the 4WD variant "sold out or unavailable", which we do not carry over. Not applied: the LMM TorqueMaster (#2772/#2775), LLY, LBZ, LML and L5P packages, because their pages were not fetched. Open: BD's 2WD part numbers.

LLY: #2781 (1064724SS, TowMaster 5-speed 4WD) and its 2WD sibling #2784 (1064722SS), page `towmaster-chevy-allison-1000-transmission-converter-package-2004-5-2006-lly-5-speed-4wd`. The page does not itemize the package beyond the unit's features and the converter, and no clutch counts, so none are claimed.

LBZ 2006-2007 (checked 2026-10-09, pages under https://us.bddiesel.com/products/):

| Listing | Part | Page |
|---|---|---|
| #2777, #2779 | 1064734SS TowMaster 4WD; 2WD sibling 1064732SS | `towmaster-chevy-allison-1000-transmission-converter-package-2006-2007-lbz-6-speed-4wd` |
| #2700, #4050 | 1064864SS Roadmaster; 2WD sibling 1064862SS | `roadmaster-transmission-converter-package-allison-1000-chevrolet-silverado-gmc-sierra-2500hd-3500hd-6-6l-lbz-duramax-2006-2007` |
| #2780, #2778 | 1064732BM TorqueMaster 2WD; 4WD sibling 1064734BM | `torquemaster-chevy-allison-1000-transmission-converter-package-c-w-billet-input-triple-torque-2006-2007-lbz-6-speed-2wd` |

The TowMaster page says it is a matched transmission and converter set without itemizing the converter; the converter features it lists are attached on that basis. The TorqueMaster page gives a 7-hour install against 9 hours on the TowMaster; both are stated as the page says. A search summary claimed 75% more C3 clutches on the TorqueMaster; the fetched page says 50%, which is what is used. The Roadmaster page does not mention revised oil circuits, so none is claimed.

LMM Roadmaster: #2699 (1064874SS), page `roadmaster-transmission-converter-package-allison-1000-chevrolet-silverado-gmc-sierra-2500hd-3500hd-6-6l-lmm-duramax-2007-5-2010`. The page's part number matched; it lists no separate 4WD/2WD numbers.

LMM and LML TorqueMaster/TowMaster (checked 2026-10-09, pages under https://us.bddiesel.com/products/):

| Listing | Part | Page |
|---|---|---|
| #2775, #2772 | 1064742BM TorqueMaster LMM 2WD; 4WD sibling 1064744BM | `torquemaster-chevy-allison-1000-transmission-converter-package-c-w-billet-input-triple-torque-2007-2010-lmm-2wd` |
| #2769 | 1064754BM TorqueMaster LML 4WD | `torquemaster-chevy-allison-transmission-converter-package-c-w-billet-input-triple-torque-controller-2011-2016-lml-4wd` |
| #2770 | 1064754 TowMaster LML transmission only | `towmaster-chevy-allison-transmission-c-w-billet-input-triple-torque-controller-2011-2016-lml-4wd` |

The LML titles mention a "Controller" or Pressure Box, but the pages give no details, so the listings say to confirm it. The LML TowMaster transmission-only page says a BD converter must be installed with it, so that is stated as required separately. #2209 (1064754SM, TowMaster LML package) is a different part number from either page and was not updated.

48RE 2003-2004 package and 5R110 2008-2010 packages (checked 2026-10-09, pages under https://us.bddiesel.com/products/):

| Listing | Part | Page |
|---|---|---|
| #2728, #4127 | 1064194SS TowMaster 48RE 4WD; 2WD sibling 1064192SS | `towmaster-transmission-converter-package-dodge-48re-2003-2004` |
| #2792 | 1064494SM TowMaster 5R110 6.4L 4WD | `towmaster-ford-5r110-transmission-converter-package-2008-2010-6-4l-power-stroke-4wd` |
| #2749, #4176 | 1064652SM Roadmaster 5R110 6.4L; flange sibling 1064654SM | `roadmaster-5r110-transmission-converter-package-ford-6-4l-power-stroke-f250-f350-2008-2010` |

Not updated: the TapShifter SST variants (#2727, #4126), because the page shows no TapShifter variant and names a different part number; #2794 (1064492SM, 2WD slip yoke), because the TowMaster page's variant selector shows only 4WD/2WD flange. The 48RE package page lists an install time of 8 hours and an optional auxiliary filter kit and billet input shaft; neither is claimed as included. Core ($2,000-$2,500) and warranty are not copied.

47RE Transmission & Converter Packages (checked 2026-10-09, pages under https://us.bddiesel.com/products/):

| Listing | Part | Page |
|---|---|---|
| #2730, #4129 | 1064184SS TowMaster 2000-2002 4WD; 2WD sibling 1064182SS | `towmaster-transmission-converter-package-dodge-47re-2000-2002` |
| #2818 | 1064174SS 1998.5-1999 24-valve 4WD | `towmaster-dodge-47re-transmission-converter-package-1998-5-1999-24-valve-4wd` |
| #2823 | 1064164SS 1996-1998 12-valve 4WD | `towmaster-dodge-47re-transmission-converter-package-1996-1998-12-valve-4wd` |
| #2825 | 1064162SS 1996-1997 2WD, speed sensor and speedo head | `towmaster-dodge-47re-transmission-converter-package-1996-1997-2wd-w-speed-sensor-speedo-head` |
| #2822 | 1064172SS 1997-1999 2WD, speed sensor only | `towmaster-dodge-47re-transmission-converter-package-1997-1999-2wd-w-speed-sensor-only-no-speedo-head` |

Flagged: the 2000-2002 page describes both a ProForce 3D and a standard ProForce converter without saying which ships, so the converter is a "confirm" item there. The auxiliary filter kit is listed among features on every page except 1996-1997, but none says it is included; it is stated as "confirm" rather than included. The "upgraded 48RE sunshell" named on each page is left out, as on the transmission-only 47RE units. Core ($2,500) and warranty are not copied. Open: BD's 2WD part number for the 2000-2002 page.

6R140 packages (checked 2026-10-09, pages under https://us.bddiesel.com/products/):

| Listing | Part | Page |
|---|---|---|
| #2790 | 1064514SS TowMaster 2017-2019 | `towmaster-ford-6r140-transmission-converter-package-2017-2019-6-7l-power-stroke-2wd-4wd` |
| #2207 | 1064534SS Roadmaster 2017-2019 | `roadmaster-6r140-2wd-4wd-transmission-converter-package-ford-6-7l-power-stroke-2017-2019` |
| #2761 | 1064504BM TorqueMaster 2011-2016 | `torquemaster-ford-6r140-transmission-converter-package-6-7l-power-stroke-2011-2016-2wd-4wd` |
| #2206 | 1064524SS Roadmaster 2011-2016 | `roadmaster-6r140-4wd-transmission-converter-package-ford-6-7l-power-stroke-2011-2016` |

Each page shows one part number for 2WD and 4WD. Flagged: the TowMaster and TorqueMaster pages list an electronic line pressure controller among the features but do not clearly say it is included (the Roadmaster pages do list it), so it is a "confirm" item on those two and not claimed. Not updated: #2791 (TowMaster 2011-2016, 1064504SS) and #2760 (TorqueMaster 2017-2019, 1064514BM), whose own product pages were not found. Core ($1,200), warranty and the 24/36-month figures are not copied.

Roadmaster 10R80, 6L80, 66RFE and E4OD packages (checked 2026-10-09, pages under https://us.bddiesel.com/products/):

| Listing | Part | Page |
|---|---|---|
| #2752, #4179 | 1064624SS F-150 5.0L V8 4WD; 1064622SS 2WD (named in the page's image text) | `roadmaster-ford-10r80-transmission-converter-package-f-150-5-0l-v8-2018-2020` |
| #2715 | 1064614SS F-150 V6 4WD | `roadmaster-ford-10r80-transmission-converter-package-f-150-2-7l-3-5l-v6-2018-2020` |
| #2716, #4112 | 1064604SS F-150 3.0L Power Stroke 2018-2020; 2WD sibling 1064602SS | `roadmaster-transmission-converter-package-10r80-ford-f-150-3-0l-power-stroke-diesel-2018-2020` |
| #2712, #4109 | 1064694SS 2017 F-150 (park-by-wire); 1064692SS conventional shifter (named in the FAQ) | `roadmaster-transmission-converter-package-10r80-ford-f150-2-7l-3-5l-ecoboost-raptor-2017` |
| #2713 | 1064674SS 2021-2024 F-150/Expedition/Raptor | `roadmaster-transmission-converter-package-10r80-ecoboost-f150-3-5l-2-7l-2021-2024-expedition-navigator-raptor-3-5l-2021-2024-2wd-2022-2024-4wd` |
| #2710, #4108 | 1064844SS 6L80 Silverado/Sierra 1500; 1064842SS 2WD sibling | `roadmaster-6l80-transmission-converter-package-chevy-gmc-1500-2014-2021` |
| #2706, #4070 | 1064914SS 66RFE Ram HEMI; 1064912SS 2WD sibling | `roadmaster-transmission-converter-package-66rfe-ram-2500-3500-5-7l-6-4l-hemi-2012-2018` |
| #2758, #4190 | 1064074SS E4OD 7.3L; 1064072SS 2WD sibling (image text only) | `roadmaster-transmission-converter-package-e4od-ford-f250-f350-7-3l-power-stroke-1995-1997` |

Conflicts on BD's own pages, stated as "confirm" or left out: installation time (11 h 30 min in the specification vs about 10-13 h in the FAQ) on the 10R80 pages; tuning (a Ford scanner relearn in the notes vs "no tuning needed" in the FAQ) on the V8 and V6 pages; core deposit ($1,500 banner vs $2,750 in the V6 FAQ, not copied). The 10R80 pages' claim of about 30% more line pressure appears only in a FAQ, not in the feature list, so it is not claimed. #4111 (1064612SS) is not updated because the V6 page lists it as V6 2WD in one place and says the package is not for 2WD in another. Not fetched: Transit #2707, 2018-2021 Expedition #2714, 2021 3.0L PSD #2717/#4113.

L5P (#2210, #2211, #4048, #4052): no individual product page could be found (only collection pages and a blog post, which disagree on price and give no itemized contents), so nothing was applied. Open: locate the L5P product pages or ask BD.

Not yet researched: the remaining BD transmission-only and package listings (about 15: 2WD siblings, Roadmaster 2019-2024 transmission-only, 47RH/E4OD, other Allison 1000 units, 66RFE, 10R80, 6L80 and the other converter packages).

## Not researched yet

Everything else. See `docs/catalog-progress-log.csv` for per-listing status and `docs/supplier-confirmation-worksheet.csv` for the families still needing contents.
