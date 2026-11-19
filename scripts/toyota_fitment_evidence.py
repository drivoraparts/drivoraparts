"""Toyota fitment evidence for expansion batch 1 (audited 2026-11-18).

Every vehicle application of every batch-1 record, with the catalog evidence
behind it. scripts/build-toyota-expansion-batch.py builds each record's
`fitmentApplications` ONLY from applications whose status here is
`verified` or `vin_dependent`; everything else is recorded for review and
never shown as fitment.

Statuses
  verified       A Toyota or US Toyota-dealer parts catalog lists this part
                 number for this model, year range and engine, with no
                 conflicting note found.
  vin_dependent  A Toyota or US Toyota-dealer catalog lists the application,
                 but with a restriction (production date, assembly origin,
                 trim, drivetrain, hybrid / non-hybrid, option) that only the
                 vehicle's VIN resolves. Listed with the restriction stated.
  unresolved     Evidence is missing, retailer-only, or conflicting. NOT
                 listed. `reason` says exactly what is missing.
  removed        Was in the staged record and is contradicted by evidence.
                 NOT listed. `reason` says why.

Evidence kinds
  toyota_official   autoparts.toyota.com (Toyota's own parts site)
  dealer_catalog    US Toyota dealer parts catalogs (dealer-run stores such
                    as toyotapartsdeal.com, toyotapartsnow.com, Lakeland,
                    Olathe, Northpark, Sparks, Lithia, Frontier ...)
  dealer_catalog_ca Canadian Toyota dealer catalog (Canada-market EPC data;
                    corroborating only)
  service_doc       Toyota-derived service / parts document
  retailer          Non-dealer retailer or marketplace (never sufficient)
  secondary         Guides, forums, overseas retailers (never sufficient)

No VIN-level catalog lookup was performed for any application: evidence came
from dealer catalog pages as indexed by search on the audit date. Nothing
here claims VIN-level confirmation (`vinLookupPerformed` is False on every
record).
"""

AUDITED = "2026-11-18"

TD = "https://www.toyotapartsdeal.com"
TN = "https://www.toyotapartsnow.com"
TA = "https://autoparts.toyota.com/products/product"
OL = "https://parts.olathetoyota.com/oem-parts"
SP = "https://www.sparksparts.com/oem-parts"
LK = "https://parts.lakelandtoyota.com/p"
SC = "https://parts.scarboroughtoyota.ca/p"


def E(kind, source, url, note=""):
    return {"kind": kind, "source": source, "url": url, "note": note}


def A(y1, y2, model, engine, status, evidence, restriction=None, origin=None, production=None, reason=None):
    """One vehicle application. `restriction` is shown with the listing."""
    return {
        "yearFrom": y1, "yearTo": y2, "make": "Toyota", "model": model,
        "engine": engine, "restriction": restriction, "assemblyOrigin": origin,
        "productionDates": production, "status": status, "evidence": evidence,
        "reason": reason,
    }


def S(pn, rel, evidence, status="verified", reason=None):
    """Supersession: `rel` is 'supersedes' (pn is older) or 'superseded_by'."""
    return {"partNumber": pn, "relation": rel, "status": status, "evidence": evidence, "reason": reason}


# fmt: off
EVIDENCE = {
    # ------------------------------------------------------------------ air filters
    "17801-F0050": dict(
        apps=[
            A(2019, 2023, "RAV4", "A25A-FKS 2.5L", "verified",
              [E("dealer_catalog", "ToyotaPartsNow (part page, 2019-2023 RAV4 2.5L trims)", f"{TN}/oem/toyota~air-filter-element-sub-assembly~17801-f0050"),
               E("dealer_catalog", "Lakeland Toyota (RAV4 LE)", f"{LK}/TOYOTA__RAV-4-LE/Engine-Air-Filter/14760743/17801F0050.html")],
              restriction="gas, non-hybrid"),
            A(2024, 2024, "RAV4", "A25A-FKS 2.5L", "unresolved",
              [E("dealer_catalog", "Direct Factory Parts (part-level 2018-2025)", "https://www.directfactoryparts.com/oem-parts/toyota-air-filter-17801f0050")],
              reason="Only a part-level year range covers 2024; no 2024 RAV4 catalog page seen. ToyotaPartsNow lists RAV4 through 2023."),
            A(2018, 2024, "Camry", "A25A-FKS 2.5L", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~element~sub~assy~ai~17801-f0050.html"),
               E("dealer_catalog", "ToyotaPartsNow (part page, 2018-2024)", f"{TN}/oem/toyota~air-filter-element-sub-assembly~17801-f0050")],
              restriction="gas, non-hybrid"),
            A(2018, 2024, "Camry", "2GR-FKS 3.5L V6", "removed",
              [E("dealer_catalog", "aggregator dealer page (fragmented Camry 3.5L note)", f"{OL}/toyota-air-filter-17801f0050")],
              reason="Camry V6 entry appears only in a fragmented dealer note; not confirmed by any catalog page."),
        ],
        supersession=[S("17801-25020", "supersedes", [E("toyota_official", "Toyota parts (previous versions)", f"{TA}/element-sub-assy-air-cleaner-filter-17801f0050")]),
                      S("17801-F0070", "supersedes", [E("toyota_official", "Toyota parts (previous versions)", f"{TA}/element-sub-assy-air-cleaner-filter-17801f0050")])],
    ),
    "17801-0P100": dict(
        apps=[A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "vin_dependent",
                [E("dealer_catalog", "Northpark Toyota (3.5L, without snorkel type)", "https://parts.northparktoyota.com/oem-parts/toyota-air-filter-178010p100"),
                 E("dealer_catalog", "ToyotaPartsDeal (2022 Tacoma)", f"{TD}/oem-2022-toyota-tacoma-air_filter.html")],
                restriction="without snorkel")],
        supersession=[S("17801-0S020", "supersedes", [E("dealer_catalog", "Sparks Toyota", f"{SP}/toyota-toyota-air-filter-element-sequoia-tacoma-178010p100")])],
    ),
    "17801-0C040": dict(
        apps=[A(2016, 2023, "Tacoma", "2TR-FE 2.7L", "verified",
                [E("dealer_catalog", "Toyota of Anaheim", "https://parts.toyotaofanaheim.com/oem-parts/toyota-air-filter-178010c040"),
                 E("dealer_catalog", "Northpark Toyota", "https://parts.northparktoyota.com/oem-parts/toyota-air-filter-178010c040")])],
    ),
    "17801-0P051": dict(
        apps=[A(2024, 2025, "Tacoma", "T24A-FTS 2.4L turbo", "vin_dependent",
                [E("dealer_catalog", "ToyotaPartsDeal (2025 Tacoma, TZNA submodels)", f"{TD}/oem-2025-toyota-tacoma-air_filter.html"),
                 E("dealer_catalog", "ToyotaPartsDeal (2024 Tacoma: 17801-31131 replaced by 17801-0P051)", f"{TD}/oem-2024-toyota-tacoma-air_filter.html")],
                restriction="2.4L turbo; i-FORCE MAX hybrid coverage by VIN")],
        supersession=[S("17801-31131", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal (2024 Tacoma)", f"{TD}/oem-2024-toyota-tacoma-air_filter.html")])],
    ),
    "17801-38051": dict(
        apps=[A(2010, 2024, "4Runner", "1GR-FE 4.0L V6", "verified",
                [E("dealer_catalog", "Sparks Toyota (2010-2024 4Runner / FJ Cruiser)", f"{SP}/toyota-2010-2024-toyota-air-filter-fj-cruiser-4runner-1780138051"),
                 E("dealer_catalog", "ToyotaPartsDeal (2010 4Runner)", f"{TD}/oem-2010-toyota-4runner-air_filter.html")])],
        supersession=[S("17801-38050", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal (17801-YZZ13 replaces 17801-38050, 17801-38051)", f"{TD}/oem/toyota~element~sub~assy~ai~17801-yzz13.html")]),
                      S("17801-YZZ13", "superseded_by", [E("dealer_catalog", "ToyotaPartsDeal (17801-YZZ13 replaces 17801-38051)", f"{TD}/oem/toyota~element~sub~assy~ai~17801-yzz13.html"),
                                                         E("dealer_catalog", "Sparks Toyota (17801-YZZ13)", f"{SP}/toyota-air-filter-17801yzz13")])],
        blocking=["Superseded: 17801-38051 is replaced by 17801-YZZ13. List and re-price under the current number 17801-YZZ13; pricing here is for the old number."],
    ),
    "17801-F0020": dict(
        apps=[
            A(2018, 2024, "Camry", "A25A-FXS 2.5L hybrid", "verified",
              [E("dealer_catalog", "Sparks Toyota (2018+ Camry Hybrid A25A-FXS)", f"{SP}/toyota-2018-2024-toyota-air-filter-17801f0020"),
               E("dealer_catalog", "ToyotaPartsNow (2023 Camry Hybrid LE/SE/XLE/XSE)", f"{TN}/parts-select/2023-toyota-camry-air-filter")],
              restriction="hybrid"),
            A(2020, 2022, "Corolla", "2ZR-FAE 1.8L", "vin_dependent",
              [E("dealer_catalog", "Sparks Toyota (2020+ Corolla 2ZR-FAE)", f"{SP}/toyota-2018-2024-toyota-air-filter-17801f0020")],
              restriction="1.8L gas, non-hybrid"),
            A(2020, 2024, "Corolla", "M20A-FKS 2.0L", "vin_dependent",
              [E("dealer_catalog", "Sparks Toyota (2020+ Corolla M20A-FKS)", f"{SP}/toyota-2018-2024-toyota-air-filter-17801f0020")],
              restriction="2.0L gas; one retailer page lists 1.8L only"),
            A(2020, 2024, "Corolla", "2ZR-FXE 1.8L hybrid", "removed", [],
              reason="Dealer notes say 'W/O Hybrid' and name the 2ZR-FAE (gas) engine; the staged '1.8L Hybrid' claim is contradicted."),
        ],
        supersession=[S("17801-F0030", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed in this audit."),
                      S("17801-77050", "supersedes", [E("dealer_catalog", "ToyotaPartsNow (17801-77050 replaced by 17801-F0020)", f"{TN}/oem/toyota~air-filter-element-sub-assembly~17801-77050")],
                        status="unresolved", reason="One dealer catalog says 17801-77050 is replaced by 17801-F0020, but 17801-77050 is also cited as the current RAV4 Hybrid filter. Not used.")],
    ),
    # ------------------------------------------------------------------ oil filters
    "04152-YZZA1": dict(
        apps=[
            A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "verified",
              [E("dealer_catalog", "ToyotaPartsNow (2020 Tacoma 6 Cyl 3.5L; 2.7L uses 90915-YZZD1)", f"{TN}/parts-select/2020-toyota-tacoma-oil-filter"),
               E("dealer_catalog", "ToyotaPartsDeal (2017 Tacoma)", f"{TD}/oem-2017-toyota-tacoma-oil_filter.html")]),
            A(2018, 2024, "Camry", "2GR-FKS 3.5L V6", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsNow (2018 Camry, 3.5L)", f"{TN}/parts-select/2018-toyota-camry-oil-filter"),
               E("secondary", "Repco NZ (2.5L spin-on, 3.5L cartridge)", "https://www.repco.co.nz/parts-finder/2022-toyota-camry/oil-filter")],
              restriction="3.5L V6", origin="North American-built", production="from 11/2017 (dealer note: 'Exc. Japan built')"),
            A(2017, 2022, "Highlander", "2GR-FKS 3.5L V6", "vin_dependent",
              [E("dealer_catalog_ca", "Scarborough Toyota (Avalon, Camry, Highlander, RAV4, Sienna, Tacoma, Venza; 3.5L)", f"{SC}/Toyota_2018_/Engine-Oil-Filter-Element/49507508/04152YZZA1.html"),
               E("toyota_official", "Toyota parts (part page)", f"{TA}/replaceable-element-oil-filter-04152yzza1")],
              restriction="3.5L V6"),
            A(2023, 2023, "Highlander", "2GR-FKS 3.5L V6", "removed", [],
              reason="The 2023 Highlander has no 3.5L V6 (2.4L turbo and 2.5L hybrid only); the staged 2017-2023 range was wrong."),
            A(2018, 2024, "Camry", "A25A-FKS 2.5L", "removed",
              [E("dealer_catalog", "ToyotaPartsDeal (2020 Camry: 90915-YZZN1, US built, 2.5L)", f"{TD}/oem-2020-toyota-camry-oil_filter.html")],
              reason="The 2.5L A25A-FKS takes spin-on 90915-YZZN1 per dealer catalogs; a cartridge element is not claimed for it."),
            A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "removed",
              [E("dealer_catalog", "Lakeland Toyota (2023/2024 RAV4: 90915-YZZN1)", f"{LK}/toyota_2023_RAV4/Engine-Oil-Filter/16359139/90915YZZN1.html")],
              reason="Dealer catalogs list spin-on 90915-YZZN1 / 90915-10009 for the 2019+ RAV4 2.5L; 04152-YZZA1 belongs to the 2013-2018 RAV4."),
        ],
        supersession=[S("04152-31090", "supersedes", [E("dealer_catalog_ca", "Scarborough Toyota (supersessions)", f"{SC}/Toyota_2017_/Engine-Oil-Filter-Element/49507508/04152YZZA1.html")]),
                      S("04152-31110", "supersedes", [E("dealer_catalog_ca", "Scarborough Toyota (supersessions)", f"{SC}/Toyota_2017_/Engine-Oil-Filter-Element/49507508/04152YZZA1.html")]),
                      S("04152-0V010", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal (04152-0V010 replaced by 04152-YZZA1)", f"{TD}/oem/toyota~element~kit~oil~fil~04152-0v010.html")])],
    ),
    "04152-YZZA6": dict(
        apps=[
            A(2009, 2017, "Corolla", "2ZR-FE 1.8L", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (part page, 2008-2017)", f"{TD}/oem/toyota~replaceable~element~04152-yzza6.html"),
               E("toyota_official", "Toyota parts (part page)", f"{TA}/replaceable-element-oil-filter-04152yzza6")],
              restriction="1.8L"),
            A(2018, 2018, "Corolla", "2ZR-FE 1.8L", "removed", [],
              reason="Dealer part-level range ends 2017; no 2018 catalog evidence."),
        ],
        supersession=[S("04152-37010", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed in this audit.")],
    ),
    "90915-YZZD3": dict(
        apps=[
            A(2005, 2015, "Tacoma", "1GR-FE 4.0L V6", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~filter~oil~90915-YZZD3.html"),
               E("dealer_catalog", "NuCar Toyota (1984-2015 Tacoma, Tundra, 4Runner, FJ Cruiser)", "https://toyotaparts.nucar.com/parts/toyota-1984-2015-toyota-engine-oil-filter-tacoma-tundra-4runner-fj-cruiser-land-cruiser-90915yzzd3")],
              restriction="4.0L V6"),
            A(2003, 2009, "4Runner", "1GR-FE 4.0L V6 / 2UZ-FE 4.7L V8", "verified",
              [E("dealer_catalog", "ToyotaPartsNow (part page)", f"{TN}/oem/toyota~filter-oil~90915-yzzd3")]),
            A(2000, 2009, "Tundra", "2UZ-FE 4.7L V8", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~filter~oil~90915-YZZD3.html")],
              restriction="4.7L V8"),
            A(2005, 2010, "Tundra", "1GR-FE 4.0L V6", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsNow (part page; end year 2010-2011 varies)", f"{TN}/oem/toyota~filter-oil~90915-yzzd3")],
              restriction="4.0L V6; 2011+ 4.0L uses 04152-YZZA5"),
        ],
    ),
    "90915-YZZN3": dict(
        apps=[
            A(2022, 2025, "Tundra", "V35A-FTS 3.4L twin-turbo V6", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (2022 Tundra)", f"{TD}/oem-2022-toyota-tundra-oil_filter.html"),
               E("dealer_catalog", "ToyotaPartsDeal (2023 Tundra)", f"{TD}/oem-2023-toyota-tundra-oil_filter.html")]),
            A(2023, 2025, "Sequoia", "V35A-FTS 3.4L twin-turbo V6 hybrid", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (2023 Sequoia)", f"{TD}/oem-2023-toyota-sequoia-oil_filter.html")]),
        ],
        supersession=[S("90915-10010", "supersedes", [E("toyota_official", "Toyota parts (previous version 90915-10010)", f"{TA}/filter-oil-90915yzzn3")])],
    ),
    "90915-YZZN1": dict(
        apps=[
            A(2023, 2024, "RAV4", "A25A-FKS 2.5L", "verified",
              [E("dealer_catalog", "Lakeland Toyota (2023 RAV4)", f"{LK}/toyota_2023_RAV4/Engine-Oil-Filter/16359139/90915YZZN1.html"),
               E("dealer_catalog", "Lakeland Toyota (2024 RAV4)", f"{LK}/toyota_2024_RAV4/Engine-Oil-Filter/16359139/90915YZZN1.html"),
               E("dealer_catalog", "Toyota of Glendale (5th-gen gas 2.5L: 90915-YZZN1)", "https://www.toyotaofglendale.com/service/service-parts-tips/rav4-oil-type-capacity/")],
              restriction="gas"),
            A(2019, 2022, "RAV4", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (2019 RAV4: 90915-10009, AXAL54L gas submodels)", f"{TD}/oem-2019-toyota-rav4-oil_filter.html"),
               E("dealer_catalog", "ToyotaPartsDeal (2021 RAV4: 90915-10009)", f"{TD}/oem-2021-toyota-rav4-oil_filter.html"),
               E("dealer_catalog", "Lakeland Toyota (RAV4 2019-2025)", f"{LK}/toyota__RAV4/Engine-Oil-Filter/16359139/90915YZZN1.html"),
               E("dealer_catalog", "Sparks Toyota (2019-2022 RAV4 listed for hybrid / PHEV only)", f"{SP}/toyota-toyota-engine-oil-filter-90915yzzn1")],
              restriction="gas; catalogs list 90915-10009 (now 90915-YZZN1) and one limits 2019-2022 to hybrids"),
            A(2020, 2024, "Corolla", "M20A-FKS 2.0L", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (2024 Corolla: replaced by 90915-YZZN1)", f"{TD}/oem-2024-toyota-corolla-oil_filter.html"),
               E("dealer_catalog", "ToyotaPartsDeal (2020 Corolla)", f"{TD}/oem-2020-toyota-corolla-oil_filter.html")],
              restriction="2.0L"),
            A(2018, 2024, "Camry", "A25A-FKS 2.5L", "unresolved",
              [E("dealer_catalog", "ToyotaPartsDeal (2020 Camry: US built, 2.5L)", f"{TD}/oem-2020-toyota-camry-oil_filter.html"),
               E("dealer_catalog", "ToyotaPartsNow (2018 Camry lists 04152-YZZA1 for 2.5L gas)", f"{TN}/parts-select/2018-toyota-camry-oil-filter")],
              origin="US-built per one catalog", reason="Dealer catalogs conflict for the Camry 2.5L (90915-YZZN1 for US-built 2020 vs 04152-YZZA1 on a 2018 page); Japan-built split and the full 2018-2024 range need a VIN-level catalog check."),
        ],
        supersession=[S("90915-YZZF2", "supersedes", [E("toyota_official", "Toyota parts (previous version 90915-YZZF2)", f"{TA}/filter-s-a-oil-90915yzzn1")]),
                      S("90915-10009", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal (2019 Avalon: 90915-10009 replaced by 90915-YZZN1)", f"{TD}/oem-2019-toyota-avalon-oil_filter.html"),
                                                      E("dealer_catalog", "LexusPartsNow (90915-10009 replaced by 90915-YZZN1)", "https://www.lexuspartsnow.com/parts/lexus-filter-oil~90915-10009.html")])],
        rejectedSupersessions=[{"from": "90915-10009", "to": "04152-YZZA1",
                                "evidence": [E("dealer_catalog", "ToyotaPartsDeal (RAV4 oil filter page)", f"{TD}/oem-toyota-rav4-oil_filter.html")],
                                "reason": "A spin-on canister (90915-) cannot be superseded by a cartridge element (04152-); treated as a catalog data error."}],
    ),
    "04152-YZZA5": dict(
        apps=[
            A(2010, 2024, "4Runner", "1GR-FE 4.0L V6", "verified",
              [E("dealer_catalog", "Frontier Toyota (2010-2024 4Runner, 2010-2014 FJ Cruiser, 2011-2014 Tundra 4.0 V6)", "https://parts.frontiertoyota.com/oem-parts/toyota-genuine-toyota-oil-filter-element-2010-2024-4runner-2010-2014-fj-cruiser-2011-2014-tundra-4-0-v6-4152yzza5")]),
            A(2010, 2014, "FJ Cruiser", "1GR-FE 4.0L V6", "verified",
              [E("dealer_catalog", "Frontier Toyota", "https://parts.frontiertoyota.com/oem-parts/toyota-genuine-toyota-oil-filter-element-2010-2024-4runner-2010-2014-fj-cruiser-2011-2014-tundra-4-0-v6-4152yzza5")]),
            A(2011, 2014, "Tundra", "1GR-FE 4.0L V6", "verified",
              [E("dealer_catalog", "Frontier Toyota", "https://parts.frontiertoyota.com/oem-parts/toyota-genuine-toyota-oil-filter-element-2010-2024-4runner-2010-2014-fj-cruiser-2011-2014-tundra-4-0-v6-4152yzza5")],
              restriction="4.0L V6"),
            A(2010, 2015, "Tundra", "1UR-FE / 3UR-FE V8", "removed", [],
              reason="Dealer listings tie 04152-YZZA5 to the 4.0L V6; no V8 Tundra evidence."),
            A(2007, 2011, "Camry", "", "unresolved",
              [E("dealer_catalog", "ToyotaPartsNow (part page)", f"{TN}/oem/toyota~replaceable-element~04152-yzza5")],
              reason="Listed by one catalog only; the Camry 2.4L/3.5L filter numbers differ in other catalogs."),
            A(2006, 2008, "RAV4", "", "unresolved",
              [E("dealer_catalog", "ToyotaPartsNow (part page)", f"{TN}/oem/toyota~replaceable-element~04152-yzza5")],
              reason="Listed by one catalog only."),
        ],
        supersession=[S("04152-38010", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal (2010 Tundra: 04152-38010 superseded by YZZA5)", f"{TD}/oem-2010-toyota-tundra-oil_filter.html")]),
                      S("04152-31050", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed."),
                      S("04152-31060", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed.")],
    ),
    # ------------------------------------------------------------------ cabin filters
    "87139-0R030": dict(
        apps=[
            A(2020, 2024, "Corolla", "", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (part page, pollen filter)", "https://toyotapartsdeal.com/oem/toyota~element~air~refiner~87139-0r030.html"),
               E("secondary", "FilterBuy application table (E210, North America-built)", "https://filterbuy.com/auto-cabin-filters/cabin/by-vehicle/toyota/corolla/")],
              restriction="standard (non-charcoal) filter", origin="North American-built"),
            A(2019, 2019, "Corolla", "", "removed", [],
              reason="2019 Corolla sedan is the previous generation; no 2019 evidence for this number."),
        ],
        supersession=[S("87139-28020", "supersedes", [E("toyota_official", "Toyota parts (previous version 87139-28020)", f"{TA}/element-air-refiner-871390r030")])],
    ),
    "87139-0E040": dict(
        apps=[A(2020, 2024, "Camry", "", "vin_dependent",
                [E("toyota_official", "Toyota parts (2020 Camry air refiner element 87139-0E040)", f"{TN}/oem/toyota~air-refiner-element~87139-0e040"),
                 E("dealer_catalog", "ToyotaPartsDeal (2020 Camry cabin air filter)", f"{TD}/oem-2020-toyota-camry-cabin_air_filter.html")],
                restriction="charcoal filter", origin="North American-built (Japan-built charcoal number is 87139-58010 on Corolla; Camry split not confirmed)")],
    ),
    "87139-58010": dict(
        apps=[
            A(2023, 2024, "Highlander", "", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (2023 Highlander)", f"{TD}/oem-2023-toyota-highlander-cabin_air_filter.html"),
               E("dealer_catalog", "ToyotaPartsDeal (2024 Highlander)", f"{TD}/oem-2024-toyota-highlander-cabin_air_filter.html")],
              restriction="charcoal filter"),
            A(2020, 2022, "Highlander", "", "unresolved",
              [E("dealer_catalog", "ToyotaPartsDeal (2020-2022 Highlander pages indexed; fitment not visible)", f"{TD}/oem-2021-toyota-highlander-cabin_air_filter.html")],
              reason="Year pages exist but their fitment content could not be confirmed."),
            A(2021, 2024, "Sienna", "", "removed", [],
              reason="No catalog evidence found for the Sienna."),
        ],
    ),
    "87139-YZZ08": dict(
        supersession=[S("87139-YZZ82", "superseded_by", [E("dealer_catalog", "ToyotaPartsDeal / Olathe Toyota (staged research)", f"{TD}/oem/toyota~element~air~refiner~87139-yzz08.html")])],
        blocking=["Superseded by 87139-YZZ82."],
        apps=[A(2018, 2024, "Camry", "", "unresolved",
                [E("retailer", "third-party listing", "https://ebay.com/itm/176996422825")],
                reason="Retailer-only; one source treats YZZ08 as an interchange for 87139-50100. No Toyota or dealer Camry evidence.")],
    ),
    "87139-50100": dict(
        apps=[A(2010, 2024, "4Runner", "", "unresolved",
                [E("dealer_catalog", "ToyotaPartsDeal (part page; ranges 2008-2024 / 2008-2016, no 4Runner entry)", f"{TD}/oem/toyota~element~air~refiner~87139-50100.html")],
                reason="Dealer ranges conflict and none lists the 4Runner.")],
        supersession=[S("87139-50060", "supersedes", [E("toyota_official", "Toyota parts (previous version 87139-50060)", f"{TA}/element-air-refiner-8713950100")])],
    ),
    # ------------------------------------------------------------------ ignition
    "90919-01289": dict(
        apps=[
            A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "AutoNation Toyota South Austin (part page)", "https://parts.autonationtoyotasouthaustin.com/oem-parts/toyota-spark-plug-9091901289"),
               E("dealer_catalog", "Olathe Toyota (part page, 2018+ Toyota)", f"{OL}/toyota-spark-plug-9091901289")],
              restriction="2.5L gas; hybrid not confirmed"),
            A(2018, 2024, "Camry", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "Olathe Toyota (part page, 2018+ Toyota)", f"{OL}/toyota-spark-plug-9091901289")],
              restriction="2.5L gas; hybrid not confirmed"),
        ],
        supersession=[S("90919-A1001", "supersedes", [E("toyota_official", "Toyota parts (previous version 90919-A1001)", f"{TA}/plug-spark-9091901289")])],
    ),
    "90919-01287": dict(
        apps=[A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "vin_dependent",
                [E("dealer_catalog", "Toyota of Anaheim (2016-2023 Tacoma)", "https://parts.toyotaofanaheim.com/oem-parts/toyota-spark-plug-9091901287"),
                 E("dealer_catalog", "ToyotaPartsDeal (2023 Tacoma spark plug)", f"{TD}/oem-2023-toyota-tacoma-spark_plug.html")],
                restriction="3.5L V6")],
        blocking=["Conflicting plug numbers: dealer pages list 90919-01287 for 2016-2023 Tacoma but the same pages carry 'Fits Tacoma 2.7L' text, and 90919-01263 (FK20HBR8, a different plug code) is also listed for the 2016 Tacoma 3.5L. Needs a VIN-level catalog lookup."],
    ),
    "90919-01263": dict(
        apps=[A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "unresolved",
                [E("dealer_catalog", "AutoNation parts (Avalon, Camry, Highlander, Sienna, Tacoma 3.5L without hybrid; no longer available)", "https://www.autonationparts.com/parts/toyota-spark-plug-9091901263")],
                reason="Listed as no longer available; a listing shows it replaced by 90919-01236 on a 2.7L engine. Relationship to 90919-01287 unresolved.")],
    ),
    "90919-01275": dict(
        apps=[A(2009, 2019, "Corolla", "2ZR-FE 1.8L", "unresolved",
                [E("dealer_catalog", "ToyotaPartsDeal (2018 Corolla spark plug)", "https://toyotapartsdeal.com/oem-2018-toyota-corolla-spark_plug.html"),
                 E("retailer", "retailer: 2009-2019 1.8L lists 90080-91184; 90919-01275 for 2020-2023 1.8L", "https://www.toyotapartsnow.com/parts-select/toyota-corolla-spark-plug")],
                reason="Conflict: one catalog lists 90080-91184 for the 2009-2019 Corolla 1.8L and 90919-01275 for 2020-2023.")],
        supersession=[S("90919-01253", "supersedes", [E("toyota_official", "Toyota parts (previous version 90919-01253)", f"{TA}/plug-spark-9091901275")])],
    ),
    "90919-02258": dict(
        apps=[A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "removed", [],
                reason="Dealers list 90919-02258 for 1.8L engines (Corolla, Prius, C-HR, Matrix). The Tacoma 3.5L coil is 90919-A2008 (candidate for batch 2). No 1.8L application verified by year yet.")],
    ),
    "90919-A2009": dict(
        apps=[
            A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "Northpark Toyota (part page)", "https://parts.northparktoyota.com/oem-parts/toyota-ignition-coil-90919a2009"),
               E("dealer_catalog", "ToyotaPartsDeal (2020 RAV4 ignition coil)", f"{TD}/oem-2020-toyota-rav4-ignition_coil.html"),
               E("dealer_catalog", "ToyotaPartsDeal (2024 RAV4 ignition coil)", f"{TD}/oem-2024-toyota-rav4-ignition_coil.html")],
              restriction="2.5L gas, without hybrid"),
            A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "removed", [],
              reason="Listings say 'without hybrid'; the staged hybrid claim is contradicted."),
        ],
        supersession=[S("90919-02276", "supersedes", [E("dealer_catalog", "ToyotaPartsNow (90919-02276)", f"{TN}/oem/toyota~ignition-coil~90919-02276")])],
        blocking=["A retailer lists 90919-A2010 for 2019 RAV4 2.5L gas trims; which coil applies by production date is unresolved."],
    ),
    # ------------------------------------------------------------------ brakes
    "04465-04090": dict(
        apps=[A(2016, 2023, "Tacoma", "", "vin_dependent",
                [E("dealer_catalog", "ToyotaPartsDeal (part page, 2015-2023)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-04090.html"),
                 E("toyota_official", "Toyota parts (front pad kit)", f"{TA}/pad-kit-disc-brake-0446504090")],
                restriction="4x4 and PreRunner per one listing; 2WD coverage by VIN")],
    ),
    "43512-04052": dict(
        apps=[A(2005, 2023, "Tacoma", "", "verified",
                [E("dealer_catalog", "Olathe Toyota (2005-2023 Tacoma)", f"{OL}/toyota-disc-brake-rotor-front-4351204052"),
                 E("dealer_catalog", "ToyotaPartsNow (front disc)", f"{TN}/oem/toyota~front-disc~43512-04052")])],
        supersession=[S("43512-04050", "supersedes", [E("dealer_catalog", "Olathe Toyota", f"{OL}/toyota-disc-brake-rotor-front-4351204052")]),
                      S("43512-04051", "supersedes", [E("dealer_catalog", "Olathe Toyota", f"{OL}/toyota-disc-brake-rotor-front-4351204052")])],
    ),
    "04465-0C020": dict(
        apps=[
            A(2007, 2017, "Tundra", "", "verified",
              [E("dealer_catalog", "Lithia Toyota (2007-2017)", "https://www.lithiatoyotaparts.com/oem-parts/toyota-2007-2017-toyota-brake-pads-44650c020"),
               E("dealer_catalog_ca", "Scarborough Toyota (2017 Tundra 4.6L)", f"{SC}/Toyota_2017_Tundra-46L-V8-AT-RWD-SR-Extended-Cab-Pickup-Fleetside/Disc-Brake-Pad-Set-Front-A-set-of-disc-brake-pads/47994284/044650C020.html")]),
            A(2008, 2017, "Sequoia", "", "verified",
              [E("dealer_catalog", "ToyotaPartsDeal (2012 Sequoia)", f"{TD}/oem-2012-toyota-sequoia-brake_pad_set.html"),
               E("dealer_catalog", "ToyotaPartsDeal (2017 Sequoia)", f"{TD}/oem-2017-toyota-sequoia-brake_pad_set.html")]),
        ],
    ),
    "43512-06200": dict(
        apps=[
            A(2018, 2024, "Camry", "", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~disc~fr~43512-06200.html"),
               E("dealer_catalog_ca", "Scarborough Toyota (2021 Camry XSE)", f"{SC}/Toyota_2021_Camry-XSE-Sedan/Disc-Brake-Rotor-Front/71596501/4351206200.html")],
              restriction="without TRD, without hybrid; US-built (Japan-built excluded)", origin="US-built"),
            A(2019, 2024, "RAV4", "", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~disc~fr~43512-06200.html")],
              restriction="engine / hybrid notes vary by listing"),
            A(2022, 2023, "Corolla Cross", "M20A-FKS 2.0L", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~disc~fr~43512-06200.html"),
               E("dealer_catalog", "Northpark Toyota", "https://parts.northparktoyota.com/oem-parts/toyota-disc-brake-rotor-front-4351206200")],
              restriction="2.0L"),
            A(2024, 2025, "Corolla Cross", "M20A-FKS 2.0L", "unresolved", [],
              reason="Dealers disagree (2022-2023 vs 2022-2025)."),
        ],
    ),
    "04465-0E060": dict(
        apps=[
            A(2018, 2024, "Camry", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (2018-2024 Camry)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0e060.html"),
               E("dealer_catalog_ca", "Scarborough Toyota (Camry; USA built; w/o TRD)", f"{SC}/Toyota__/Disc-Brake-Pad-Set-Front/71575523/044650E060.html"),
               E("service_doc", "Toyota brake pad application sheet (split by production window)", "https://attachments.priuschat.com/attachment-files/2022/03/219936_04_BrakePads2020_hi.pdf")],
              restriction="USA-built, without TRD", origin="USA-built", production="split with 04465-33480 by production window"),
            A(2019, 2023, "RAV4", "", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (2019-2024 RAV4)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0e060.html")],
              restriction="end year varies (2023 / 2024)"),
            A(2024, 2024, "RAV4", "", "unresolved", [],
              reason="One catalog ends at 2023, another at 2024."),
        ],
        blocking=["Overlaps 04465-33480 on the 2018-2024 Camry: a Toyota application sheet splits the two by production window and plant. Needs VIN-level confirmation before listing."],
    ),
    "04465-33480": dict(
        apps=[A(2018, 2024, "Camry", "A25A-FKS 2.5L", "vin_dependent",
                [E("toyota_official", "Toyota parts (pad kit)", f"{TA}/pad-kit-disc-brake-0446533480"),
                 E("dealer_catalog", "Toyota of Anaheim", "https://parts.toyotaofanaheim.com/oem-parts/toyota-brake-pads-446533480"),
                 E("service_doc", "Toyota brake pad application sheet (production window split)", "https://attachments.priuschat.com/attachment-files/2022/03/219936_04_BrakePads2020_hi.pdf")],
                restriction="to 05/2024; without TRD", production="to 05/2024; split with 04465-0E060 by production window")],
        blocking=["Overlaps 04465-0E060 on the 2018-2024 Camry by production window; RAV4 and Venza applications are retailer-only."],
    ),
    "04465-06170": dict(
        apps=[A(2023, 2024, "Camry", "", "vin_dependent",
                [E("dealer_catalog", "Northpark Toyota (2023-2024 Camry)", "https://parts.northparktoyota.com/oem-parts/toyota-disc-brake-pad-set-446506170"),
                 E("dealer_catalog", "NuCar Toyota (2023-2024 Camry)", "https://toyotaparts.nucar.com/parts/toyota-2023-2024-toyota-camry-brake-pads-446506170")],
                restriction="US-built, without TRD, from 02/2023", origin="US-built", production="from 02/2023")],
    ),
    "04465-35330": dict(
        apps=[
            A(2020, 2023, "4Runner", "1GR-FE 4.0L V6", "verified",
              [E("dealer_catalog", "Olathe Toyota", f"{OL}/toyota-brake-pads-front-446535330"),
               E("dealer_catalog", "ToyotaPartsNow (part page)", f"{TN}/oem/toyota~disc-brake-pad-kit~04465-35330")]),
            A(2024, 2024, "4Runner", "1GR-FE 4.0L V6", "unresolved", [],
              reason="Dealer ranges disagree (2020-2023 vs 2020-2024)."),
        ],
        supersession=[S("04465-35190", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed."),
                      S("04465-35230", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed.")],
    ),
    "04465-02530": dict(
        apps=[
            A(2021, 2022, "Highlander", "A25A-FXS 2.5L hybrid", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsDeal (2022 Highlander, hybrid submodel codes)", f"{TD}/oem-2022-toyota-highlander-brake_pad_set.html"),
               E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-02530.html")],
              restriction="hybrid"),
            A(2021, 2022, "Highlander", "T24A-FTS 2.4L turbo", "removed", [],
              reason="The 2.4L turbo entered the Highlander for 2023; a 2021-2022 2.4L application does not exist."),
            A(2021, 2022, "Highlander", "2GR-FKS 3.5L V6", "removed", [],
              reason="No catalog evidence for the V6; evidence covers hybrid trims only."),
        ],
        blocking=["Olathe Toyota's note for this number reads 'Grand Highlander, without hybrid', contradicting the hybrid listings."],
    ),
    "43512-0R010": dict(
        apps=[
            A(2009, 2018, "RAV4", "4-cyl 2.4L / 2.5L", "verified",
              [E("dealer_catalog", "Lithia Toyota (2009-2018 RAV4)", "https://www.lithiatoyotaparts.com/oem-parts/toyota-2009-2018-toyota-rav4-rotor-435120r010"),
               E("dealer_catalog", "ToyotaPartsDeal (part page)", "https://toyotapartsdeal.com/oem/toyota~disc~fr~43512-0r010.html")],
              restriction=None),
            A(2009, 2012, "RAV4", "2GR-FE 3.5L V6", "unresolved", [],
              reason="Catalog groupings list 2.4L/2.5L 4-cylinder trims only."),
        ],
        supersession=[S("43512-42040", "supersedes", [E("toyota_official", "Toyota parts (previous version 43512-42040)", f"{TA}/rotor-brake-fr-435120r010")])],
    ),
    "04465-42200": dict(
        apps=[A(2006, 2018, "RAV4", "", "unresolved",
                [E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-42200.html")],
                reason="Superseded by 04465-42220; year ranges do not separate 2006-2012 from 2013-2018.")],
        supersession=[S("04465-42220", "superseded_by", [E("dealer_catalog", "ToyotaPartsDeal (04465-42200 replaced by 04465-42220)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-42200.html")]),
                      S("04465-42160", "supersedes", [], status="unresolved", reason="Carried from staged data; not re-confirmed.")],
        blocking=["Superseded by 04465-42220."],
    ),
    "04465-42220": dict(
        apps=[A(2013, 2018, "RAV4", "2AR-FE 2.5L", "unresolved",
                [E("dealer_catalog", "ToyotaPartsDeal (04465-0R010 replaced by 04465-42220)", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0r010.html")],
                reason="Current number for the 04465-42200 / 04465-0R010 family, but no catalog states its RAV4 year range.")],
        supersession=[S("04465-0R010", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0r010.html")]),
                      S("04465-42200", "supersedes", [E("dealer_catalog", "ToyotaPartsDeal", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-42200.html")])],
    ),
    "43512-0E060": dict(
        apps=[A(2020, 2024, "Highlander", "", "unresolved", [],
                reason="No catalog evidence found for this number in the audit.")],
    ),
    # ------------------------------------------------------------------ engine / wheel end / electrical
    "16032-F0011": dict(
        identity="Housing sub-assembly, water inlet (Toyota's catalog name). Not a water pump.",
        apps=[
            A(2018, 2024, "Camry", "A25A-FKS / A25A-FXS 2.5L", "vin_dependent",
              [E("toyota_official", "Toyota parts (housing sub-assy, water inlet)", f"{TA}/housing-sub-assy-water-inlet-16032f0011"),
               E("dealer_catalog", "ToyotaPartsNow (2018-2024 Camry, 2019-2025 RAV4, 2020-2025 Highlander, 2021-2025 Sienna)", f"{TN}/oem/toyota~housing-sub-assy-wa~16032-f0011")],
              restriction="2.5L; hybrid inclusion unresolved"),
            A(2019, 2024, "RAV4", "A25A-FKS / A25A-FXS 2.5L", "vin_dependent",
              [E("dealer_catalog", "ToyotaPartsNow", f"{TN}/oem/toyota~housing-sub-assy-wa~16032-f0011")],
              restriction="2.5L; hybrid inclusion unresolved"),
        ],
        supersession=[S("16032-F0012", "supersedes", [E("dealer_catalog", "ToyotaPartsNow", f"{TN}/oem/toyota~housing-sub-assy-wa~16032-f0011")]),
                      S("16032-F0010", "supersedes", [E("dealer_catalog", "ToyotaPartsNow", f"{TN}/oem/toyota~housing-sub-assy-wa~16032-f0011")]),
                      S("16032-25010", "supersedes", [E("dealer_catalog", "ToyotaPartsNow", f"{TN}/oem/toyota~housing-sub-assy-wa~16032-f0011")])],
        blocking=["Single dealer catalog for applications; it includes hybrid models that the staged 'gas, non-hybrid' restriction excluded. Gasket (16325-25010) inclusion unconfirmed."],
    ),
    "27060-F0010": dict(
        apps=[
            A(2018, 2024, "Camry", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "Olathe Toyota (Camry/Avalon 2.5L, non-hybrid, USA built, 100A)", f"{OL}/toyota-alternator-27060f0010"),
               E("dealer_catalog", "ToyotaPartsDeal (12V/100A)", f"{TD}/oem/toyota~alternator~assy~w~r~27060-f0010.html")],
              restriction="2.5L gas, non-hybrid, 100A", origin="USA-built"),
            A(2020, 2022, "Avalon", "A25A-FKS 2.5L", "removed", [],
              reason="No US-market Avalon had a 2.5L gas engine (V6 or 2.5L hybrid only)."),
        ],
    ),
    "43550-0R060": dict(
        apps=[
            A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog_ca", "Scarborough Toyota (2021 RAV4 XLE Premium)", f"{SC}/Toyota_2021_RAV4-XLE-Premium-Sport-Utility/Wheel-Bearing-and-Hub-Assembly-Front/78806627/435500R060.html"),
               E("dealer_catalog", "Olathe Toyota (RAV4; Japan built / local built; w/o hybrid)", f"{OL}/toyota-wheel-bearing-and-hub-assembly-435500r060"),
               E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~hub~bearing~assy~43550-0r060.html")],
              restriction="gas, without hybrid or Prime", origin="Japan-built or North American-built (both listed)"),
            A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "removed", [],
              reason="Dealer notes say 'w/o hybrid'; North American-built hybrids use 43550-0R070."),
            A(2021, 2024, "Venza", "A25A-FXS 2.5L hybrid", "removed", [],
              reason="Every US Venza is a hybrid and this number is listed 'w/o hybrid'."),
        ],
        supersession=[S("43550-33070", "supersedes", [E("dealer_catalog", "ToyotaPartsNow", f"{TN}/oem/toyota~bearing-and-hub-assembly~43550-33070")])],
    ),
    "43550-0R070": dict(
        apps=[A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "vin_dependent",
                [E("dealer_catalog", "Olathe Toyota (RAV4 local built, without plug-in, NAM built, with hybrid)", f"{OL}/toyota-hub-assembly-435500r070")],
                restriction="hybrid, without plug-in", origin="North American-built")],
        blocking=["Single dealer note; the staged record claimed all 2019-2024 RAV4s. Needs a second catalog source for the hybrid / origin split."],
    ),
    "27060-25010": dict(
        apps=[
            A(2019, 2022, "RAV4", "A25A-FKS 2.5L", "vin_dependent",
              [E("dealer_catalog", "Olathe Toyota (part page)", f"{OL}/toyota-alternator-2706025010"),
               E("dealer_catalog", "ToyotaPartsNow (part page)", f"{TN}/oem/toyota~alternator-assembly-w-regulator~27060-25010")],
              restriction="2.5L gas, 100A; 130A units use 27060-F0040"),
            A(2023, 2024, "RAV4", "A25A-FKS 2.5L", "unresolved", [],
              reason="Listings give 2019-2022 for the RAV4; later years not shown."),
            A(2019, 2024, "Corolla", "M20A-FKS 2.0L", "unresolved",
              [E("retailer", "sellers: 2019-2022 Corolla 2.0L", "https://ahparts.com/buy-used/2019-toyota-rav-4-alternator-generator-27060-25010-2706025010/301631-1")],
              reason="Retailer-only; a 2019 Corolla sedan had no 2.0L."),
        ],
        blocking=["Alternator output (100A vs 130A) is an option split that needs the VIN."],
    ),
}

# Engine assemblies: fitment is by engine code. A used engine's interchange
# depends on generation, accessories, harness and ECU, so every application
# is VIN-dependent and every engine record stays research_pending.
ENGINE_EVIDENCE = {
    "A25A-FKS": dict(apps=[A(2018, 2024, "Camry", "A25A-FKS", "vin_dependent", [], restriction="2.5L gas; accessories and ECU differ by model"),
                           A(2019, 2024, "RAV4", "A25A-FKS", "vin_dependent", [], restriction="2.5L gas; accessories and ECU differ by model")]),
    "2GR-FKS": dict(apps=[A(2018, 2024, "Camry", "2GR-FKS", "vin_dependent", []), A(2017, 2019, "Highlander", "2GR-FKS", "vin_dependent", []),
                          A(2016, 2023, "Tacoma", "2GR-FKS", "vin_dependent", []), A(2017, 2020, "Sienna", "2GR-FKS", "vin_dependent", [])]),
    "2GR-FE": dict(apps=[A(2007, 2017, "Camry", "2GR-FE", "vin_dependent", []), A(2008, 2016, "Highlander", "2GR-FE", "vin_dependent", []),
                         A(2007, 2016, "Sienna", "2GR-FE", "vin_dependent", [])]),
    "2AR-FE": dict(apps=[A(2010, 2017, "Camry", "2AR-FE", "vin_dependent", []), A(2009, 2018, "RAV4", "2AR-FE", "vin_dependent", []),
                         A(2009, 2009, "Camry", "2AR-FE", "removed", [], reason="The 2009 model-year Camry 4-cylinder used the 2.4L 2AZ-FE; the 2AR-FE arrived with the 2010 model year.")]),
    "2TR-FE": dict(apps=[A(2005, 2015, "Tacoma", "2TR-FE", "vin_dependent", [], restriction="2nd generation (VVT-i)"),
                         A(2016, 2023, "Tacoma", "2TR-FE", "vin_dependent", [], restriction="3rd generation (dual VVT-i); not interchangeable with 2005-2015")]),
    "1GR-FE": dict(apps=[A(2010, 2024, "4Runner", "1GR-FE", "vin_dependent", [], restriction="dual VVT-i"),
                         A(2005, 2015, "Tacoma", "1GR-FE", "vin_dependent", [], restriction="intake VVT-i; not interchangeable with the 4Runner dual VVT-i unit")]),
    "3UR-FE": dict(apps=[A(2007, 2021, "Tundra", "3UR-FE", "vin_dependent", []), A(2008, 2022, "Sequoia", "3UR-FE", "vin_dependent", [])]),
    "2ZR-FE": dict(apps=[A(2009, 2019, "Corolla", "2ZR-FE", "vin_dependent", [], restriction="2014-2019 LE Eco uses 2ZR-FAE")]),
    "M20A-FKS": dict(apps=[A(2020, 2024, "Corolla", "M20A-FKS", "vin_dependent", [], restriction="2020-2022 SE/XSE only; 1.8L on other trims")]),
}
# fmt: on


# A used or remanufactured engine is matched by engine code, but the unit's
# accessories, wiring harness, ECU calibration and mounts differ by model and
# year, so every engine application states that restriction.
ENGINE_RESTRICTION = "engine-code match; accessories, harness, ECU and mounts differ by model and year"
for _ev in ENGINE_EVIDENCE.values():
    for _a in _ev["apps"]:
        if _a["status"] == "vin_dependent" and not _a["restriction"]:
            _a["restriction"] = ENGINE_RESTRICTION


# ---------------------------------------------------------------------------
# Phase 1 resolutions (2026-11-18, second pass): Toyota's own application
# charts, published on toyotapartsandservice.com (Toyota Parts & Service),
# list the factory oil filter and spark plug by model, year and engine code.
# They supersede the conflicting dealer-catalog readings above.
# ---------------------------------------------------------------------------
TPS_OIL = "https://www.toyotapartsandservice.com/wp-content/uploads/2021/08/06_OilFilters2021_hi.pdf"
TPS_PLUG = "https://www.toyotapartsandservice.com/wp-content/uploads/2022/11/09_SparkPlugs2022_hi.pdf"


def OIL(note):
    return E("toyota_official", f"Toyota Parts & Service oil filter chart (2021): {note}", TPS_OIL)


def PLUG(note):
    return E("toyota_official", f"Toyota Parts & Service spark plug chart (2022): {note}", TPS_PLUG)


OPEN_ENDED = "chart edition lists the application as open-ended ('2018-'); later model years from dealer catalogs"

EVIDENCE["90915-YZZN1"]["apps"] = [
    A(2018, 2024, "Camry", "A25A-FKS 2.5L", "verified",
      [OIL("CAMRY 2018- 4 Cyl. (A25AFKS, A25AFXS) -> 90915-YZZN1"),
       E("dealer_catalog", "Lakeland Toyota (2019 Camry)", f"{LK}/toyota_2019_CAMRY/Engine-Oil-Filter/16359139/90915YZZN1.html"),
       E("dealer_catalog", "Sparks Toyota (2018+ Camry A25A-FKS, A25A-FXS)", f"{SP}/toyota-genuine-toyota-oil-filter-s-a-90915yzzn1")],
      restriction="gas"),
    A(2018, 2024, "Camry", "A25A-FXS 2.5L hybrid", "verified",
      [OIL("CAMRY 2018- 4 Cyl. (A25AFKS, A25AFXS) -> 90915-YZZN1")], restriction="hybrid"),
    A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "verified",
      [OIL("RAV4 2019- 4 Cyl. (A25AFKS) and (A25AFKS) NAP -> 90915-YZZN1"),
       E("dealer_catalog", "Lakeland Toyota (2023 RAV4)", f"{LK}/toyota_2023_RAV4/Engine-Oil-Filter/16359139/90915YZZN1.html"),
       E("dealer_catalog", "Lakeland Toyota (2024 RAV4)", f"{LK}/toyota_2024_RAV4/Engine-Oil-Filter/16359139/90915YZZN1.html")],
      restriction="gas"),
    A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "verified",
      [OIL("RAV4 2019- 4 Cyl. (A25AFXS) HV -> 90915-YZZN1")], restriction="hybrid"),
    A(2020, 2024, "Corolla", "M20A-FKS 2.0L", "verified",
      [OIL("COROLLA 2020- 4 Cyl. (M20AFKS) JPP and NAP -> 90915-YZZN1"),
       E("dealer_catalog", "ToyotaPartsDeal (2024 Corolla)", f"{TD}/oem-2024-toyota-corolla-oil_filter.html")]),
]
EVIDENCE["90915-YZZN1"]["resolution"] = "Camry 2.5L and 2019-2022 RAV4 resolved by Toyota's oil filter chart: 90915-YZZN1 for A25A-FKS and A25A-FXS, Japan- and North American-built alike."

EVIDENCE["04152-YZZA1"]["apps"] = [
    A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "verified",
      [OIL("TACOMA 2016-2019 (-1/19) and 2019- (2/19-) V6 (2GRFKS) -> 04152-YZZA1"),
       E("dealer_catalog", "ToyotaPartsNow (2020 Tacoma 3.5L)", f"{TN}/parts-select/2020-toyota-tacoma-oil-filter")]),
    A(2018, 2024, "Camry", "2GR-FKS 3.5L V6", "verified",
      [OIL("CAMRY 2018- V6 (2GRFKS) -> 04152-YZZA1"),
       E("dealer_catalog", "ToyotaPartsNow (2018 Camry, 3.5L)", f"{TN}/parts-select/2018-toyota-camry-oil-filter")]),
    A(2017, 2022, "Highlander", "2GR-FKS 3.5L V6", "verified",
      [OIL("HIGHLANDER 2017-2019 and 2020- V6 (2GRFKS) -> 04152-YZZA1"),
       E("toyota_official", "Toyota parts (part page)", f"{TA}/replaceable-element-oil-filter-04152yzza1")]),
    A(2017, 2020, "Sienna", "2GR-FKS 3.5L V6", "verified",
      [OIL("SIENNA 2017-2020 V6 (2GRFKS) -> 04152-YZZA1")]),
    A(2023, 2023, "Highlander", "2GR-FKS 3.5L V6", "removed", [],
      reason="The 2023 Highlander has no 3.5L V6 (2.4L turbo and 2.5L hybrid only)."),
    A(2018, 2024, "Camry", "A25A-FKS 2.5L", "removed", [OIL("CAMRY 2018- A25AFKS -> 90915-YZZN1")],
      reason="Toyota's chart assigns spin-on 90915-YZZN1 to the 2.5L."),
    A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "removed", [OIL("RAV4 2019- A25AFKS -> 90915-YZZN1")],
      reason="Toyota's chart assigns 90915-YZZN1 to the 2019+ RAV4; 04152-YZZA1 is the 2009-2018 RAV4 filter."),
]
EVIDENCE["04152-YZZA1"]["resolution"] = "Dealer note 'from 11/2017, Exc. Japan built' not reflected in Toyota's chart for these US models; V6 applications verified without an origin restriction."

EVIDENCE["04152-YZZA6"]["apps"] = [
    A(2009, 2015, "Corolla", "2ZR-FE 1.8L", "verified",
      [OIL("COROLLA 2009-2013 (2ZRFE) and 2014-2015 (2ZRFAE, 2ZRFE) -> 04152-YZZA6"),
       E("dealer_catalog", "ToyotaPartsDeal (part page)", f"{TD}/oem/toyota~replaceable~element~04152-yzza6.html")]),
    A(2014, 2015, "Corolla", "2ZR-FAE 1.8L", "verified",
      [OIL("COROLLA 2014-2015 (2ZRFAE, 2ZRFE) -> 04152-YZZA6")], restriction="LE Eco"),
    A(2009, 2013, "Matrix", "2ZR-FE 1.8L", "verified",
      [OIL("MATRIX 2009-2010 and 2011-2014 4 Cyl. (2ZRFE) -> 04152-YZZA6; US Matrix sales ended with the 2013 model year")]),
    A(2010, 2017, "Prius", "2ZR-FXE 1.8L hybrid", "verified",
      [OIL("PRIUS 2010-2017 4 Cyl. (2ZRFXE) -> 04152-YZZA6")]),
    A(2016, 2018, "Corolla", "2ZR-FE / 2ZR-FAE 1.8L", "removed", [OIL("COROLLA 2016- (2ZRFAE, 2ZRFE) -> 90915-YZZN1")],
      reason="Toyota's chart moves the 2016+ Corolla 1.8L to spin-on 90915-YZZN1; the staged 2016-2017 years were wrong."),
]

EVIDENCE["90915-YZZD3"]["apps"] = [
    A(2005, 2015, "Tacoma", "1GR-FE 4.0L V6", "verified", [OIL("TACOMA 2005-2015 V6 (1GRFE) -> 90915-YZZD3")]),
    A(2003, 2009, "4Runner", "1GR-FE 4.0L V6 / 2UZ-FE 4.7L V8", "verified", [OIL("4RUNNER 2003-2009 V6 (1GRFE) and V8 (2UZFE) -> 90915-YZZD3")]),
    A(2000, 2009, "Tundra", "2UZ-FE 4.7L V8", "verified", [OIL("TUNDRA 2000-2004, 2005-2008, 2008-2009 V8 (2UZFE) -> 90915-YZZD3")]),
    A(2005, 2010, "Tundra", "1GR-FE 4.0L V6", "verified", [OIL("TUNDRA 2005-2010 V6 (1GRFE) -> 90915-YZZD3; 2011+ 1GRFE -> 04152-YZZA5")]),
    A(2001, 2009, "Sequoia", "2UZ-FE 4.7L V8", "verified", [OIL("SEQUOIA 2001-2007, 2008, 2008-2009 V8 (2UZFE) -> 90915-YZZD3")]),
]

EVIDENCE["04152-YZZA5"]["apps"] = [
    A(2010, 2024, "4Runner", "1GR-FE 4.0L V6", "verified",
      [OIL("4RUNNER 2010-2012 and 2013- V6 (1GRFE) -> 04152-YZZA5"),
       E("dealer_catalog", "Frontier Toyota (2010-2024 4Runner)", "https://parts.frontiertoyota.com/oem-parts/toyota-genuine-toyota-oil-filter-element-2010-2024-4runner-2010-2014-fj-cruiser-2011-2014-tundra-4-0-v6-4152yzza5")]),
    A(2010, 2014, "FJ Cruiser", "1GR-FE 4.0L V6", "verified", [OIL("FJ CRUISER 2010-2014 V6 (1GRFE) -> 04152-YZZA5")]),
    A(2011, 2014, "Tundra", "1GR-FE 4.0L V6", "verified", [OIL("TUNDRA 2011-2012 and 2013-2014 V6 (1GRFE) -> 04152-YZZA5")]),
    A(2010, 2015, "Tundra", "1UR-FE / 3UR-FE V8", "removed", [OIL("TUNDRA V8 (1URFE, 3URFE) -> 04152-YZZA4")],
      reason="Toyota's chart lists 04152-YZZA4 for the Tundra V8."),
    A(2007, 2011, "Camry", "", "removed", [OIL("CAMRY 2007-2011: 2GRFE -> 04152-YZZA1, 2AZFE -> 90915-YZZF1")],
      reason="Toyota's chart lists other filters for every 2007-2011 Camry engine."),
    A(2006, 2008, "RAV4", "", "removed", [OIL("RAV4 2006-2008 2AZFE -> 90915-YZZF1")],
      reason="Toyota's chart lists 90915-YZZF1."),
]

EVIDENCE["90919-01289"]["apps"] = [
    A(2018, 2024, "Camry", "A25A-FKS 2.5L", "verified", [PLUG("CAMRY 2018- L4 (A25AFKS) FC16HR-Q8 -> 90919-01289"),
                                                         E("dealer_catalog", "Olathe Toyota (part page)", f"{OL}/toyota-spark-plug-9091901289")], restriction="gas"),
    A(2018, 2024, "Camry", "A25A-FXS 2.5L hybrid", "verified", [PLUG("CAMRY 2018- L4 (A25AFXS) Hybrid -> 90919-01289")], restriction="hybrid"),
    A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "verified", [PLUG("RAV4 2019- L4 (A25AFKS) -> 90919-01289")], restriction="gas"),
    A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "verified", [PLUG("RAV4 HV 2019- and RAV4 PRIME 2021- (A25AFXS) -> 90919-01289")], restriction="hybrid, incl. Prime"),
    A(2020, 2022, "Corolla", "2ZR-FAE 1.8L", "verified", [PLUG("COROLLA 2020- L4 (2ZRFAE) -> 90919-01289")]),
    A(2020, 2024, "Highlander", "A25A-FXS 2.5L hybrid", "verified", [PLUG("HIGHLANDER/HV 2020- L4 (A25AFXS) Hybrid -> 90919-01289")], restriction="hybrid"),
    A(2021, 2024, "Venza", "A25A-FXS 2.5L hybrid", "verified", [PLUG("VENZA 2021- L4 (A25AFXS) Hybrid -> 90919-01289")]),
]

EVIDENCE["90919-01287"] = dict(
    apps=[
        A(2016, 2023, "Tacoma", "2TR-FE 2.7L", "verified",
          [PLUG("TACOMA 2016- L4 (2TRFE) FK20HR-A8 -> 90919-01287"),
           E("dealer_catalog", "Toyota of Anaheim (2016-2023 Tacoma; 'Fits Tacoma 2.7L')", "https://parts.toyotaofanaheim.com/oem-parts/toyota-spark-plug-9091901287")]),
        A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "removed",
          [PLUG("TACOMA 2016- V6 (2GRFKS) FK20HBR8 -> 90919-01263")],
          reason="Toyota's chart assigns 90919-01263 to the 3.5L V6; 90919-01287 is the 2.7L plug. The staged 3.5L application was wrong."),
    ],
    resolution="Plug conflict resolved by Toyota's spark plug chart: 2.7L 2TR-FE -> 90919-01287; 3.5L 2GR-FKS -> 90919-01263.",
)

EVIDENCE["90919-01263"] = dict(
    apps=[
        A(2016, 2023, "Tacoma", "2GR-FKS 3.5L V6", "verified", [PLUG("TACOMA 2016- V6 (2GRFKS) FK20HBR8 -> 90919-01263")]),
        A(2018, 2024, "Camry", "2GR-FKS 3.5L V6", "verified", [PLUG("CAMRY 2018- V6 (2GRFKS) -> 90919-01263")]),
        A(2017, 2022, "Highlander", "2GR-FKS 3.5L V6", "verified", [PLUG("HIGHLANDER 2017- V6 (2GRFKS) -> 90919-01263")]),
    ],
    resolution="One dealer page marks 90919-01263 'no longer available'; Toyota's 2022 chart still lists it. Availability must be confirmed with the supplier; fitment is not in question.",
)

EVIDENCE["90919-01275"]["apps"] = [
    A(2009, 2019, "Corolla", "2ZR-FE 1.8L", "verified",
      [PLUG("COROLLA 2009-2019 L4 (2ZRF#) SC16HR11 -> 90919-01275")]),
    A(2014, 2019, "Corolla", "2ZR-FAE 1.8L", "verified",
      [PLUG("COROLLA 2009-2019 L4 (2ZRF#) SC16HR11 -> 90919-01275")], restriction="LE Eco"),
]

EVIDENCE["90919-A2009"]["apps"] = [
    A(2019, 2024, "RAV4", "A25A-FKS 2.5L", "verified",
      [E("dealer_catalog", "Lakeland Toyota (2019 RAV4 direct ignition coil)", f"{LK}/toyota_2019_RAV4/Direct-Ignition-Coil/14786875/90919A2009.html"),
       E("dealer_catalog", "ToyotaPartsDeal (2020 RAV4)", f"{TD}/oem-2020-toyota-rav4-ignition_coil.html"),
       E("dealer_catalog", "ToyotaPartsDeal (2024 RAV4)", f"{TD}/oem-2024-toyota-rav4-ignition_coil.html")],
      restriction="gas (non-hybrid)"),
    A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "removed",
      [E("dealer_catalog", "Lakeland Toyota (90919-A2010, hybrid)", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-direct-ignition-coil-90919a2010")],
      reason="Hybrid models use 90919-A2010."),
]
EVIDENCE["90919-A2009"]["blocking"] = []
EVIDENCE["90919-A2009"]["resolution"] = "A2009 / A2010 is a powertrain split (gas / hybrid), not a production-date conflict."

EVIDENCE["04465-33480"] = dict(
    apps=[
        A(2018, 2019, "Camry", "A25A-FKS 2.5L", "vin_dependent",
          [E("toyota_official", "Toyota parts (pad kit)", f"{TA}/pad-kit-disc-brake-0446533480"),
           E("dealer_catalog", "Frontier Toyota (2018-2019 Camry JPP Japan built; 2019-2020 RAV4 JPP)", "https://parts.frontiertoyota.com/oem-parts/toyota-oem-front-brake-pad-set-2018-2019-camry-jpp-japan-built-2019-2020-rav4-jpp-japan-built-446533480")],
          restriction="Japan-built (JPP)", origin="Japan-built"),
        A(2019, 2020, "RAV4", "", "vin_dependent",
          [E("dealer_catalog", "Frontier Toyota (2019-2020 RAV4 JPP Japan built)", "https://parts.frontiertoyota.com/oem-parts/toyota-oem-front-brake-pad-set-2018-2019-camry-jpp-japan-built-2019-2020-rav4-jpp-japan-built-446533480")],
          restriction="Japan-built (JPP)", origin="Japan-built"),
        A(2020, 2024, "Camry", "A25A-FKS 2.5L", "removed", [],
          reason="Japan-built application is 2018-2019 only; US-built Camrys use 04465-0E060."),
    ],
    resolution="0E060 / 33480 split is by assembly plant: Japan-built (JPP) -> 04465-33480; USA-built -> 04465-0E060.",
)
EVIDENCE["04465-0E060"]["blocking"] = []
EVIDENCE["04465-0E060"]["apps"][1]["restriction"] = "North American-built; Japan-built 2019-2020 units use 04465-33480; end year 2023 / 2024 varies"
EVIDENCE["04465-0E060"]["apps"][1]["assemblyOrigin"] = "North American-built"
EVIDENCE["04465-0E060"]["resolution"] = "Split with 04465-33480 by assembly plant (Frontier Toyota JPP note, Scarborough 'USA Built; w/o TRD')."

EVIDENCE["04465-04090"]["apps"] = [
    A(2016, 2023, "Tacoma", "", "verified",
      [E("dealer_catalog", "ToyotaPartsNow (2023 Tacoma: Limited, SR, SR5, Trail, TRD Off-Road, TRD Pro, TRD Sport; 2.7L and 3.5L)", f"{TN}/parts-select/2023-toyota-tacoma-brake-pad-set"),
       E("toyota_official", "Toyota parts (front pad kit)", f"{TA}/pad-kit-disc-brake-0446504090")]),
]
EVIDENCE["04465-04090"]["resolution"] = "Catalog lists every 2016-2023 trim including SR (2WD and 4WD); the 2WD question is resolved."

EVIDENCE["17801-0P100"]["resolution"] = "Snorkel-equipped trucks: no catalog names an alternative filter; the 'without snorkel' restriction stays on the listing."
EVIDENCE["43512-06200"]["apps"].append(
    A(2019, 2024, "RAV4", "A25A-FXS 2.5L hybrid", "unresolved",
      [E("dealer_catalog", "dealer notes conflict (with / without hybrid)", f"{TD}/oem/toyota~disc~fr~43512-06200.html")],
      reason="Dealer notes conflict on hybrid fitment; needs a VIN-level lookup."))


# ---------------------------------------------------------------------------
# Source classification correction (2026-11-19). ToyotaPartsDeal describes
# itself as an online store whose parts ship from authorized Toyota dealers;
# it is operated by Original Parts Giant, and ToyotaPartsNow runs on the same
# platform. Neither is a dealer catalog, so their pages are reclassified as
# `retailer`: they remain recorded as evidence and price sources but cannot
# establish fitment on their own. Any listed application left without a
# Toyota or dealer catalog source becomes `unresolved` until corroborated.
# ---------------------------------------------------------------------------
import re as _re

RETAILER_HOSTS = _re.compile(r"toyotaparts(deal|now)\.com")
STRONG = ("toyota_official", "dealer_catalog")


def _reclassify(ev_map, engines=False):
    for pn, ev in ev_map.items():
        for a in ev["apps"]:
            for e in a["evidence"]:
                if e["kind"] == "dealer_catalog" and RETAILER_HOSTS.search(e["url"]):
                    e["kind"] = "retailer"
            if engines or a["status"] not in ("verified", "vin_dependent"):
                continue
            if not any(e["kind"] in STRONG for e in a["evidence"]):
                a["status"] = "unresolved"
                a["reason"] = ("Only retailer catalog evidence (ToyotaPartsDeal / ToyotaPartsNow) after the 2026-11-19 source "
                               "reclassification; needs a Toyota or dealer catalog source.")
        for sx in ev.get("supersession", []):
            for e in sx["evidence"]:
                if e["kind"] == "dealer_catalog" and RETAILER_HOSTS.search(e["url"]):
                    e["kind"] = "retailer"
            if sx["status"] == "verified" and not any(e["kind"] in STRONG + ("dealer_catalog_ca",) for e in sx["evidence"]):
                sx["status"] = "unresolved"
                sx["reason"] = "Seen on a retailer catalog only (ToyotaPartsDeal / ToyotaPartsNow)."


CORROBORATION = {}  # pn -> list of (model, yearFrom, yearTo, evidence) added after reclassification


def apply_reclassification():
    for pn, items in CORROBORATION.items():
        for model, y1, y2, ev in items:
            for a in EVIDENCE[pn]["apps"]:
                if a["model"] == model and a["yearFrom"] == y1 and a["yearTo"] == y2:
                    a["evidence"].append(ev)
    _reclassify(EVIDENCE)
    _reclassify(ENGINE_EVIDENCE, engines=True)

CORROBORATION.update({
    "17801-F0050": [("Camry", 2018, 2024, E("dealer_catalog", "Olathe Toyota (2018-2026 Toyota; Avalon, Camry, Highlander, RAV4)", "https://parts.olathetoyota.com/oem-parts/toyota-air-filter-17801f0050"))],
    "43512-06200": [("Camry", 2018, 2024, E("dealer_catalog", "Olathe Toyota (Camry 2.5L / 3.5L, without hybrid, without TRD; US built; 2019-20 Canada-built note)", "https://parts.olathetoyota.com/oem-parts/toyota-disc-brake-rotor-front-4351206200"))],
})
