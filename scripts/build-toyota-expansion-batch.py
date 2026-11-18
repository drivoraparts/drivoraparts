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
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from toyota_expansion_pricing import assess  # noqa: E402
from toyota_fitment_evidence import AUDITED, ENGINE_EVIDENCE, EVIDENCE  # noqa: E402

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
         notes="Dealer range 2005-2023; only the 2016-2023 2.7L is claimed here.",
         sources=[f"{SP}/toyota-air-filter-178010c040", "https://parts.northparktoyota.com/oem-parts/toyota-air-filter-178010c040"]),
    dict(pn="17801-0P051", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2024, 2025, "Tacoma", "2.4L turbo")], engines="T24A-FTS", supersedes="",
         notes="Also listed for earlier Camry/Highlander/Sienna/Avalon; those engine splits are unresolved and not claimed.",
         sources=[f"{TD}/oem/toyota~element~sub~assy~ai~17801-0p051.html", f"{TD}/oem-2024-toyota-tacoma-air_filter.html"]),
    dict(pn="17801-38051", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2010, 2024, "4Runner", "4.0L V6")], engines="1GR-FE", supersedes="17801-38050",
         notes="Superseded by 17801-YZZ13; to be listed under the current number.",
         sources=[f"{OL}/toyota-air-filter-1780138051", f"{TD}/oem-2024-toyota-4runner-air_filter.html"]),
    dict(pn="17801-F0020", kind="air_filter", name="Engine Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2020, 2024, "Corolla", "2.0L / 1.8L Hybrid"), app(2018, 2024, "Camry", "2.5L Hybrid")], engines="M20A-FKS; 2ZR-FXE; A25A-FXS", supersedes="17801-F0030",
         notes="",
         sources=[f"{SP}/toyota-2018-2024-toyota-air-filter-17801f0020", f"{OL}/toyota-air-filter-17801f0020"]),
    dict(pn="04152-YZZA1", kind="oil_filter", name="Oil Filter Element", group="commercial_pending", conf="medium",
         apps=[app(2018, 2024, "Camry", "3.5L V6"), app(2017, 2023, "Highlander", "3.5L V6"), app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="",
         notes="Cartridge element; replace the housing O-ring with each change. Not claimed for the 2.5L A25A-FKS: dealer catalogs list spin-on 90915-YZZN1 for the 2019+ RAV4 2.5L and the US-built 2020 Camry 2.5L.",
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
         apps=[app(2022, 2025, "Tundra", "3.4L twin-turbo V6"), app(2023, 2025, "Sequoia", "3.4L twin-turbo V6 hybrid")], engines="V35A-FTS", supersedes="90915-10010",
         notes="2024+ Tacoma and 2025+ 4Runner fitment is seller-stated only and not claimed.",
         sources=[f"{TA}/filter-oil-90915yzzn3", "https://parts.frontiertoyota.com/oem-parts/toyota-oil-filter-90915yzzn3", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-oil-filter-90915yzzn3"]),
    dict(pn="87139-0R030", kind="cabin_filter", name="Cabin Air Filter", group="commercial_pending", conf="medium",
         apps=[app(2019, 2024, "Corolla")], engines="", supersedes="87139-28020",
         notes="RAV4 not claimed: dealers split 2019+ RAV4 trims between this filter and 87139-58010.",
         sources=[f"{TA}/element-air-refiner-871390r030", f"{SP}/toyota-cabin-air-filter-871390r030", f"{TN}/oem/toyota~air-refiner-element~87139-0r030"]),
    dict(pn="87139-0E040", kind="cabin_filter", name="Cabin Air Filter (Deodorizing)", group="commercial_pending", conf="medium",
         apps=[app(2020, 2024, "Camry")], engines="", supersedes="",
         notes="2018-2019 Camry not claimed: those years are also listed for 87139-58010.",
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
    dict(pn="90919-02258", kind="ignition_coil", name="Direct Ignition Coil", group="research_pending", conf="low",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="90919-02248; 90919-02252",
         notes="Not the Tacoma 3.5L coil: dealer listings show 1.8L Corolla / Prius / C-HR / Matrix. The 2016-2023 Tacoma 3.5L (2GR-FKS) coil is 90919-A2008 (ToyotaPartsDeal, OEMGenuineParts; about $93-100) -- add it in batch 2.",
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
         apps=[app(2007, 2017, "Tundra"), app(2008, 2017, "Sequoia")], engines="1GR-FE; 2UZ-FE; 1UR-FE; 3UR-FE", supersedes="",
         notes="Ceramic; four pads; hardware sold separately. 2018 is listed by some dealers only and is not claimed.",
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
         apps=[app(2020, 2024, "4Runner", "4.0L V6")], engines="1GR-FE", supersedes="04465-35190; 04465-35230",
         notes="Manufacturer note: Mark Advics PV565H.",
         sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-35330.html", f"{TD}/oem-2020-toyota-4runner-brake_pad_set.html"]),
    dict(pn="04465-02530", kind="pads_front", name="Front Disc Brake Pad Set", group="commercial_pending", conf="medium",
         apps=[app(2021, 2022, "Highlander", "2.4L / 2.5L / 3.5L")], engines="T24A-FTS; A25A-FXS; 2GR-FKS", supersedes="",
         notes="Manufacturer note: Mark Advics VC084H. Other years unconfirmed.",
         sources=[f"{TA}/pad-kit-disc-brake-0446502530", f"{TD}/oem-2022-toyota-highlander-brake_pad_set.html"]),
    # ---------------- Cooling / electrical / wheel ends ----------------
    dict(pn="16032-F0011", kind="water_inlet", name="Water Inlet Housing", group="commercial_pending", conf="medium",
         apps=[app(2019, 2024, "RAV4", "2.5L gas, non-hybrid"), app(2018, 2024, "Camry", "2.5L gas, non-hybrid")], engines="A25A-FKS", supersedes="",
         notes="Gasket inclusion is not confirmed.",
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
         notes="", sources=[f"{TD}/oem-toyota-rav4-ignition_coil.html"]),
    dict(pn="04465-42200", kind="pads_front", name="Front Disc Brake Pad Set", group="research_pending", conf="low",
         apps=[app(2006, 2012, "RAV4")], engines="", supersedes="04465-42160",
         notes="Corrected: dealers list 2006-2018 applications incl. 2006-2012 RAV4, not the 2019+ RAV4. Year split unresolved.",
         ref=75.25, ref_src=f"{TA}/pad-kit-disc-brake-l-fitting-parts-fr-0446542200", sources=[f"{TA}/pad-kit-disc-brake-l-fitting-parts-fr-0446542200"]),
    dict(pn="04465-42220", kind="pads_front", name="Front Disc Brake Pad Set", group="research_pending", conf="low",
         apps=[app(2013, 2018, "RAV4")], engines="2AR-FE", supersedes="04465-0R010",
         notes="Dealer shows 04465-0R010 (2009-2018 RAV4) replaced by 42220; 42220's own fitment not yet confirmed.",
         sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-0r010.html", f"{TA}/pad-kit-disc-brake-044650r010"]),
    dict(pn="04465-33480", kind="pads_front", name="Front Disc Brake Pad Set", group="research_pending", conf="low",
         apps=[app(2018, 2019, "Camry", "LE / SE 2.5L")], engines="A25A-FKS", supersedes="",
         notes="Overlaps 04465-0E060; resolve which is current.", sources=[f"{TD}/oem/toyota~pad~kit~disc~brake~04465-33480.html"]),
    dict(pn="90919-01287", kind="spark_plug", name="Iridium Spark Plug", group="commercial_pending", conf="medium",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="",
         notes="Six-plus dealer catalogs list it for the 2016-2023 Tacoma; 90919-01263 is also listed for this engine. Sold individually; six required.", ref=17.48, ref_src=f"{TD}/oem/toyota~plug~spark~90919-01287.html",
         sources=[f"{TD}/oem/toyota~plug~spark~90919-01287.html", "https://parts.camelbacktoyota.com/oem-parts/toyota-spark-plug-9091901287", "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-spark-plug-9091901287"]),
    dict(pn="90919-01263", kind="spark_plug", name="Iridium Spark Plug", group="research_pending", conf="low",
         apps=[app(2016, 2023, "Tacoma", "3.5L V6")], engines="2GR-FKS", supersedes="",
         notes="Conflicts with 90919-01287.", sources=[f"{SP}/toyota-spark-plug-9091901263", f"{OL}/toyota-spark-plug-9091901263"]),
    dict(pn="90919-01275", kind="spark_plug", name="Iridium Spark Plug", group="research_pending", conf="low",
         apps=[app(2009, 2019, "Corolla", "1.8L")], engines="2ZR-FE", supersedes="90919-01253",
         notes="Retailer-stated 1.8L fitment only.", sources=[f"{TA}/plug-spark-9091901275", "https://parts.northparktoyota.com/oem-parts/toyota-spark-plug-9091901275"]),
    dict(pn="90915-YZZN1", kind="oil_filter_spin", name="Spin-On Oil Filter", group="research_pending", conf="low",
         apps=[app(2020, 2024, "Corolla", "2.0L"), app(2019, 2024, "RAV4", "2.5L gas, non-hybrid")], engines="M20A-FKS; A25A-FKS", supersedes="90915-10009; 90915-YZZF2",
         notes="Spin-on canister filter. RAV4: Toyota of Glendale lists 90915-YZZN1 for the 2019+ gas 2.5L, and ToyotaPartsDeal lists 90915-10009 (superseded by 90915-YZZN1) for the 2021 RAV4. Camry 2.5L: ToyotaPartsDeal lists it for the US-built 2020 Camry 2.5L only; Japan-built split unresolved, not claimed. Only one attributed competitor price.",
         sources=[f"{TD}/oem-2020-toyota-corolla-oil_filter.html", f"{TD}/oem-2021-toyota-rav4-oil_filter.html", "https://www.toyotaofglendale.com/service/service-parts-tips/rav4-oil-type-capacity/", f"{TD}/oem-2020-toyota-camry-oil_filter.html", "https://autoparts.toyota.com/products/product/filter-s-a-oil-90915yzzn1"]),
    dict(pn="04152-YZZA5", kind="oil_filter", name="Oil Filter Element", group="research_pending", conf="low",
         apps=[app(2010, 2015, "Tundra")], engines="1UR-FE / 3UR-FE (unresolved)", supersedes="04152-31050; 04152-31060; 04152-38010",
         notes="Some catalogs also list 2007-2011 Camry and 2006-2008 RAV4; those are not claimed.", sources=[f"{TD}/oem/toyota~replaceable~element~04152-yzza5.html", f"{OL}/toyota-oil-filter-4152yzza5"]),
    dict(pn="87139-YZZ08", kind="cabin_filter", name="Cabin Air Filter", group="research_pending", conf="low",
         apps=[app(2018, 2024, "Camry")], engines="", supersedes="",
         notes="Superseded by 87139-YZZ82 per ToyotaPartsDeal and Olathe Toyota; list the current number instead.", sources=[f"{TD}/oem/toyota~cabin~air~filter~87139-yzz08.html"]),
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

# Restrictions and conflicts now live in scripts/toyota_fitment_evidence.py.

# Bundling recommendations for low-ticket parts (recommendations only; no
# catalog or shipping change). Kits use only records with verified fitment.
BUNDLES = [
    dict(name="RAV4 2019-2024 2.5L (gas) service kit", parts=[("04152-YZZA1", 1), ("17801-F0050", 1), ("90919-01289", 4)]),
    dict(name="Camry 2020-2024 2.5L (gas) service kit", parts=[("04152-YZZA1", 1), ("17801-F0050", 1), ("87139-0E040", 1), ("90919-01289", 4)]),
    dict(name="Tacoma 2016-2023 3.5L tune-up kit", parts=[("04152-YZZA1", 1), ("17801-0P100", 1), ("90919-01287", 6)]),
    dict(name="Tacoma 2016-2023 front brake kit", parts=[("04465-04090", 1), ("43512-04052", 2)]),
    dict(name="Tundra 2007-2017 / Sequoia 2008-2017 front pad set (stand-alone)", parts=[("04465-0C020", 1)]),
    dict(name="Oil filter 5-pack (any single verified oil filter)", parts=[("04152-YZZA1", 5)]),
]

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
    "water_inlet": ("cooling", "Cooling System"),
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
    if not apps:
        return "Toyota vehicles (fitment under review)"
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
        "water_inlet": f"Genuine Toyota water inlet housing sub-assembly {p['pn']} for the {m}. It is the coolant inlet housing on the engine; Toyota catalogs it separately from the water pump.",
        "alternator": f"Genuine Toyota alternator assembly with regulator {p['pn']} for the {m}. It charges the battery and powers the vehicle's electrical system while the engine runs.",
        "hub_bearing": f"Genuine Toyota front wheel bearing and hub assembly {p['pn']} for the {m}. The bearing comes pressed into the hub as one assembly. A worn bearing usually shows up as a growl that changes with speed or when turning.",
    }[k]
    notes = f" {p['notes']}" if p.get("notes") else ""
    return (
        f"{body}{sup}{notes}\n\n"
        f"Specifications\n\nPart number: {p['pn']}\nBrand: Toyota\nType: Genuine Toyota part\nCondition: New\n"
        + (f"Engines: {p['engines']}\n" if p.get("engines") else "")
        + f"Fitment: {fit or 'under review (no verified application)'}\n"
        + ("".join(f"Restriction: {x}\n" for x in p.get("restrictionsText", [])))
        + "\nConfirm fitment with your VIN before ordering."
    )


# ---------------------------------------------------------------------------
# Fitment evidence (scripts/toyota_fitment_evidence.py) is the only source of
# listed fitment: applications whose status is `verified` or `vin_dependent`.
# ---------------------------------------------------------------------------
CLAIMED = ("verified", "vin_dependent")


ENGINE_CODE = re.compile(r"\b[0-9A-Z]{2,5}-[A-Z]{2,4}\b")


def submodel_text(a):
    """Displacement(s) without engine codes, then the restriction, no repeats."""
    segs = [ENGINE_CODE.sub("", seg).strip() for seg in (a["engine"] or "").split(" / ")]
    disp = " / ".join(x for x in segs if x)
    restr = a.get("restriction") or ""
    if disp and restr.startswith(disp):
        restr = restr[len(disp):].lstrip(" ;,")
    bits = [b for b in (disp, restr) if b]
    return "; ".join(bits) or None


def apply_evidence(p, ev):
    claimed = [a for a in ev["apps"] if a["status"] in CLAIMED]
    p["apps"] = [app(a["yearFrom"], a["yearTo"], a["model"], submodel_text(a)) for a in claimed]
    codes = []
    for a in claimed:
        for c in (a["engine"] or "").replace(" / ", "/").split("/"):
            c = c.split(" ")[0]
            if c and c[0].isalnum() and "-" in c and c not in codes:
                codes.append(c)
    p["engines"] = "; ".join(codes)
    sup = ev.get("supersession", [])
    p["supersedes"] = "; ".join(x["partNumber"] for x in sup if x["relation"] == "supersedes" and x["status"] == "verified")
    p["supersededBy"] = next((x["partNumber"] for x in sup if x["relation"] == "superseded_by" and x["status"] == "verified"), None)
    blocking = list(ev.get("blocking", []))
    any_vin = any(a["status"] == "vin_dependent" for a in claimed)
    if not claimed:
        overall = "unresolved"
    elif blocking:
        overall = "unresolved"
    elif any_vin:
        overall = "vin_dependent"
    else:
        overall = "verified"
    p["verification"] = overall
    p["group"] = "commercial_pending" if overall in CLAIMED and not p["supersededBy"] else "research_pending"
    p["conf"] = {"verified": "high (dealer catalog)", "vin_dependent": "medium (VIN-dependent restrictions)", "unresolved": "low (unresolved)"}[overall]
    restr = [f"{a['yearFrom']}-{a['yearTo']} {a['model']}: " + "; ".join(x for x in (a.get("restriction"), a.get("assemblyOrigin"), a.get("productionDates")) if x)
             for a in claimed if a["status"] == "vin_dependent"]
    p["restrictionsText"] = restr
    p["evidenceBlock"] = {
        "auditedOn": AUDITED,
        "verificationStatus": overall,
        "vinLookupPerformed": False,
        "identity": ev.get("identity"),
        "applications": ev["apps"],
        "supersession": sup,
        "rejectedSupersessions": ev.get("rejectedSupersessions", []),
        "blocking": blocking,
        "unresolved": [f"{a['yearFrom']}-{a['yearTo']} {a['model']} {a['engine'] or ''}".strip() + f": {a['reason']}" for a in ev["apps"] if a["status"] in ("unresolved", "removed")],
    }


for p in PARTS:
    apply_evidence(p, EVIDENCE[p["pn"]])
for e in ENGINES:
    apply_evidence(e, ENGINE_EVIDENCE[e["code"]])

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
        "pricing": assess(p["pn"], True),
        "image": None,
        "imageStatus": "pending: no licensed image source; needs vendor photo or licensed distributor feed",
        "fitmentConfidence": p["conf"],
        "partKind": p["kind"],
        "supersededBy": p["supersededBy"],
        "vinDependent": p["verification"] == "vin_dependent" or any(a["status"] == "vin_dependent" for a in p["evidenceBlock"]["applications"] if a["status"] in CLAIMED),
        "vinLookupPerformed": False,
        "fitmentVerification": p["evidenceBlock"],
        "sources": sorted({x["url"] for a in p["evidenceBlock"]["applications"] if a["status"] in CLAIMED for x in a["evidence"]} | set(p["sources"])),
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
        "description": f"Toyota {e['code']} {e['desc']} engine assembly. US applications (VIN-dependent): {fit}. Condition, mileage, configuration (long block or complete engine) and included components are set from the vendor's actual unit before listing.",
        "price": None,
        "pricing": {"status": "no_evidence", "checkedOn": "2026-11-18", "recommendedPrice": None, "confidence": "none",
                    "flags": ["engine units are priced from the vendor's actual unit; no part number to benchmark"],
                    "profitabilityFlags": ["acquisition cost not provided -- margin not verified"], "approved": False},
        "image": None, "imageStatus": "pending: photos of the actual unit required",
        "fitmentConfidence": "medium (engine-family applications; unit-level interchange to confirm)",
        "partKind": "engine",
        "supersededBy": None,
        "vinDependent": True,
        "vinLookupPerformed": False,
        "fitmentVerification": e["evidenceBlock"],
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
                "fitment_confidence", "pricing_status", "msrp", "lowest_competitor", "lowest_price", "lowest_url",
                "competitive_target_price", "undercut", "profitability", "pricing_confidence", "competitors", "pricing_flags", "profitability_flags",
                "prices_checked", "image_status", "blocking", "sources"])
    for r in records:
        pr = r["pricing"]
        lo = pr.get("lowestCompetitor")
        w.writerow([r["status"], r["name"], "Toyota", r["partNumber"], r["supersedes"], r["partType"],
                    r["proposedCategoryName"], r["fitment"], r["engines"], r["fitmentConfidence"],
                    pr["status"], pr.get("msrp") or "", (lo or {}).get("seller", ""), (lo or {}).get("price", ""), (lo or {}).get("url", ""),
                    pr["recommendedPrice"] if pr["recommendedPrice"] is not None else "",
                    f"{pr['undercut']:.0%}" if pr.get("undercut") else "", pr.get("profitability", ""), pr["confidence"],
                    "; ".join(f"{x['seller']} ${x['price']:.2f}" for x in pr.get("competitors", [])),
                    "; ".join(pr.get("flags", [])), "; ".join(pr.get("profitabilityFlags", [])), pr["checkedOn"],
                    r["imageStatus"], "; ".join(r["blocking"]), " | ".join(r["sources"])])

print(len(records), "records:", {k: sum(r["status"] == k for r in records) for k in ("ready", "commercial_pending", "research_pending")})


# ---------------------------------------------------------------------------
# Final audit outputs: per-record classification, CSV and Markdown report.
# ---------------------------------------------------------------------------
BUCKETS = ["Ready for price approval", "Fitment verification required", "Pricing evidence insufficient",
           "Supplier cost required", "Product photography required"]


def classify(r):
    pn = r["partNumber"]
    pr = r["pricing"]
    fitment_ok = r["status"] != "research_pending" and r["fitmentVerification"]["verificationStatus"] in ("verified", "vin_dependent")
    pricing_ok = pr["status"] == "verified"
    cost_ok = pr.get("profitability") == "verified"  # needs supplier cost + minimum margin
    photo_ok = False  # no licensed, matching photograph for any record
    checks = {
        "Fitment verification required": not fitment_ok,
        "Pricing evidence insufficient": not pricing_ok,
        "Supplier cost required": not cost_ok,
        "Product photography required": not photo_ok,
    }
    blocking = [k for k, v in checks.items() if v]
    primary = blocking[0] if blocking else "Ready for price approval"
    issues = []
    if r["status"] == "research_pending":
        issues.append("research pending: " + (r["description"].split("\n")[0][:0] or "fitment/identity unresolved"))
    issues += r["fitmentVerification"]["blocking"]
    if r.get("supersededBy"):
        issues.append(f"superseded by {r['supersededBy']}")
    issues += pr.get("flags", [])
    issues += pr.get("profitabilityFlags", [])
    return primary, checks, issues


audit_rows = []
for r in records:
    primary, checks, issues = classify(r)
    r["audit"] = {"auditedOn": "2026-11-18", "primaryStatus": primary, "checks": checks, "issues": issues,
                  "approvalStatus": "not approved"}
    audit_rows.append(r)

# rewrite JSON with the audit block
with open(f"{OUT_DIR}/toyota-expansion-batch-1.json", "w", encoding="utf-8") as f:
    json.dump({
        "_comment": "Toyota catalog expansion batch 1 (2026-11-18), final audit. NOT loaded by the storefront. Nothing approved or published. Validate with: node scripts/check-toyota-expansion.mjs",
        "groups": {k: sum(r["status"] == k for r in records) for k in ("ready", "commercial_pending", "research_pending")},
        "auditSummary": {b: sum(r["audit"]["primaryStatus"] == b for r in records) for b in BUCKETS},
        "bundleRecommendations": BUNDLES,
        "records": records,
    }, f, ensure_ascii=False, indent=2)
    f.write("\n")

with open(f"{OUT_DIR}/toyota-expansion-batch-1-final-audit.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["primary_status", "approval_status", "part_number", "name", "verified_applications", "engines",
                "fitment_check", "pricing_check", "supplier_cost_check", "photo_check",
                "lowest_competitor", "lowest_price", "lowest_url", "competitive_target_price", "profitability", "pricing_confidence",
                "all_competitors", "prices_checked", "outstanding_issues", "fitment_sources"])
    for r in records:
        pr, a = r["pricing"], r["audit"]
        lo = pr.get("lowestCompetitor") or {}
        ok = lambda k: "BLOCKED" if a["checks"][k] else "ok"
        w.writerow([a["primaryStatus"], a["approvalStatus"], r["partNumber"] or "(engine family)", r["name"], r["fitment"], r["engines"],
                    ok("Fitment verification required"), ok("Pricing evidence insufficient"), ok("Supplier cost required"), ok("Product photography required"),
                    lo.get("seller", ""), lo.get("price", ""), lo.get("url", ""),
                    pr["recommendedPrice"] if pr["recommendedPrice"] is not None else "", pr.get("profitability", ""), pr["confidence"],
                    "; ".join(f"{x['seller']} ${x['price']:.2f} {x['url']}" for x in pr.get("competitors", [])),
                    pr["checkedOn"], " | ".join(a["issues"]), " | ".join(r["sources"])])

by_pn = {r["partNumber"]: r for r in records if r["partNumber"]}


def bundle_line(b):
    total, missing = 0.0, []
    for pn, qty in b["parts"]:
        rp = by_pn.get(pn, {}).get("pricing", {}).get("recommendedPrice")
        if rp is None:
            missing.append(pn)
        else:
            total += rp * qty
    parts = ", ".join(f"{pn} x{q}" for pn, q in b["parts"])
    price = f"${total:,.2f}" if not missing else f"incomplete ({', '.join(missing)} unpriced)"
    return f"| {b['name']} | {parts} | {price} |"


ready_once_cost = [r for r in records if not r["audit"]["checks"]["Fitment verification required"] and not r["audit"]["checks"]["Pricing evidence insufficient"]]
low_ticket = [r for r in ready_once_cost if (r["pricing"]["recommendedPrice"] or 0) < 25]

md = []
md.append("# Toyota Expansion Batch 1 — Final Commercial Audit\n")
md.append("Audited 2026-11-18. **Nothing has been approved, priced live, published or deployed.**\n")
md.append("## Summary\n")
md.append("| Primary status | Records |\n|---|---|")
for b in BUCKETS:
    md.append(f"| {b} | {sum(r['audit']['primaryStatus'] == b for r in records)} |")
md.append("")
md.append(f"- {len(ready_once_cost)} records pass fitment and pricing; every one still needs a supplier acquisition cost and a licensed product photo before its price can be approved.")
md.append("- No record is *Ready for price approval*: no supplier cost is on file for any part, so profitability cannot be established, and no licensed, matching photograph exists for any part.")
md.append("- **Pricing rule:** about 5% below the lowest verified US retailer selling the exact same genuine Toyota part number, moving toward 3% only when needed for margin, never less than 3% below. Every price shown is a *competitive target flagged for profitability review*, not a selling price. No automatic discount, sale price or inflated reference price is used.")
md.append("- Each record's status is the first blocking item in this order: fitment, pricing evidence, supplier cost, photography. The CSV shows every check.\n")
md.append("## Pass fitment and pricing — waiting on supplier cost and photos\n")
md.append("| Part number | Product | Verified applications | Lowest competitor | Target (5% under) | Confidence |\n|---|---|---|---|---|---|")
for r in ready_once_cost:
    pr = r["pricing"]; lo = pr["lowestCompetitor"]
    md.append(f"| {r['partNumber']} | {r['name'].split(' — ')[0].replace('Genuine Toyota ', '')} | {r['fitment']} | [{lo['seller']} ${lo['price']:.2f}]({lo['url']}) | **${pr['recommendedPrice']:.2f}** | {pr['confidence']} |")
md.append("")
md.append("## Fitment verification required\n")
md.append("| Part number | Product | Outstanding issue |\n|---|---|---|")
for r in records:
    if r["audit"]["checks"]["Fitment verification required"]:
        fv = r["fitmentVerification"]
        issue = "; ".join(fv["blocking"] + ([f"superseded by {r['supersededBy']}"] if r.get("supersededBy") else []) + fv["unresolved"][:2]) or "engine unit details (condition, mileage, inclusions)"
        md.append(f"| {r['partNumber'] or '(engine)'} | {r['name']} | {issue[:220]} |")
md.append("")
md.append("## Pricing evidence insufficient\n")
md.append("| Record | Reason |\n|---|---|")
for r in records:
    if r["pricing"]["status"] != "verified":
        why = "; ".join(r["pricing"].get("flags", [])) or r["pricing"].get("excluded", "") or "no attributed competitors"
        md.append(f"| {r['partNumber'] or r['name']} | {why} |")
md.append("")
md.append("## Profitability\n")
md.append("No supplier cost is on file for any of the 50 records, so profitability cannot be established for any of them and **every** target price is flagged for review rather than presented as a selling price. Once the owner supplies a supplier cost and a minimum margin (`SUPPLIER_COST` and `MIN_MARGIN` in `scripts/toyota_expansion_pricing.py`), each price is checked at 5% under; if that misses the margin it moves to 3% under; if 3% under still misses, the part is flagged *not profitable at a competitive price* and is not listed by undercutting. Margin per unit = selling price - supplier cost - payment processing fee - packaging - outbound shipping (free on US parcel orders under $1,000).\n")
md.append("## Shipping suitability\n")
md.append(f"{len(low_ticket)} parts have a target under $25 and ship free as parcels under the published US rate table. On their own they are commercially unsuitable: the carrier cost of a single parcel will usually exceed the margin.\n")
md.append("| Part number | Product | Target price |\n|---|---|---|")
for r in low_ticket:
    md.append(f"| {r['partNumber']} | {r['name'].split(' — ')[0].replace('Genuine Toyota ', '')} | ${r['pricing']['recommendedPrice']:.2f} |")
md.append("\nRecommendations (none changes the published shipping policy):\n")
md.append("1. **Sell low-ticket parts as engine-correct sets and service kits** instead of single units (below). Spark plugs are needed in sets of 4 or 6 anyway.")
md.append("2. **Multi-packs** for oil filters (5 or 10), priced per pack.")
md.append("3. **Do not undercut on low-ticket items whose margin cannot fund shipping**; at 3-5% under, a $13 part leaves well under $1 of price difference, and the free US parcel shipping will usually cost more than the margin. These stay flagged until supplier and parcel costs are known.")
md.append("4. **Show them as add-ons** on the product pages of related brake and service parts, so they ride in larger orders.\n")
md.append("| Suggested kit | Contents | Sum of target prices |\n|---|---|---|")
for b in BUNDLES:
    md.append(bundle_line(b))
md.append("")
md.append("## Product photography\n")
md.append("All 50 records lack a legitimate, licensed, matching photograph. No Toyota or dealer reuse permission was found, Toyota's own catalog uses placeholders for many parts, and no unrelated or AI-generated image has been used. Needed: supplier photos of the exact part numbers, or a licensed distributor image feed; engine families need photos of the actual units.\n")
md.append("## Corrections made during the audit\n")
md.append("- 90919-02258 is not the Tacoma 3.5L coil (dealers list 1.8L Corolla/Prius/C-HR/Matrix); the correct 2016-2023 Tacoma 2GR-FKS coil is **90919-A2008** — candidate for batch 2.")
md.append("- 90915-YZZN3 fits the 2022+ Tundra and 2023+ Sequoia 3.4L, not the Tacoma.")
md.append("- 87139-0R030 narrowed to the 2019-2024 Corolla; 87139-0E040 narrowed to the 2020-2024 Camry (RAV4 and 2018-2019 Camry are split with 87139-58010).")
md.append("- 04465-0C020 narrowed to 2007-2017 Tundra and 2008-2017 Sequoia (2018 listed by some dealers only).")
md.append("- Alternator 27060-F0010: the lowest listing ($239.74) was stale and is excluded; benchmark is now $262.44.")
md.append("- 43512-06200 confirmed sold individually (two per axle).")
md.append("- 04152-YZZA1 (cartridge) narrowed to the 3.5L V6 (2GR-FKS). The 2.5L A25A-FKS takes spin-on **90915-YZZN1** (formerly 90915-10009 / 90915-YZZF2): confirmed for the 2019-2024 RAV4 2.5L gas and the US-built 2020 Camry 2.5L. The RAV4 and Camry 2.5L kits now use 90915-YZZN1 and stay in research.\n")
md.append("- **Fitment verification audit (all 50 records):** see `toyota-expansion-batch-1-fitment-audit.md` and `-fitment-audit.csv` for every application, its evidence, restrictions and status.\n")
md.append("## Limits of this audit\n")
md.append("- Prices are from dealer and retailer pages as indexed by search on 2026-11-18; live pages could not be opened from this environment, so each price must be re-confirmed at approval time.")
md.append("- Fitment comes from Toyota-dealer catalogs, not a VIN-level Toyota EPC lookup; restrictions shown above should be checked by VIN on first orders.")
md.append("- Shipping was not shown in any competitor listing; all competitor prices are item-only.\n")
md.append("Files: `docs/catalog-expansion/toyota-expansion-batch-1.json`, `toyota-expansion-batch-1.csv`, `toyota-expansion-batch-1-final-audit.csv`, this report.")
with open(f"{OUT_DIR}/toyota-expansion-batch-1-final-audit.md", "w", encoding="utf-8") as f:
    f.write("\n".join(md) + "\n")

print("audit:", {b: sum(r["audit"]["primaryStatus"] == b for r in records) for b in BUCKETS},
      "| pass fitment+pricing:", len(ready_once_cost), "| low-ticket:", len(low_ticket))


# ---------------------------------------------------------------------------
# Fitment verification audit: one row per vehicle application, every record.
# ---------------------------------------------------------------------------
def rec_label(r):
    return r["partNumber"] or f"{r['engines']} engine"


fit_rows = []
for r in records:
    fv = r["fitmentVerification"]
    sup = "; ".join(f"{x['relation'].replace('_', ' ')} {x['partNumber']} ({x['status']})" for x in fv["supersession"])
    rej = "; ".join(f"rejected: {x['from']} -> {x['to']} ({x['reason']})" for x in fv["rejectedSupersessions"])
    for a in fv["applications"]:
        fit_rows.append({
            "record": rec_label(r),
            "recordStatus": r["status"],
            "application": f"{a['yearFrom']}-{a['yearTo']} Toyota {a['model']}",
            "engine": a["engine"] or "",
            "status": a["status"],
            "listed": a["status"] in ("verified", "vin_dependent"),
            "restriction": a.get("restriction") or "",
            "assemblyOrigin": a.get("assemblyOrigin") or "",
            "productionDates": a.get("productionDates") or "",
            "supersession": "; ".join(x for x in (sup, rej) if x),
            "evidence": " | ".join(f"[{e['kind']}] {e['source']} {e['url']}" for e in a["evidence"]),
            "reason": a.get("reason") or "",
            "recordBlocking": " | ".join(fv["blocking"]),
        })

with open(f"{OUT_DIR}/toyota-expansion-batch-1-fitment-audit.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(fit_rows[0].keys()))
    w.writeheader()
    w.writerows(fit_rows)

from collections import Counter  # noqa: E402

st = Counter(x["status"] for x in fit_rows)
rv = Counter(r["fitmentVerification"]["verificationStatus"] for r in records)
fm = ["# Toyota Expansion Batch 1 — Fitment Verification Audit\n",
      f"Audited {AUDITED}. Staged data only: nothing is published, and no live inventory was changed.\n",
      "## Standard\n",
      "- An application is **listed** only when a Toyota (autoparts.toyota.com) or US Toyota-dealer parts catalog names this exact part number for that model, year range and engine.",
      "- **VIN-dependent**: the catalog lists it with a restriction (production date, assembly origin, trim, drivetrain, hybrid, option) that only the VIN resolves. Listed with the restriction stated; the listing tells the buyer to confirm by VIN.",
      "- **Unresolved**: evidence missing, retailer-only or conflicting. Not listed.",
      "- **Removed**: was staged and is contradicted by evidence. Not listed.",
      "- Retailer, marketplace, overseas and guide sources never establish fitment on their own. Canadian dealer catalogs corroborate only.",
      "- **No VIN-level catalog lookup was performed** for any application. Evidence is dealer catalog pages as indexed by search on the audit date. No record claims VIN-level confirmation.",
      "- Engines are matched by engine code; a used engine's interchange depends on generation, accessories, harness and ECU, so every engine application is VIN-dependent and every engine stays in research.\n",
      "## Results\n",
      f"- Applications reviewed: {len(fit_rows)} — verified {st['verified']}, VIN-dependent {st['vin_dependent']}, unresolved {st['unresolved']}, removed {st['removed']}.",
      f"- Records: verified {rv['verified']}, VIN-dependent {rv['vin_dependent']}, unresolved {rv['unresolved']}.",
      f"- Groups after the audit: {sum(r['status'] == 'commercial_pending' for r in records)} commercial_pending, {sum(r['status'] == 'research_pending' for r in records)} research_pending, 0 ready.",
      "- Live storefront check: none of the 50 part numbers, their superseded numbers or their replacements appears in the deployed catalog (347 listings), so there is no duplicate or conflicting live listing.\n",
      "## Oil filter findings (priority review)\n",
      "- **90915-YZZN1** (spin-on; previous versions 90915-YZZF2 per Toyota, 90915-10009 per dealer catalogs): listed for the 2023-2024 RAV4 2.5L gas (Lakeland Toyota year pages, Toyota of Glendale) and, VIN-dependent, for the 2019-2022 RAV4 2.5L gas, where ToyotaPartsDeal shows 90915-10009 for AXAL54L gas submodels and Sparks Toyota limits 2019-2022 to hybrids. 2020-2024 Corolla 2.0L is VIN-dependent.",
      "- **Camry 2.5L (A25A-FKS)**: unresolved. ToyotaPartsDeal lists 90915-YZZN1 for the US-built 2020 Camry 2.5L; ToyotaPartsNow's 2018 Camry page lists 04152-YZZA1 for the 2.5L. Neither number is listed for the Camry 2.5L until a VIN-level lookup settles it by build plant and year.",
      "- **04152-YZZA1** (cartridge; supersedes 04152-31090, 04152-31110, 04152-0V010): 2016-2023 Tacoma 3.5L verified; 2018-2024 Camry 3.5L and 2017-2022 Highlander 3.5L VIN-dependent (dealer note: from 11/2017, excluding Japan-built). Removed: 2023 Highlander (no V6 that year), Camry 2.5L, 2019+ RAV4.",
      "- **90915-10009 -> 04152-YZZA1** supersession shown on one ToyotaPartsDeal page is rejected: a spin-on canister cannot be superseded by a cartridge element.",
      "- **US- vs Japan-built**: Japan-built origin is a stated restriction on 04152-YZZA1 (excluded) and 43550-0R060 (both origins listed, without hybrid); US-built is a stated restriction on 04465-0E060, 04465-06170 and 27060-F0010. Each is listed as VIN-dependent.\n",
      "## Every corrected or unresolved application\n",
      "| Part | Application | Engine | Status | Restriction / origin / production | Supersession | Evidence | Reason |",
      "|---|---|---|---|---|---|---|---|"]
for x in fit_rows:
    if x["status"] == "verified":
        continue
    ev = "<br>".join(e for e in x["evidence"].split(" | ") if e) or "—"
    ro = "; ".join(v for v in (x["restriction"], x["assemblyOrigin"], x["productionDates"]) if v) or "—"
    fm.append(f"| {x['record']} | {x['application']} | {x['engine'] or '—'} | {x['status']} | {ro} | {x['supersession'] or '—'} | {ev} | {x['reason'] or (x['recordBlocking'] or '—')} |")
fm += ["", "## Verified applications\n", "| Part | Application | Engine | Evidence |", "|---|---|---|---|"]
for x in fit_rows:
    if x["status"] == "verified":
        fm.append(f"| {x['record']} | {x['application']} | {x['engine'] or '—'} | " + "<br>".join(x["evidence"].split(" | ")) + " |")
fm += ["", "## Record-level blockers\n"]
for r in records:
    b = r["fitmentVerification"]["blocking"]
    if b or r.get("supersededBy"):
        fm.append(f"- **{rec_label(r)}**: " + "; ".join(b + ([f"superseded by {r['supersededBy']}"] if r.get("supersededBy") and not any("uperseded" in y for y in b) else [])))
fm += ["", "## What a VIN-level check is still needed for\n",
       "Before first sale of any VIN-dependent application, a Toyota EPC or dealer parts-counter lookup by VIN for: Camry 2.5L oil filter; 2019-2022 RAV4 oil filter; Camry 04465-0E060 vs 04465-33480 production window; Tacoma 90919-01287 vs 90919-01263; RAV4 90919-A2009 vs 90919-A2010; snorkel-equipped Tacoma air filter; 2WD Tacoma front pads; Camry/RAV4 hybrid rotor and wheel-end splits.\n"]
with open(f"{OUT_DIR}/toyota-expansion-batch-1-fitment-audit.md", "w", encoding="utf-8") as f:
    f.write("\n".join(fm) + "\n")
print("fitment audit:", dict(st), "| records:", dict(rv))
