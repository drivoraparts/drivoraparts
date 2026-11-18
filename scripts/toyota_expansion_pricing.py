"""Competitor price research for Toyota expansion batch 1 (checked 2026-11-18).

Prices are the sale prices shown on US Toyota-dealer parts storefronts and
established parts retailers in search results for the exact part number,
new genuine Toyota parts only. Excluded: eBay, Walmart, marketplace outliers,
used units, aftermarket substitutes, promotions limited to one product type,
out-of-stock listings. Shipping was not shown in any snippet, so every price
is item-only ("shipping not verified").

A listing whose price could not be attributed to a named seller is kept in
`unattributed` and never used as the benchmark.
"""
import math

CHECKED = "2026-11-18"

OGP = "https://www.oemgenuineparts.com/oem-parts"
TPD = "https://www.toyotapartsdeal.com/oem"


def c(seller, price, url):
    return {"seller": seller, "price": price, "url": url}


PRICING = {
    "17801-F0050": dict(msrp=30.99, comps=[
        c("OEMGenuineParts.com", 19.01, f"{OGP}/toyota-air-filter-17801f0050"),
        c("AutoPartsPrime", 19.63, "https://www.autopartsprime.com/toyota/air-filter-element-sub-assembly/oe-17801f0050"),
        c("Ourisman Toyota of Richmond", 19.71, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-air-filter-17801f0050"),
        c("ToyotaPartsDeal", 20.22, f"{TPD}/toyota~element~sub~assy~ai~17801-f0050.html"),
        c("Toyota of Greensburg", 21.24, "https://parts.toyotaofgreensburg.com/oem-parts/toyota-air-filter-17801f0050"),
        c("Longo Toyota", 22.43, "https://parts.longotoyota.com/oem-parts/toyota-air-filter-17801f0050"),
        c("Olathe Toyota", 26.96, "https://parts.olathetoyota.com/oem-parts/toyota-air-filter-17801f0050"),
    ]),
    "17801-0P100": dict(msrp=30.99, comps=[
        c("Grieco Toyota", 18.90, "https://parts.griecotoyota.com/oem-parts/toyota-air-filter-178010p100"),
        c("ToyotaPartsDeal", 20.22, f"{TPD}/toyota~element~sub~assy~ai~17801-0p100.html"),
        c("Lakeland Toyota", 20.22, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-air-filter-178010p100"),
        c("American Toyota", 21.92, "https://parts.americantoyota.com/oem-parts/toyota-air-filter-178010p100"),
        c("Modern Toyota Wholesale Direct", 23.79, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-air-filter-178010p100"),
    ], excluded="PartsGeek $30.97 (title references a different part number)"),
    "17801-0C040": dict(msrp=30.99, comps=[
        c("OEMGenuineParts.com", 19.01, f"{OGP}/toyota-air-filter-178010c040"),
        c("ToyotaPartsDeal", 20.22, f"{TPD}/toyota~element~sub~assy~air~cleaner~filter~17801-0c040.html"),
        c("American Toyota", 21.92, "https://parts.americantoyota.com/oem-parts/toyota-air-filter-178010c040"),
        c("Modern Toyota Wholesale Direct", 23.79, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-air-filter-178010c040"),
    ], excluded="Amazon third-party $116.20 (outlier); Amayama $33.75 (out of stock)"),
    "17801-0P051": dict(msrp=30.99, comps=[
        c("OEMGenuineParts.com", 19.01, f"{OGP}/toyota-air-filter-178010p051"),
        c("ToyotaPartsDeal", 20.22, f"{TPD}/toyota~element~sub~assy~ai~17801-0p051.html"),
        c("ToyotaPartsNow", 20.30, "https://www.toyotapartsnow.com/oem/toyota~air-filter-element-sub-assembly~17801-0p051"),
        c("Group 1 Auto Parts", 20.90, "https://www.group1autoparts.com/oem-parts/toyota-air-filter-178010p051"),
        c("Desert Toyota", 21.24, "https://shopparts.deserttoyota.com/parts/toyota-air-filter-178010p051"),
        c("Longo Toyota", 22.43, "https://parts.longotoyota.com/oem-parts/toyota-air-filter-178010p051"),
    ]),
    "17801-38051": dict(msrp=30.99, comps=[
        c("AutoPartsPrime", 19.63, "https://www.autopartsprime.com/p/2022-toyota-4runner-air-filter"),
        c("Lakeland Toyota", 20.22, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-air-filter-1780138051"),
        c("ToyotaPartsDeal", 20.22, f"{TPD}/toyota~element~sub~assy~ai~17801-38051.html"),
        c("Beach Cities Toyota", 20.39, "https://trdtoyotaparts.beachcitiestoyota.com/oem-parts/toyota-4runner-fj-cruiser-engine-air-filter-1780138051"),
        c("Toyota South", 20.90, "https://parts.toyotasouth.com/oem-parts/toyota-air-filter-1780138051"),
        c("American Toyota", 21.92, "https://parts.americantoyota.com/oem-parts/toyota-air-filter-1780138051"),
    ]),
    "17801-F0020": dict(msrp=30.99, comps=[
        c("Grieco Toyota", 18.90, "https://parts.griecotoyota.com/oem-parts/toyota-air-filter-17801f0020"),
        c("AutoPartsPrime", 19.63, "https://www.autopartsprime.com/toyota/air-filter-element-sub-assembly/oe-17801f0020"),
        c("ToyotaPartsDeal", 20.22, f"{TPD}/toyota~element~sub~assy~ai~17801-f0020.html"),
        c("Longo Toyota", 22.43, "https://parts.longotoyota.com/oem-parts/toyota-air-filter-17801f0020"),
        c("Modern Toyota Wholesale Direct", 23.79, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-air-filter-17801f0020"),
    ]),
    "04152-YZZA1": dict(msrp=6.57, comps=[
        c("ToyotaPartsDeal", 4.68, f"{TPD}/toyota~replaceable~element~04152-yzza1.html"),
        c("Fred Haas Toyota", 4.91, "https://discountparts.fredhaastoyota.com/oem-parts/toyota-engine-oil-filter-element-4152yzza1"),
        c("American Toyota", 5.07, "https://parts.americantoyota.com/oem-parts/toyota-engine-oil-filter-element-4152yzza1"),
        c("Modern Toyota Wholesale Direct", 5.99, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-engine-oil-filter-element-4152yzza1"),
        c("AutoZone", 11.49, "https://www.autozone.com/p/toyota-engine-oil-filter-04152-yzza1/129467"),
    ], excluded="Molle Toyota $3.99 (store-wide oil-filter promotion); AFA Motors $20.00 (outlier)"),
    "04152-YZZA6": dict(msrp=6.57, comps=[
        c("Toyota of San Diego", 4.52, "https://parts.toyotasandiego.com/parts/toyota-oil-filter-4152yzza6"),
        c("ToyotaPartsDeal", 4.68, f"{TPD}/toyota~replaceable~element~04152-yzza6.html"),
        c("Group 1 Auto Parts", 5.03, "https://www.group1autoparts.com/oem-parts/toyota-oil-filter-4152yzza6"),
        c("Frontier Toyota", 5.50, "https://parts.frontiertoyota.com/oem-parts/toyota-genuine-toyota-oil-filter-element-4152yzza6"),
        c("Longo Toyota", 6.18, "https://parts.longotoyota.com/oem-parts/toyota-oil-filter-4152yzza6"),
    ], excluded="AutoZone (Premium Guard aftermarket)"),
    "90915-YZZD3": dict(msrp=6.57, comps=[
        c("AutoPartsPrime", 4.55, "https://www.autopartsprime.com/toyota/filter-oil/oe-90915yzzd3"),
        c("Group 1 Auto Parts", 5.03, "https://www.group1autoparts.com/oem-parts/toyota-oil-filter-90915yzzd3"),
        c("ToyotaPartsDeal", 5.57, f"{TPD}/toyota~filter~oil~90915-yzzd3.html"),
    ]),
    "90915-YZZN3": dict(msrp=6.57, comps=[
        c("Lakeland Toyota", 4.68, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-oil-filter-90915yzzn3"),
        c("Olathe Toyota", 7.56, "https://parts.olathetoyota.com/oem-parts/toyota-filter-oil-90915yzzn3"),
        c("Amazon (Toyota Genuine listing)", 9.40, "https://www.amazon.com/Toyota-Genuine-Filter-90915-YZZN3-Compatible/dp/B0DYFXC4QK"),
    ], unattributed=[5.11, 5.31, 5.57, 5.99, 6.18, 6.55]),
    "87139-0R030": dict(msrp=29.99, comps=[
        c("OEMGenuineParts.com", 19.01, f"{OGP}/toyota-filter-871390r030"),
        c("Ourisman Toyota of Richmond", 19.88, "https://parts.ourismantoyotaofrichmond.com/oem-parts/toyota-air-filter-871390r030"),
        c("Lakeland Toyota", 20.22, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-cabin-air-filter-871390r030"),
        c("Elmhurst Toyota", 21.24, "https://parts.elmhursttoyota.com/oem-parts/toyota-cabin-air-filter-871390r030"),
        c("American Toyota", 21.92, "https://parts.americantoyota.com/oem-parts/toyota-cabin-air-filter-871390r030"),
        c("Capitol Toyota", 22.09, "https://parts.capitoltoyota.com/oem-parts/toyota-cabin-air-filter-871390r030"),
        c("Capo Valley Toyota", 22.49, "https://parts.capovalleytoyota.com/oem-parts/toyota-cabin-air-filter-871390r030"),
    ]),
    "87139-0E040": dict(msrp=52.99, comps=[
        c("Grieco Toyota", 35.51, "https://parts.griecotoyota.com/oem-parts/toyota-cabin-air-filter-871390e040"),
        c("OEMGenuineParts.com (All Star Automotive)", 35.79, "https://www.oemgenuineparts.com/toyota-avalon-cabin-air-filters"),
        c("Lakeland Toyota", 38.07, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-cabin-air-filter-871390e040"),
        c("Toyota of Nashua", 39.35, "https://parts.toyotaofnashua.com/oem-parts/toyota-genuine-toyota-cabin-air-filter-87139-0e040-871390e040"),
        c("American Toyota", 39.67, "https://parts.americantoyota.com/oem-parts/toyota-cabin-air-filter-871390e040"),
        c("Capo Valley Toyota", 39.74, "https://parts.capovalleytoyota.com/oem-parts/toyota-cabin-air-filter-871390e040"),
        c("Modern Toyota Wholesale Direct", 43.19, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-cabin-air-filter-871390e040"),
    ]),
    "87139-58010": dict(msrp=52.99, comps=[
        c("OEMGenuineParts.com", 35.79, f"{OGP}/toyota-cabin-air-filter-8713958010?c=az0x"),
        c("Toyota OEM Parts Online", 38.39, "https://toyota.oempartsonline.com/oem-parts/toyota-cabin-air-filter-8713958010"),
        c("Olathe Toyota", 40.00, "https://parts.olathetoyota.com/oem-parts/toyota-cabin-air-filter-8713958010?c=az0x"),
    ]),
    "90919-01289": dict(msrp=21.61, comps=[
        c("OEMGenuineParts.com", 13.08, f"{OGP}/toyota-spark-plug-9091901289"),
        c("Lakeland Toyota", 15.46, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-spark-plug-9091901289"),
        c("ToyotaPartsDeal", 15.46, f"{TPD}/toyota~plug~spark~90919-01289.html"),
        c("Longo Toyota", 17.15, "https://parts.longotoyota.com/oem-parts/toyota-spark-plug-9091901289"),
    ]),
    "90919-01287": dict(msrp=24.43, comps=[
        c("OEMGenuineParts.com", 16.44, f"{OGP}/toyota-spark-plug-9091901287"),
        c("ToyotaPartsDeal", 17.48, f"{TPD}/toyota~plug~spark~90919-01287.html"),
        c("Lakeland Toyota", 17.48, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-spark-plug-9091901287"),
        c("Camelback Toyota", 18.67, "https://parts.camelbacktoyota.com/oem-parts/toyota-spark-plug-9091901287"),
        c("Toyota DM", 20.15, "https://parts.toyotadm.com/oem-parts/toyota-spark-plug-9091901287"),
    ]),
    "90919-02258": dict(msrp=144.03, comps=[
        c("OEMGenuineParts.com", 96.88, f"{OGP}/toyota-direct-ignition-coil-9091902258"),
        c("ToyotaPartsDeal", 102.18, f"{TPD}/toyota~coil~ignition~90919-02258.html"),
        c("American Toyota", 102.61, "https://parts.americantoyota.com/oem-parts/toyota-direct-ignition-coil-9091902258"),
        c("Longo Toyota", 124.07, "https://parts.longotoyota.com/oem-parts/toyota-direct-ignition-coil-9091902258"),
    ]),
    "04465-04090": dict(msrp=104.50, comps=[
        c("Grieco Toyota", 70.17, "https://parts.griecotoyota.com/oem-parts/toyota-brake-pads-front-446504090"),
        c("Fred Haas Toyota", 73.66, "https://discountparts.fredhaastoyota.com/oem-parts/toyota-brake-pads-front-446504090"),
        c("ToyotaPartsDeal", 74.93, f"{TPD}/toyota~pad~kit~disc~brake~04465-04090.html"),
    ], excluded="Frontier Toyota $88.90 (listing about 4 years old)"),
    "43512-04052": dict(msrp=129.73, comps=[
        c("Sparks Toyota", 81.29, "https://www.sparksparts.com/oem-parts/toyota-disc-brake-rotor-front-4351204052"),
        c("Ourisman Toyota of Richmond", 86.56, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-disc-brake-rotor-front-4351204052"),
        c("Capo Valley Toyota", 88.19, "https://parts.capovalleytoyota.com/oem-parts/toyota-disc-brake-rotor-front-4351204052"),
        c("Lakeland Toyota", 90.47, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-disc-brake-rotor-front-4351204052"),
        c("ToyotaPartsDeal", 92.03, f"{TPD}/toyota~disc~front~43512-04052.html"),
    ]),
    "04465-0C020": dict(msrp=104.50, comps=[
        c("OEMGenuineParts.com", 71.04, f"{OGP}/toyota-brake-pads-front-44650c020"),
        c("Toyota OEM Parts Online", 72.07, "https://toyota.oempartsonline.com/oem-parts/toyota-brake-pads-front-44650c020"),
        c("AutoPartsPrime", 72.70, "https://www.autopartsprime.com/toyota/front-disc-brake-pad-set/oe-044650c020"),
        c("ToyotaPartsDeal", 74.93, f"{TPD}/toyota~pad~kit~disc~brake~front~pad~only~04465-0c020.html"),
        c("Longo Toyota", 80.65, "https://parts.longotoyota.com/oem-parts/toyota-brake-pads-front-44650c020?c=az0x"),
    ]),
    "43512-06200": dict(msrp=103.61, comps=[
        c("Grieco Toyota", 66.73, "https://parts.griecotoyota.com/oem-parts/toyota-disc-brake-rotor-front-4351206200"),
        c("OEMGenuineParts.com", 67.56, f"{OGP}/toyota-disc-brake-rotor-front-4351206200"),
        c("Capo Valley Toyota", 72.53, "https://parts.capovalleytoyota.com/oem-parts/toyota-disc-brake-rotor-front-4351206200"),
        c("ToyotaPartsDeal", 73.50, f"{TPD}/toyota~disc~fr~43512-06200.html"),
        c("Lakeland Toyota", 74.13, "https://parts.lakelandtoyota.com/p/toyota__/Disc-Brake-Rotor-Front/14763752/4351206200.html"),
        c("Ourisman Toyota of Richmond", 75.46, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-disc-brake-rotor-front-4351206200"),
    ], info="Sold individually (confirmed by dealer listing); two per axle."),
    "04465-0E060": dict(msrp=104.50, comps=[
        c("Toyota OEM Parts Online", 72.07, "https://toyota.oempartsonline.com/oem-parts/toyota-disc-brake-pad-set-front-44650e060"),
        c("Modern Toyota Wholesale Direct", 72.71, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-disc-brake-pad-set-front-44650e060"),
        c("Sparks Toyota", 73.03, "https://www.sparksparts.com/oem-parts/toyota-disc-brake-pad-set-front-44650e060"),
        c("ToyotaPartsDeal", 74.93, f"{TPD}/toyota~pad~kit~disc~brake~04465-0e060.html"),
        c("American Toyota", 75.25, "https://parts.americantoyota.com/oem-parts/toyota-disc-brake-pad-set-front-44650e060"),
        c("Olathe Toyota", 79.99, "https://parts.olathetoyota.com/oem-parts/toyota-disc-brake-pad-set-front-44650e060?c=az0x"),
    ]),
    "04465-06170": dict(msrp=122.92, comps=[
        c("Ourisman Toyota of Richmond", 81.29, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-brake-pads-446506170"),
        c("Toyota OEM Parts Online", 83.88, "https://toyota.oempartsonline.com/oem-parts/toyota-disc-brake-pad-set-446506170"),
        c("Conicelli Toyota", 84.99, "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-disc-brake-pad-set-446506170"),
        c("ToyotaPartsDeal", 87.20, f"{TPD}/toyota~pad~kit~disc~brake~04465-06170.html"),
        c("Longo Toyota", 96.81, "https://parts.longotoyota.com/oem-parts/toyota-brake-pads-446506170"),
    ]),
    "04465-35330": dict(msrp=111.37, comps=[
        c("OEMGenuineParts.com", 74.90, f"{OGP}/toyota-brake-pads-front-446535330"),
        c("Modern Toyota Wholesale Direct", 76.66, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-brake-pads-front-446535330"),
        c("Conicelli Toyota", 76.99, "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-brake-pads-front-446535330"),
        c("ToyotaPartsDeal", 79.00, f"{TPD}/toyota~pad~kit~disc~brake~04465-35330.html"),
        c("Frontier Toyota", 93.73, "https://parts.frontiertoyota.com/oem-parts/toyota-front-brake-pad-set-2020-2024-4runner-446535330"),
    ]),
    "04465-02530": dict(msrp=127.34, comps=[
        c("Conicelli Toyota", 84.98, "https://parts.conicellitoyotaofconshohocken.com/oem-parts/toyota-disc-brake-pad-set-446502530"),
        c("Toyota OEM Parts Online", 86.90, "https://toyota.oempartsonline.com/oem-parts/toyota-disc-brake-pad-set-446502530"),
        c("Modern Toyota Wholesale Direct", 87.66, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-disc-brake-pad-set-446502530"),
        c("Toyota Direct", 91.87, "https://autoparts.toyotadirect.com/products/product/pad-kit-disc-brake-l-fitting-parts-fr-0446578010"),
        c("Frontier Toyota", 107.18, "https://parts.frontiertoyota.com/oem-parts/toyota-disc-brake-pad-set-446502530"),
    ], info="Seller-to-price mapping re-checked in a second search."),
    "16032-F0011": dict(msrp=362.46, comps=[
        c("OEMGenuineParts.com", 244.15, f"{OGP}/toyota-water-pump-16032f0011"),
        c("Kendall Toyota", 272.49, "https://parts.kendalltoyota.com/oem-parts/toyota-engine-water-pump-16032f0011"),
        c("Longo Toyota", 287.75, "https://parts.longotoyota.com/oem-parts/toyota-engine-water-pump-16032f0011"),
    ], unattributed=[209.96], note="Inclusions differ: some listings include gasket and thermostat housing, Longo excludes the gasket."),
    "27060-F0010": dict(msrp=400.85, comps=[
        c("Ourisman Toyota of Richmond", 262.44, "https://toyotaparts.ourismantoyotaofrichmond.com/oem-parts/toyota-alternator-27060f0010"),
        c("OEMGenuineParts.com", 269.91, f"{OGP}/toyota-alternator-27060f0010"),
        c("ToyotaPartsDeal", 271.31, f"{TPD}/toyota~alternator~assy~w~r~27060-f0010.html"),
        c("Toyota OEM Parts Online", 272.32, "https://toyota.oempartsonline.com/oem-parts/toyota-alternator-27060f0010"),
    ], excluded="AH Parts $85 (used); Larry H. Miller Toyota $239.74 (stale: old MSRP $349.81 and 2018-2023 fitment)"),
    "43550-0R060": dict(msrp=397.36, comps=[
        c("Modern Toyota Wholesale Direct", 256.61, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-hub-assembly-435500r060"),
        c("Toyota OEM Parts Online", 262.04, "https://toyota.oempartsonline.com/oem-parts/toyota-hub-assembly-435500r060"),
        c("Toyota of Nashua", 272.33, "https://parts.toyotaofnashua.com/oem-parts/toyota-2019-2024-toyota-hub-assembly-435500r060"),
        c("ToyotaPartsDeal", 277.11, f"{TPD}/toyota~hub~bearing~assy~43550-0r060.html"),
        c("Olathe Toyota", 279.50, "https://parts.olathetoyota.com/oem-parts/toyota-wheel-bearing-and-hub-assembly-435500r060"),
    ]),
    "43512-0R010": dict(msrp=95.62, comps=[
        c("Nucar Toyota", 67.13, "https://toyotaparts.nucar.com/parts/toyota-2009-2018-toyota-rav4-disc-brake-rotor-front-435120r010"),
        c("ToyotaPartsDeal", 70.79, f"{TPD}/toyota~disc~fr~43512-0r010.html"),
        c("Longo Toyota", 78.86, "https://parts.longotoyota.com/oem-parts/toyota-disc-brake-rotor-front-435120r010"),
    ], unattributed=[66.69, 67.00]),
    # research-pending records
    "90919-A2009": dict(msrp=156.01, comps=[
        c("Grieco Toyota", 103.64, "https://parts.griecotoyota.com/oem-parts/toyota-ignition-coil-90919a2009"),
        c("ToyotaPartsDeal", 110.67, f"{TPD}/toyota~coil~ignition~90919-a2009.html"),
        c("Longo Toyota", 135.95, "https://parts.longotoyota.com/oem-parts/toyota-ignition-coil-90919a2009"),
    ]),
    "04465-42200": dict(msrp=104.50, comps=[
        c("ToyotaPartsDeal", 74.93, f"{TPD}/toyota~pad~kit~disc~brake~04465-42200.html"),
        c("Capo Valley Toyota", 78.38, "https://parts.capovalleytoyota.com/oem-parts/toyota-brake-pads-front-446542200"),
        c("Longo Toyota", 83.82, "https://parts.longotoyota.com/oem-parts/toyota-brake-pads-front-446542200"),
    ], unattributed=[72.71]),
    "04465-33480": dict(msrp=104.50, comps=[
        c("AutoPartsPrime", 72.70, "https://www.autopartsprime.com/toyota/disc-brake-pad-kit/oe-0446533480"),
        c("American Toyota", 75.25, "https://parts.americantoyota.com/oem-parts/toyota-brake-pads-446533480"),
        c("Lakeland Toyota", 75.57, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-brake-pads-446533480"),
        c("Longo Toyota", 83.82, "https://parts.longotoyota.com/oem-parts/toyota-brake-pads-446533480"),
    ], unattributed=[72.07]),
    "90919-01263": dict(msrp=20.61, comps=[], unattributed=[14.00, 14.32, 14.74, 16.76, 17.35], note="Quantity ambiguous (one listing is a set of 6)."),
    "90919-01275": dict(msrp=19.61, comps=[
        c("AutoPartsPrime", 13.40, "https://www.autopartsprime.com/toyota/plug-spark/oe-9091901275"),
    ], unattributed=[13.19, 14.03, 14.50]),
    "90915-YZZN1": dict(msrp=6.57, comps=[
        c("Longo Toyota", 6.18, "https://parts.longotoyota.com/oem-parts/toyota-filter-s-a-oil-90915yzzn1"),
    ], unattributed=[4.63, 4.70], excluded="O'Reilly $10.99 (Premium Guard aftermarket)"),
    "04152-YZZA5": dict(msrp=6.57, comps=[
        c("Capo Valley Toyota", 4.60, "https://parts.capovalleytoyota.com/oem-parts/toyota-oil-filter-4152yzza5"),
        c("Lakeland Toyota", 4.68, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-oil-filter-4152yzza5"),
        c("ToyotaPartsNow", 4.70, "https://www.toyotapartsnow.com/oem/toyota~replaceable-element~04152-yzza5"),
        c("Jim Hudson Toyota", 4.91, "https://parts.jimhudsontoyota.com/oem-parts/toyota-oil-filter-4152yzza5"),
        c("Sparks Toyota", 5.11, "https://www.sparksparts.com/oem-parts/toyota-2005-2024-toyota-oil-filter-4152yzza5"),
    ]),
    "87139-YZZ08": dict(msrp=21.99, comps=[], excluded="Superseded by 87139-YZZ82 -- discontinued numbers are not benchmarked"),
    "87139-50100": dict(msrp=41.99, comps=[
        c("OEMGenuineParts.com", 26.84, f"{OGP}/toyota-cabin-air-filter-8713950100"),
        c("ToyotaPartsDeal", 28.55, f"{TPD}/toyota~element~air~refiner~87139-50100.html"),
        c("Kendall Toyota", 29.99, "https://parts.kendalltoyota.com/oem-parts/toyota-cabin-air-filter-8713950100"),
        c("Longo Toyota", 31.67, "https://parts.longotoyota.com/oem-parts/toyota-cabin-air-filter-8713950100"),
    ]),
    "43550-0R070": dict(msrp=385.88, comps=[
        c("OEMGenuineParts.com", 259.83, f"{OGP}/toyota-hub-assembly-435500r070"),
        c("ToyotaPartsDeal", 261.22, f"{TPD}/toyota~hub~bearing~assy~43550-0r070.html"),
        c("Toyota of Fort Worth", 267.98, "https://parts.toyotaoffortworth.com/p/Toyota__RAV4-PRIME/Wheel-Bearing-and-Hub-Assembly-Front/78806628/435500R070.html"),
        c("SHS Auto Parts", 283.00, "https://shsautoparts.com/products/toyota-43550-0r070-bearing-and-hub-assembly"),
    ], unattributed=[256.72]),
    "43512-0E060": dict(msrp=104.27, comps=[
        c("American Toyota", 74.29, "https://parts.americantoyota.com/oem-parts/toyota-rotor-435120e060"),
        c("Modern Toyota Wholesale Direct", 79.22, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-disc-brake-rotor-435120e060"),
        c("ToyotaPartsDeal", 81.64, f"{TPD}/toyota~disc~fr~43512-0e060.html"),
        c("Lakeland Toyota", 88.15, "https://toyotaparts.lakelandtoyota.com/oem-parts/toyota-disc-brake-rotor-435120e060"),
    ]),
    "27060-25010": dict(msrp=429.96, comps=[
        c("Modern Toyota Wholesale Direct", 294.68, "https://wholesaledirect.moderntoyota.com/oem-parts/toyota-alternator-2706025010"),
        c("ToyotaPartsDeal", 299.85, f"{TPD}/toyota~alternator~assy~w~r~27060-25010.html"),
        c("Longo Toyota", 343.79, "https://parts.longotoyota.com/oem-parts/toyota-alternator-2706025010"),
    ], excluded="AH Parts $69 and Partlimit $190.99 (used)"),
    "04465-42220": dict(msrp=None, comps=[], excluded="No listing found for this part number"),
}


# Pricing policy (owner-approved, 2026-11-18): genuine Toyota OEM parts are
# priced about 5% below the lowest verified comparable US retailer selling the
# exact same part number, moving toward 3% only when needed. No automatic
# discount, no manufactured sale price, no inflated reference price, and never
# below a profitable price.
TARGET_UNDERCUT = 0.05
MIN_UNDERCUT = 0.03

# Supplier (acquisition) cost per part number, as provided by the owner, and
# the minimum gross margin on the selling price. Nothing is invented here:
# both stay empty until the owner supplies them, and every price stays a
# competitive target under profitability review until then.
SUPPLIER_COST = {}
MIN_MARGIN = None  # e.g. 0.20 for 20% of the selling price


def competitive_price(lowest, undercut):
    """Smallest price ending in 9 cents (x.x9) that is at least `undercut`
    below `lowest` and still at least 3% below it. Falls back to the exact
    cent value if no x.x9 price fits the band."""
    target = lowest * (1 - undercut)
    ceiling = lowest * (1 - MIN_UNDERCUT)
    tenths = int(target * 10 + 1e-9)
    for t in (tenths, tenths + 1):
        cand = round((t + 1) / 10 - 0.01, 2)  # t.t9
        if target - 1e-9 <= cand <= ceiling + 1e-9:
            return cand
    return math.ceil(target * 100 - 1e-6) / 100  # round up: never more than 5% under


def margin_ok(price, cost):
    return MIN_MARGIN is not None and cost is not None and (price - cost) / price >= MIN_MARGIN


def assess(pn, is_parcel):
    """Pricing block for one part number."""
    data = PRICING.get(pn)
    if not data:
        return {"status": "no_evidence", "checkedOn": CHECKED, "recommendedPrice": None,
                "confidence": "none", "flags": ["no competitor pricing researched"]}
    comps = sorted(data["comps"], key=lambda x: x["price"])
    flags = []
    if len(comps) < 3:
        flags.append(f"only {len(comps)} attributed competitor price(s) -- fewer than 3")
    if data.get("unattributed"):
        flags.append("lower unattributed listing(s) seen; not used as benchmark")
    if data.get("note"):
        flags.append(data["note"])
    lowest = comps[0] if comps else None
    rec = competitive_price(lowest["price"], TARGET_UNDERCUT) if lowest and len(comps) >= 3 else None
    undercut = TARGET_UNDERCUT
    spread = (comps[-1]["price"] / comps[0]["price"]) if len(comps) >= 2 else None
    if not comps:
        confidence = "none"
    elif len(comps) < 3:
        confidence = "low"
    elif data.get("note") or (spread and spread > 1.35):
        confidence = "medium"
    else:
        confidence = "high"
    # Profitability: no acquisition cost is on file, so margin cannot be
    # confirmed for any part. Under the published US rate table, parcel orders
    # under $1,000 ship free, so a low-ticket parcel item ships at a loss
    # unless it is bundled into a larger order.
    cost = SUPPLIER_COST.get(pn)
    profit_flags = []
    profitability = "review required"
    if rec is not None:
        if cost is None or MIN_MARGIN is None:
            profit_flags.append("supplier cost not provided -- profitability cannot be established; flagged for review, not a selling price")
        elif margin_ok(rec, cost):
            profitability = "verified"
        else:
            alt = competitive_price(lowest["price"], MIN_UNDERCUT)
            if margin_ok(alt, cost):
                rec, undercut, profitability = alt, MIN_UNDERCUT, "verified"
                profit_flags.append("5% under fails the minimum margin; adjusted to 3% under")
            else:
                profitability = "not profitable at a competitive price"
                profit_flags.append("even 3% under the lowest competitor misses the minimum margin -- do not list at a competitive price")
        if is_parcel and rec < 25:
            profit_flags.append(f"ships free under the US parcel table; shipping cost will likely exceed the margin on a ${rec:.2f} item")
    return {
        "status": "verified" if rec is not None else "insufficient",
        "checkedOn": CHECKED,
        "msrp": data.get("msrp"),
        "lowestCompetitor": lowest,
        "competitors": comps,
        "unattributedPrices": data.get("unattributed", []),
        "excluded": data.get("excluded", ""),
        "shipping": "not verified (item price only)",
        "formula": "about 5% below the lowest verified competitor (never less than 3% below), ending in .x9",
        "undercut": undercut if rec is not None else None,
        "recommendedPrice": rec,
        "priceType": "competitive target (not approved)" if rec is not None else None,
        "supplierCost": cost,
        "profitability": profitability if rec is not None else "not assessed",
        "confidence": confidence,
        "flags": flags,
        "info": data.get("info", ""),
        "profitabilityFlags": profit_flags,
        "approved": False,
    }
