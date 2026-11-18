#!/usr/bin/env python3
"""Build the Toyota catalog-expansion batch 1 import file (JSON + CSV).

Research data below was gathered 2026-11-18 from Toyota's own parts site
(autoparts.toyota.com) and Toyota-dealer parts catalogs (toyotapartsdeal.com,
toyotapartsnow.com, parts.olathetoyota.com, sparksparts.com,
parts.northparktoyota.com, parts.lakelandtoyota.com). Marketplace (eBay,
Walmart) listings are never counted as fitment evidence.

Groups (owner's definitions):
  ready              verified fitment + image rights + approved price
  commercial_pending identity and US fitment verified; awaiting approved
                     price and vendor-supplied / licensed photos
  research_pending   identity, fitment or engine unit details unresolved

No record here has an approved selling price or licensed image, so none is
"ready". `referencePrice` is market research, never a DrivoraParts price.

Run: python3 scripts/build-toyota-expansion-batch.py
Writes docs/catalog-expansion/toyota-expansion-batch-1.{json,csv}
"""
import csv
import json
import os

OUT_DIR = "docs/catalog-expansion"

TD = "https://www.toyotapartsdeal.com"
TN = "https://www.toyotapartsnow.com"
TA = "https://autoparts.toyota.com/products/product"
OL = "https://parts.olathetoyota.com/oem-parts"
SP = "https://www.sparksparts.com/oem-parts"


def app(y1, y2, model, sub=None):
    return {"yearFrom": y1, "yearTo": y2, "make": "Toyota", "model": model, "submodel": sub}


# fmt: off
PARTS = [
    # ---------------- Filters & maintenance ----------------
    dict(pn="17801-F0050", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium-high",
         apps=[app(2019, 2024, "RAV4", "2.5L gas, non-hybrid"), app(2018, 2024, "Camry", "2.5L / 3.5L gas, non-hybrid")],
         engines="A25A-FKS; 2GR-FKS", supersedes="17801-25020; 17801-F0070",
         notes="Hybrid RAV4 uses 17801-77050; Hybrid Camry uses 17801-F0020.",
         sources=["https://parts.lakelandtoyota.com/p/TOYOTA__RAV-4-LE/Engine-Air-Filter/14760743/17801F0050.html", f"{TD}/oem-2019-toyota-rav4-air_filter.html", f"{TN}/oem/toyota~air-filter-element-sub-assembly~17801-f0050"]),
    dict(pn="17801-0P100", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium-high",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="17801-0S020",
         notes="2.7L Tacoma uses 17801-0C040.",
         sources=[f"{SP}/toyota-toyota-air-filter-element-sequoia-tacoma-178010p100", f"{TD}/oem-2016-toyota-tacoma-air_filter.html"]),
    dict(pn="17801-0C040", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2016, 2023, "Tacoma", "2.7L 4-cyl")], engines="2TR-FE", supersedes="",
         notes="Dealer range 2005-2023; listed here only for the 2016-2023 2.7L confirmed by VIN-based fitment.",
         sources=[f"{SP}/toyota-air-filter-178010c040", "https://parts.northparktoyota.com/oem-parts/toyota-air-filter-178010c040"]),
    dict(pn="17801-0P051", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2024, 2025, "Tacoma", "2.4L turbo")], engines="T24A-FTS", supersedes="",
         notes="Also listed for earlier Camry/Highlander/Sienna/Avalon; those engine splits are unresolved and not claimed.",
         sources=[f"{TD}/oem/toyota~element~sub~assy~ai~17801-0p051.html", f"{TD}/oem-2024-toyota-tacoma-air_filter.html"]),
    dict(pn="17801-38051", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2010, 2024, "4Runner", "4.0L V6")], engines="1GR-FE", supersedes="17801-38050",
         notes="One dealer lists replacement by 17801-YZZ13; confirm current number at order.",
         sources=[f"{OL}/toyota-air-filter-1780138051", f"{TD}/oem-2024-toyota-4runner-air_filter.html"]),
    dict(pn="17801-F0020", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2020, 2024, "Corolla", "2.0L / 1.8L Hybrid"), app(2018, 2024, "Camry", "2.5L Hybrid")], engines="M20A-FKS; 2ZR-FXE; A25A-FXS", supersedes="17801-F0030",
         notes="",
         sources=[f"{SP}/toyota-2018-2024-toyota-air-filter-17801f0020", f"{OL}/toyota-air-filter-17801f0020"]),
    dict(pn="04152-YZZA1", kind="oil_filter", name="Oil Filter Element", group="commercial_pending", conf="medium",
         apps=[app(2018, 2024, "Camry", "2.5L / 3.5L"), app(2017, 2023, "Highlander", "3.5L V6"), app(2016, 2023, "Tacoma", "3.5L V6")], engines="A25A-FKS; 2GR-FKS", supersedes="",
         notes="Cartridge element; replace the housing O-ring with each change.",
         sources=[f"{TD}/oem/toyota~replaceable~element~04152-yzza1.html", f"{SP}/toyota-toyota-oil-filter-camry-highlander-rav4-sienna-tacoma-venza-4152yzza1", f"{TA}/replaceable-element-oil-filter-04152yzza1"]),
    dict(pn="04152-YZZA6", kind="oil_filter", name="Oil Filter Element", group="commercial_pending", conf="medium",
         apps=[app(2009, 2018, "Corolla", "1.8L")], engines="2ZR-FE", supersedes="04152-37010",
         notes="Not claimed for the 2.0L M20A-FKS.",
         sources=[f"{TD}/oem/toyota~replaceable~element~04152-yzza6.html", f"{TN}/oem/toyota~replaceable-element~04152-yzza6"]),
    dict(pn="90915-YZZD3", kind="oil_filter_spin", name="Spin-On Oil Filter", group="commercial_pending", conf="medium",
         apps=[app(2005, 2015, "Tacoma", "4.0L V6"), app(2003, 2009, "4Runner", "4.0L V6 / 4.7L V8"), app(2000, 2010, "Tundra", "4.0L V6 / 4.7L V8")], engines="1GR-FE; 2UZ-FE", supersedes="",
         notes="2.7L Tacoma fitment disputed between dealer catalogs and not claimed.",
         sources=[f"{TD}/oem/toyota~filter~oil~90915-yzzd3.html", f"{OL}/toyota-oil-filter-90915yzzd3", f"{SP}/toyota-1984-2015-toyota-engine-oil-filter-tacoma-tundra-4runner-fj-cruiser-land-cruiser-90915yzzd3"]),
    dict(pn="90915-YZZN3", kind="oil_filter_spin", name="Spin-On Oil Filter", group="commercial_pending", conf="medium",
         apps=[app(2024, 2025, "Tacoma", "2.4L turbo")], engines="T24A-FTS", supersedes="90915-10010",
         notes="2025+ 4Runner fitment is seller-stated only and not claimed.",
         sources=[f"{TA}/filter-oil-90915yzzn3", f"{TN}/oem/toyota~filter-oil~90915-yzzn3"]),
    dict(pn="87139-0R030", kind="cabin_filter", name="Cabin Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2019, 2023, "RAV4"), app(2019, 2024, "Corolla")], engines="", supersedes="87139-28020",
         notes="Some RAV4 trims list 87139-58010 instead; check the existing filter.",
         sources=[f"{TA}/element-air-refiner-871390r030", f"{SP}/toyota-cabin-air-filter-871390r030", f"{TN}/oem/toyota~air-refiner-element~87139-0r030"]),
    dict(pn="87139-0E040", kind="cabin_filter", name="Cabin Air Filter (Deodorizing)", group="commercial_pending", conf="medium",
         apps=[app(2018, 2024, "Camry")], engines="", supersedes="",
         notes="2018-2019 Camry also listed for 87139-58010.",
         sources=[f"{TA}/element-air-refiner-871390e040", f"{TD}/oem-2024-toyota-camry-cabin_air_filter.html", "https://parts.northparktoyota.com/oem-parts/toyota-cabin-air-filter-871390e040"]),
    dict(pn="87139-58010", kind="cabin_filter", name="Cabin Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2020, 2024, "Highlander"), app(2021, 2024, "Sienna")], engines="", supersedes="",
         notes="Also listed for 2018-2019 Camry and some 2019-2024 RAV4 trims.",
         sources=[f"{TD}/oem/toyota~element~air~refiner~87139-58010.html", f"{TA}/element-air-refiner-8713958010"]),
    # ---------------- Ignition ----------------
    dict(pn="90919-01289", kind="spark_plug", name="Iridium Spark Plug", group="commercial_pending", conf="medium",
         apps=[app(2019, 2024, "RAV4", "2.5L"), app(2018, 2024, "Camry", "2.5L")], engines="A25A-FKS", supersedes="90919-A1001",
         notes="Sold individually; four required.",
         sources=[f"{OL}/toyota-spark-plug-9091901289", f"{TD}/oem-2019-toyota-rav4-spark_plug.html"]),
    dict(pn="90919-02258", kind="ignition_coil", name="Direct Ignition Coil", group="commercial_pending", conf="medium-high",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="90919-02248; 90919-02252",
         notes="Sold individually; a V6 uses six.",
         sources=[f"{TA}/coil-ignition-9091902258", f"{TD}/oem/toyota~coil~ignition~90919-02258.html", f"{OL}/toyota-direct-ignition-coil-9091902258"]),
    # ---------------- Brakes ----------------
    dict(pn="04465-04090", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium-high",
         apps=[app(2016, 2023, "Tacoma")], engines="2TR-FE; 2GR-FKS", supersedes="",
         notes="Pads only; fitting hardware sold separately. Manufacturer note: Mark Advics VC070H.",
         ref=74.93, ref_src=f"{TD}/oem/toyota~pad~kit~disc~brake~04465-04090.html",
         sources=[f"{OL}/toyota-brake-pads-front-446504090", f"{TD}/oem/toyota~pad~kit~disc~brake~04465-04090.html", f"{TA}/pad-kit-disc-brake-0446504090"]),
    dict(pn="43512-04052", kind="rotor_front", name="Front Disc Brake Rotor", group="commercial_pending", conf="medium-high",
         apps=[app(2005, 2023, "Tacoma")], engines="", supersedes="43512-04050; 43512-04051",
         notes="Fits left or right; replace in pairs. 2024+ Tacoma uses 43512-04060.",
         sources=[f"{TD}/oem/toyota~disc~front~43512-04052.html", f"{OL}/toyota-disc-brake-rotor-front-4351204052", f"{SP}/toyota-rotor-4351204052"]),
    dict(pn="04465-0C020", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium-high",
         apps=[app(2007, 2018, "Tundra"), app(2008, 2018, "Sequoia")], engines="1GR-FE; 2UZ-FE; 1UR-FE; 3UR-FE", supersedes="",
         notes="Ceramic; four pads; hardware sold separately. One dealer ends at 2017.",
         sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~front~pad~only~04465-0c020.html", f"{SP}/toyota-genuine-oem-toyota-front-right-and-left-brake-pads-sequoia-and-tundra-44650c020", f"{TA}/pad-kit-disc-brake-044650c020"]),
    dict(pn="43512-06200", kind="rotor_front", name="Front Disc Brake Rotor", group="commercial_pending", conf="medium-high",
         apps=[app(2018, 2024, "Camry"), app(2019, 2024, "RAV4"), app(2022, 2025, "Corolla Cross")], engines="", supersedes="",
         notes="Fitment can vary by trim and brake package; confirm by VIN.",
         ref=76.0, ref_src=f"{TD}/oem/toyota~disc~fr~43512-06200.html",
         sources=[f"{TD}/oem/toyota~disc~fr~43512-06200.html", f"{OL}/toyota-disc-brake-rotor-front-4351206200"]),
    dict(pn="04465-0E060", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium",
         apps=[app(2018, 2024, "Camry", "2.5L"), app(2019, 2024, "RAV4")], engines="A25A-FKS", supersedes="",
         notes="TRD and some trims use different pads.",
         ref=75.0, ref_src=f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0e060.html",
         sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0e060.html", f"{OL}/toyota-disc-brake-pad-set-front-44650e060", f"{SP}/toyota-brake-pads-44650e060"]),
    dict(pn="04465-06170", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium",
         apps=[app(2023, 2024, "Camry", "US-built from 02/2023")], engines="", supersedes="",
         notes="Production-date restricted: US-built units from 02/2023.",
         sources=["https://parts.northparktoyota.com/oem-parts/toyota-disc-brake-pad-set-446506170"]),
    dict(pn="04465-35330", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium",
         apps=[app(2019, 2024, "4Runner", "4.0L V6")], engines="1GR-FE", supersedes="04465-35190; 04465-35230",
         notes="Manufacturer note: Mark Advics PV565H.",
         sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-35330.html", f"{TD}/oem-2020-toyota-4runner-brake_pad_set.html"]),
    dict(pn="04465-02530", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium",
         apps=[app(2021, 2022, "Highlander", "2.4L / 2.5L / 3.5L")], engines="T24A-FTS; A25A-FXS; 2GR-FKS", supersedes="",
         notes="Manufacturer note: Mark Advics VC084H. Other years unconfirmed.",
         sources=[f"{TA}/pad-kit-disc-brake-0446502530", f"{TD}/oem-2022-toyota-highlander-brake_pad_set.html"]),
    # ---------------- Cooling / electrical / wheel ends ----------------
    dict(pn="16032-F0011", kind="water_pump", name="Engine Water Pump", group="commercial_pending", conf="medium",
         apps=[app(2019, 2024, "RAV4", "2.5L gas, non-hybrid"), app(2018, 2024, "Camry", "2.5L gas, non-hybrid")], engines="A25A-FKS", supersedes="",
         notes="Includes water pump gasket and thermostat housing per dealer catalog.",
         sources=[f"{TD}/oem-2019-toyota-rav4-water_pump.html", "https://parts.olathetoyota.com/v-2019-toyota-rav4--limited--2-5l-l4-gas/cooling-system--radiator-and-components"]),
    dict(pn="27060-F0010", kind="alternator", name="Alternator Assembly with Regulator (100A)", group="commercial_pending", conf="medium",
         apps=[app(2018, 2024, "Camry", "2.5L gas, non-hybrid"), app(2020, 2022, "Avalon", "2.5L gas")], engines="A25A-FKS", supersedes="",
         notes="12V 100A.",
         sources=[f"{OL}/toyota-alternator-27060f0010", f"{TD}/oem/toyota~alternator~assy~w~r~27060-f0010.html", f"{SP}/toyota-alternator-27060f0010"]),
    dict(pn="43550-0R060", kind="hub_bearing", name="Front Wheel Bearing and Hub Assembly", group="commercial_pending", conf="medium-high",
         apps=[app(2019, 2024, "RAV4", "2.5L"), app(2021, 2024, "Venza")], engines="A25A-FKS; A25A-FXS", supersedes="43550-33070",
         notes="Side-specific; confirm left/right. RAV4 Prime uses 43550-42030.",
         ref=277.11, ref_src=f"{TD}/oem/toyota~hub~bearing~assy~43550-0r060.html",
         sources=[f"{TD}/oem/toyota~hub~bearing~assy~43550-0r060.html", f"{SP}/toyota-hub-assembly-435500r060"]),
    dict(pn="43512-0R010", kind="rotor_front", name="Front Disc Brake Rotor", group="commercial_pending", conf="medium",
         apps=[app(2009, 2018, "RAV4")], engines="", supersedes="",
         notes="2019+ RAV4 uses 43512-06200.",
         sources=[f"{OL}/toyota-disc-brake-rotor-front-435120r010", f"{TD}/oem/toyota~disc~fr~43512-0r010.html"]),
    # ---------------- Research pending (identity/fitment unresolved) ----------------
    dict(pn="90919-A2009", kind="ignition_coil", name="Direct Ignition Coil", group="research_pending", conf="low",
         apps=[app(2019, 2024, "RAV4", "2.5L")], engines="A25A-FKS; A25A-FXS", supersedes="",
         notes="Single dealer source; needs a second catalog.", sources=[f"{TD}/oem-toyota-rav4-ignition_coil.html"]),
    dict(pn="04465-42200", kind="pads_front", name="Front Disc Brake Pad Set", group="research_pending", conf="low",
         apps=[app(2019, 2024, "RAV4")], engines="", supersedes="04465-42160",
         notes="Toyota confirms identity; RAV4 years not shown. MSRP $104.50 at one dealer.",
         ref=75.25, ref_src=f"{TA}/pad-kit-disc-brake-l-fitting-parts-fr-0446542200", sources=[f"{TA}/pad-kit-disc-brake-l-fitting-parts-fr-0446542200"]),
    dict(pn="04465-42220", kind="pads_front", name="Front Disc Brake Pad Set", group="research_pending", conf="low",
         apps=[app(2013, 2018, "RAV4")], engines="2AR-FE", supersedes="04465-0R010",
         notes="Dealer shows 04465-0R010 (2009-2018 RAV4) replaced by 42220; 42220's own fitment not yet confirmed.",
         sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0r010.html", f"{TA}/pad-kit-disc-brake-044650r010"]),
    dict(pn="04465-33480", kind="pads_front", name="Front Disc Brake Pad Set", group="research_pending", conf="low",
         apps=[app(2018, 2019, "Camry", "LE / SE 2.5L")], engines="A25A-FKS", supersedes="",
         notes="Overlaps 04465-0E060; resolve which is current.", sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-33480.html"]),
    dict(pn="90919-01287", kind="spark_plug", name="Iridium Spark Plug", group="research_pending", conf="low",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="",
         notes="Conflicts with 90919-01263 for the same engine.", ref=17.48, ref_src=f"{TD}/oem/toyota~plug~spark~90919-01287.html",
         sources=[f"{TD}/oem/toyota~plug~spark~90919-01287.html", f"{TA}/plug-spark-9091901287"]),
    dict(pn="90919-01263", kind="spark_plug", name="Iridium Spark Plug", group="research_pending", conf="low",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="",
         notes="Conflicts with 90919-01287.", sources=[f"{SP}/toyota-spark-plug-9091901263", f"{OL}/toyota-spark-plug-9091901263"]),
    dict(pn="90919-01275", kind="spark_plug", name="Iridium Spark Plug", group="research_pending", conf="low",
         apps=[app(2009, 2019, "Corolla", "1.8L")], engines="2ZR-FE", supersedes="90919-01253",
         notes="Retailer-stated 1.8L fitment only.", sources=[f"{TA}/plug-spark-9091901275", "https://parts.northparktoyota.com/oem-parts/toyota-spark-plug-9091901275"]),
    dict(pn="90915-YZZN1", kind="oil_filter_spin", name="Spin-On Oil Filter", group="research_pending", conf="low",
         apps=[app(2020, 2024, "Corolla", "2.0L")], engines="M20A-FKS", supersedes="90915-10009",
         notes="Supersession inferred from one dealer page.", sources=[f"{TD}/oem-2020-toyota-corolla-oil_filter.html"]),
    dict(pn="04152-YZZA5", kind="oil_filter", name="Oil Filter Element", group="research_pending", conf="low",
         apps=[app(2010, 2015, "Tundra")], engines="1UR-FE / 3UR-FE (unresolved)", supersedes="04152-31050; 04152-31060; 04152-38010",
         notes="Dealer catalogs conflict on engine.", sources=[f"{TD}/oem/toyota~replaceable~element~04152-yzza5.html", f"{OL}/toyota-oil-filter-4152yzza5"]),
    dict(pn="87139-YZZ08", kind="cabin_filter", name="Cabin Air Filter", group="research_pending", conf="low",
         apps=[app(2018, 2024, "Camry")], engines="", supersedes="",
         notes="Marketplace-only fitment.", sources=[]),
    dict(pn="87139-50100", kind="cabin_filter", name="Cabin Air Filter", group="research_pending", conf="low",
         apps=[app(2010, 2024, "4Runner")], engines="", supersedes="87139-50060",
         notes="Dealer listing internally inconsistent.", sources=[f"{TD}/oem/toyota~element~air~refiner~87139-50100.html"]),
    dict(pn="43550-0R070", kind="hub_bearing", name="Front Wheel Bearing and Hub Assembly", group="research_pending", conf="low",
         apps=[app(2019, 2024, "RAV4")], engines="", supersedes="43550-33050",
         notes="Listed 'with body stripe' -- side/trim restriction unresolved.", ref=261.22, ref_src=f"{TD}/oem/toyota~hub~bearing~assy~43550-0r070.html",
         sources=[f"{TD}/oem/toyota~hub~bearing~assy~43550-0r070.html"]),
    dict(pn="43512-0E060", kind="rotor_front", name="Front Disc Brake Rotor", group="research_pending", conf="low",
         apps=[app(2020, 2024, "Highlander")], engines="", supersedes="",
         notes="Several front rotor numbers listed for this generation; engine split unresolved.", sources=[f"{TA}/disc-fr-435120e060"]),
    dict(pn="27060-25010", kind="alternator", name="Alternator Assembly with Regulator", group="research_pending", conf="low",
         apps=[app(2019, 2024, "RAV4"), app(2019, 2024, "Corolla")], engines="", supersedes="",
         notes="Dealers disagree on Camry years.", sources=[f"{TD}/oem/toyota~alternator~assy~w~r~27060-25010.html"]),
]

# Engine assemblies: real US applications per family, but a listing needs the
# vendor's actual unit (new / reman / used, mileage, what is included).
ENGINES = [
    dict(code="A25A-FKS", desc="2.5L inline-4 (Dynamic Force)", apps=[app(2018, 2024, "Camry"), app(2019, 2024, "RAV4")]),
    dict(code="2GR-FKS", desc="3.5L V6", apps=[app(2018, 2024, "Camry"), app(2017, 2019, "Highlander"), app(2016, 2023, "Tacoma"), app(2017, 2020, "Sienna")]),
    dict(code="2GR-FE", desc="3.5L V6", apps=[app(2007, 2017, "Camry"), app(2008, 2016, "Highlander"), app(2007, 2016, "Sienna")]),
    dict(code="2AR-FE", desc="2.5L inline-4", apps=[app(2009, 2017, "Camry"), app(2009, 2018, "RAV4")]),
    dict(code="2TR-FE", desc="2.7L inline-4", apps=[app(2005, 2023, "Tacoma")]),
    dict(code="1GR-FE", desc="4.0L V6", apps=[app(2010, 2024, "4Runner"), app(2005, 2015, "Tacoma")]),
    dict(code="3UR-FE", desc="5.7L V8", apps=[app(2007, 2021, "Tundra"), app(2008, 2022, "Sequoia")]),
    dict(code="2ZR-FE", desc="1.8L inline-4", apps=[app(2009, 2019, "Corolla")]),
    dict(code="M20A-FKS", desc="2.0L inline-4 (Dynamic Force)", apps=[app(2020, 2024, "Corolla")]),
]
# fmt: on

CATEGORY = {
    "air_filter": ("filters-maintenance", "Filters & Maintenance"),
    "oil_filter": ("filters-maintenance", "Filters & Maintenance"),
    "oil_filter_spin": ("filters-maintenance", "Filters & Maintenance"),
    "cabin_filter": ("filters-maintenance", "Filters & Maintenance"),
    "spark_plug": ("ignition", "Ignition"),
    "ignition_coil": ("ignition", "Ignition"),
    "pads_front": ("brakes", "Brakes"),
    "rotor_front": ("brakes", "Brakes"),
    "water_pump": ("cooling", "Cooling System"),
    "alternator": ("electrical", "Electrical"),
    "hub_bearing": ("suspension", "Suspension & Wheel Ends"),
}


def fit_text(apps):
    out = []
    for a in apps:
        years = f"{a['yearFrom']}–{a['yearTo']}" if a["yearFrom"] != a["yearTo"] else str(a["yearFrom"])
        sub = f" ({a['submodel']})" if a.get("submodel") else ""
        out.append(f"{years} Toyota {a['model']}{sub}")
    return "; ".join(out)


def models_phrase(apps):
    names = []
    for a in apps:
        if a["model"] not in names:
            names.append(a["model"])
    if len(names) == 1:
        return f"Toyota {names[0]}"
    return "Toyota " + ", ".join(names[:-1]) + f" and {names[-1]}"


def describe(p):
    m = models_phrase(p["apps"])
    fit = fit_text(p["apps"])
    sup = f" It supersedes {p['supersedes']}." if p.get("supersedes") else ""
    k = p["kind"]
    body = {
        "air_filter": f"Genuine Toyota engine air filter {p['pn']} for the {m}. The pleated element sits in the factory air box and stops dust and road debris before they reach the throttle body and cylinders. Toyota's maintenance schedule calls for inspection at every service and replacement on a set mileage interval, sooner in dusty conditions.",
        "oil_filter": f"Genuine Toyota oil filter element {p['pn']} for the {m}. This is a cartridge-type element that drops into the engine's filter housing, so only the paper element and seals are replaced at each oil change, not a whole canister.",
        "oil_filter_spin": f"Genuine Toyota spin-on oil filter {p['pn']} for the {m}. It threads onto the engine's filter mount and is replaced as a complete unit at each oil change.",
        "cabin_filter": f"Genuine Toyota cabin air filter {p['pn']} for the {m}. It cleans the air entering the cabin through the heating and air-conditioning system, and a clogged filter is a common cause of weak airflow and musty smells from the vents.",
        "spark_plug": f"Genuine Toyota iridium spark plug {p['pn']} for the {m}. It is the plug specified for this engine's heat range and gap, sold individually.",
        "ignition_coil": f"Genuine Toyota direct ignition coil {p['pn']} for the {m}. Each cylinder has its own coil mounted directly on the spark plug; a failing coil typically sets a cylinder-specific misfire code. Sold individually.",
        "pads_front": f"Genuine Toyota front disc brake pad set {p['pn']} for the {m}. The set covers one front axle, both sides.",
        "rotor_front": f"Genuine Toyota front disc brake rotor {p['pn']} for the {m}. Sold individually; rotors should be replaced in pairs across the axle.",
        "water_pump": f"Genuine Toyota engine water pump {p['pn']} for the {m}. It circulates coolant through the engine and radiator; leaks at the weep hole or bearing noise are the usual signs of failure.",
        "alternator": f"Genuine Toyota alternator assembly with regulator {p['pn']} for the {m}. It charges the battery and powers the vehicle's electrical system while the engine runs.",
        "hub_bearing": f"Genuine Toyota front wheel bearing and hub assembly {p['pn']} for the {m}. The bearing comes pressed into the hub as one assembly. A worn bearing usually shows up as a growl that changes with speed or when turning.",
    }[k]
    notes = f" {p['notes']}" if p.get("notes") else ""
    return (
        f"{body}{sup}{notes}\n\n"
        f"Specifications\n\nPart number: {p['pn']}\nBrand: Toyota\nType: Genuine Toyota part\nCondition: New\n"
        + (f"Engines: {p['engines']}\n" if p.get("engines") else "")
        + f"Fitment: {fit}\n\nConfirm fitment with your VIN before ordering."
    )


records, rows = [], []
for p in PARTS:
    cat_slug, cat_name = CATEGORY[p["kind"]]
    fit = fit_text(p["apps"])
    rec = {
        "status": p["group"],
        "name": f"Genuine Toyota {p['name']} {p['pn']} — {models_phrase(p['apps']).replace('Toyota ', '')}",
        "brand": "toyota",
        "manufacturer": "Toyota",
        "partNumber": p["pn"],
        "supersedes": p.get("supersedes", ""),
        "partType": "Genuine Toyota",
        "condition": "brand-new",
        "proposedCategory": cat_slug,
        "proposedCategoryName": cat_name,
        "fitment": fit,
        "fitmentApplications": p["apps"],
        "engines": p.get("engines", ""),
        "description": describe(p),
        "price": None,
        "referencePrice": p.get("ref"),
        "referencePriceSource": p.get("ref_src", ""),
        "image": None,
        "imageStatus": "pending: no licensed image source; needs vendor photo or licensed distributor feed",
        "fitmentConfidence": p["conf"],
        "sources": p["sources"],
        "blocking": ["approved selling price", "licensed product image"] + (["fitment / identity verification"] if p["group"] == "research_pending" else []),
    }
    records.append(rec)

for e in ENGINES:
    fit = fit_text(e["apps"])
    records.append({
        "status": "research_pending",
        "name": f"Toyota {e['code']} {e['desc']} Engine Assembly",
        "brand": "toyota",
        "manufacturer": "Toyota",
        "partNumber": "",
        "supersedes": "",
        "partType": "Toyota engine (condition per vendor unit)",
        "condition": None,
        "proposedCategory": "engine",
        "proposedCategoryName": "Engine",
        "fitment": fit,
        "fitmentApplications": e["apps"],
        "engines": e["code"],
        "description": f"Toyota {e['code']} {e['desc']} engine assembly. US applications: {fit}. Condition, mileage, configuration (long block or complete engine) and included components are set from the vendor's actual unit before listing.",
        "price": None, "referencePrice": None, "referencePriceSource": "",
        "image": None, "imageStatus": "pending: photos of the actual unit required",
        "fitmentConfidence": "medium (engine-family applications; unit-level interchange to confirm)",
        "sources": ["https://8020automotive.com/toyota-2gr-fks-engine-guide/", "https://www.carwhere.com/toyota/engines"] if e["code"] == "2GR-FKS" else [],
        "blocking": ["vendor unit details (condition, mileage, inclusions)", "approved selling price", "photos of the unit"],
    })

os.makedirs(OUT_DIR, exist_ok=True)
with open(f"{OUT_DIR}/toyota-expansion-batch-1.json", "w", encoding="utf-8") as f:
    json.dump({
        "_comment": "Toyota catalog expansion batch 1 (2026-11-18). Import file in the catalog's Product shape plus review fields. NOT loaded by the storefront. Validate with: node scripts/check-toyota-expansion.mjs",
        "groups": {
            "ready": sum(r["status"] == "ready" for r in records),
            "commercial_pending": sum(r["status"] == "commercial_pending" for r in records),
            "research_pending": sum(r["status"] == "research_pending" for r in records),
        },
        "records": records,
    }, f, ensure_ascii=False, indent=2)
    f.write("\n")

with open(f"{OUT_DIR}/toyota-expansion-batch-1.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["status", "name", "brand", "part_number", "supersedes", "type", "category", "fitment", "engines",
                "confidence", "reference_price_usd", "reference_price_source", "image_status", "blocking", "sources"])
    for r in records:
        w.writerow([r["status"], r["name"], "Toyota", r["partNumber"], r["supersedes"], r["partType"],
                    r["proposedCategoryName"], r["fitment"], r["engines"], r["fitmentConfidence"],
                    r["referencePrice"] if r["referencePrice"] is not None else "", r["referencePriceSource"],
                    r["imageStatus"], "; ".join(r["blocking"]), " | ".join(r["sources"])])

print(len(records), "records:", {k: sum(r["status"] == k for r in records) for k in ("ready", "commercial_pending", "research_pending")})
