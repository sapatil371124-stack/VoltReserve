import os
import random

def generate():
    # Seed for deterministic generation
    random.seed(42)

    lines = []
    lines.append("-- ============================================================================")
    lines.append("-- VoltReserve Large Realistic EV Station Dataset")
    lines.append("-- Covers Nashik (75), Pune (105), Mumbai (110), Thane (55), Nagpur (55), Chhatrapati Sambhajinagar (40)")
    lines.append("-- Total 440 unique stations, ~1000 chargers with realistic coordinates & pricing")
    lines.append("-- ============================================================================\n")
    lines.append("USE voltreserve;\n")

    # 1. Ensure all 6 cities exist
    lines.append("-- 1. CITIES")
    lines.append("INSERT INTO cities (id, name, state, country, latitude, longitude) VALUES")
    lines.append("(1, 'Nashik', 'Maharashtra', 'India', 19.9974530, 73.7898030),")
    lines.append("(2, 'Pune', 'Maharashtra', 'India', 18.5204300, 73.8567440),")
    lines.append("(3, 'Mumbai', 'Maharashtra', 'India', 19.0760900, 72.8774260),")
    lines.append("(4, 'Thane', 'Maharashtra', 'India', 19.2183300, 72.9780900),")
    lines.append("(5, 'Nagpur', 'Maharashtra', 'India', 21.1458000, 79.0881550),")
    lines.append("(6, 'Chhatrapati Sambhajinagar', 'Maharashtra', 'India', 19.8761650, 75.3433140)")
    lines.append("ON DUPLICATE KEY UPDATE name=VALUES(name), latitude=VALUES(latitude), longitude=VALUES(longitude);\n")

    # City definitions with neighborhood nodes
    cities_data = {
        1: { # Nashik
            "name": "Nashik",
            "center": (19.9975, 73.7898),
            "postal_prefix": "422",
            "nodes": [
                ("Gangapur Road", 19.9982, 73.7654),
                ("College Road", 20.0035, 73.7621),
                ("Mumbai Naka", 19.9880, 73.7850),
                ("Indira Nagar", 19.9675, 73.7820),
                ("Govind Nagar", 19.9750, 73.7740),
                ("Pathardi Phata", 19.9480, 73.7710),
                ("Satpur MIDC", 19.9920, 73.7310),
                ("Ambad MIDC", 19.9390, 73.7430),
                ("Nashik Road Station", 19.9540, 73.8340),
                ("Bytco Point", 19.9510, 73.8390),
                ("Jail Road", 19.9620, 73.8420),
                ("Dwarka Circle", 19.9850, 73.8010),
                ("Panchavati", 20.0120, 73.7980),
                ("Adgaon Naka", 20.0280, 73.8320),
                ("Mahatma Nagar", 19.9910, 73.7540),
                ("Sharanpur Road", 19.9990, 73.7780),
                ("Canada Corner", 19.9940, 73.7830),
                ("Tidke Colony", 19.9820, 73.7760),
                ("Untwadi City Centre Mall", 19.9800, 73.7630),
                ("Ashoka Marg", 19.9720, 73.7910),
                ("Upnagar Highway", 19.9600, 73.8210),
                ("Deolali Camp", 19.9320, 73.8310),
                ("Makhmalabad Road", 20.0350, 73.7790),
                ("Mhasrul Link Road", 20.0410, 73.8050),
                ("Trimbak Naka", 19.9900, 73.7710),
            ],
            "count": 75
        },
        2: { # Pune
            "name": "Pune",
            "center": (18.5204, 73.8567),
            "postal_prefix": "411",
            "nodes": [
                ("Hinjawadi Phase 1", 18.5913, 73.7389),
                ("Hinjawadi Phase 2", 18.5830, 73.7190),
                ("Hinjawadi Phase 3", 18.5710, 73.6980),
                ("Wakad", 18.5980, 73.7620),
                ("Baner High Street", 18.5590, 73.7780),
                ("Balewadi Stadium Road", 18.5730, 73.7710),
                ("Aundh Westend Mall", 18.5610, 73.8070),
                ("Pashan Sus Road", 18.5440, 73.7840),
                ("Kothrud Chandani Chowk", 18.5070, 73.7860),
                ("Kothrud Paud Road", 18.5080, 73.8110),
                ("Deccan Gymkhana", 18.5170, 73.8420),
                ("Shivajinagar FC Road", 18.5310, 73.8460),
                ("Senapati Bapat Road", 18.5320, 73.8290),
                ("Koregaon Park North Main", 18.5362, 73.8940),
                ("Kalyani Nagar Joggers Park", 18.5470, 73.9030),
                ("Viman Nagar Phoenix Mall", 18.5620, 73.9170),
                ("Kharadi EON Free Zone", 18.5510, 73.9510),
                ("Magarpatta Cybercity", 18.5130, 73.9280),
                ("Hadapsar Gadital", 18.5020, 73.9310),
                ("Fatima Nagar Wanowrie", 18.4970, 73.8990),
                ("Camp MG Road", 18.5190, 73.8770),
                ("Swargate Bus Station", 18.5010, 73.8580),
                ("Katraj Chowk", 18.4550, 73.8670),
                ("Sinhagad Road Vadgaon", 18.4710, 73.8190),
                ("Bavdhan Pune-Bangalore Hwy", 18.5180, 73.7740),
                ("Pimpri City Centre", 18.6270, 73.8010),
                ("Chinchwad Station", 18.6360, 73.7850),
                ("Bhosari MIDC", 18.6310, 73.8480),
                ("Nigdi Pradhikaran", 18.6520, 73.7710),
                ("Akurdi Railway Station", 18.6470, 73.7610),
                ("Ravet Kiwale Junction", 18.6480, 73.7380),
                ("Moshi Toll Plaza", 18.6740, 73.8590),
                ("Chakan MIDC Phase 2", 18.7510, 73.8420),
            ],
            "count": 105
        },
        3: { # Mumbai
            "name": "Mumbai",
            "center": (19.0760, 72.8774),
            "postal_prefix": "400",
            "nodes": [
                ("BKC Financial Center", 19.0667, 72.8687),
                ("BKC Platina & Jio Garden", 19.0620, 72.8640),
                ("Bandra West Linking Road", 19.0590, 72.8340),
                ("Bandra West Bandstand", 19.0430, 72.8190),
                ("Lower Parel High Street Phoenix", 18.9950, 72.8250),
                ("Worli Sea Face", 19.0180, 72.8160),
                ("Nariman Point Express Towers", 18.9270, 72.8220),
                ("Colaba Causeway", 18.9150, 72.8260),
                ("Fort Ballard Estate", 18.9350, 72.8390),
                ("Dadar Shivaji Park", 19.0270, 72.8380),
                ("Dadar TT Circle", 19.0190, 72.8460),
                ("Kurla Phoenix Marketcity", 19.0860, 72.8890),
                ("Ghatkopar R City Mall", 19.0990, 72.9160),
                ("Chembur Diamond Garden", 19.0540, 72.8990),
                ("Andheri East T2 Airport Approach", 19.1025, 72.8690),
                ("Andheri East MIDC Chakala", 19.1170, 72.8680),
                ("Andheri West Lokhandwala", 19.1410, 72.8290),
                ("Juhu Beach JW Marriott", 19.1010, 72.8260),
                ("Powai Hiranandani Business Park", 19.1190, 72.9080),
                ("Vikhroli Godrej One", 19.1040, 72.9290),
                ("Goregaon East Nesco Center", 19.1550, 72.8550),
                ("Goregaon West Inorbit Link Rd", 19.1720, 72.8360),
                ("Malad West Mindspace", 19.1860, 72.8350),
                ("Kandivali West Mahavir Nagar", 19.2080, 72.8410),
                ("Borivali West Shimpoli", 19.2310, 72.8460),
                ("Borivali East National Park", 19.2290, 72.8620),
                ("Mulund West R Mall", 19.1750, 72.9510),
                ("Vashi Inorbit Palm Beach Rd", 19.0650, 72.9980),
                ("Sanpada Station Corridor", 19.0580, 73.0110),
                ("Nerul LP Junction", 19.0340, 73.0170),
                ("Seawoods Grand Central Plaza", 19.0163, 73.0189),
                ("CBD Belapur Railway Complex", 19.0190, 73.0390),
                ("Kharghar Central Park", 19.0480, 73.0690),
                ("Airoli Mindspace Tech Park", 19.1590, 72.9980),
                ("Mahape Millennium Business Park", 19.1100, 73.0180),
                ("Panvel Expressway Gateway", 18.9910, 73.1170),
            ],
            "count": 110
        },
        4: { # Thane
            "name": "Thane",
            "center": (19.2183, 72.9781),
            "postal_prefix": "400",
            "nodes": [
                ("Teen Hath Naka", 19.1870, 72.9590),
                ("Nitin Company Junction", 19.1930, 72.9640),
                ("Cadbury Junction", 19.2010, 72.9690),
                ("Viviana Mall Eastern Express", 19.2080, 72.9720),
                ("Korum Mall Mangal Pandey Rd", 19.1980, 72.9670),
                ("Wagle Industrial Estate MIDC", 19.1890, 72.9460),
                ("Naupada Ram Maruti Road", 19.1880, 72.9750),
                ("Majiwada Flyover Junction", 19.2170, 72.9790),
                ("Kapurbawdi Naka", 19.2240, 72.9840),
                ("Manpada Ghodbunder Road", 19.2390, 72.9760),
                ("Hiranandani Estate The Walk", 19.2550, 72.9770),
                ("Hiranandani Meadows", 19.2290, 72.9640),
                ("Pokhran Road No 1", 19.2110, 72.9580),
                ("Pokhran Road No 2 Upvan Lake", 19.2210, 72.9510),
                ("Kasarvadavali Hypercity Strip", 19.2680, 72.9680),
                ("Ovala Ghodbunder Corridor", 19.2770, 72.9610),
                ("Gaimukh Waterfront", 19.2890, 72.9520),
                ("Kalwa Naka Railway Road", 19.2020, 72.9960),
                ("Balkum Saket Complex", 19.2260, 72.9990),
                ("Brahmand Junction", 19.2480, 72.9810),
            ],
            "count": 55
        },
        5: { # Nagpur
            "name": "Nagpur",
            "center": (21.1458, 79.0882),
            "postal_prefix": "440",
            "nodes": [
                ("MIHAN SEZ Aerospace Hub", 21.0540, 79.0510),
                ("Airport Metro Terminal Wardha Rd", 21.0920, 79.0630),
                ("Manish Nagar Shopping Strip", 21.0970, 79.0760),
                ("Chhatrapati Square Ring Road", 21.1120, 79.0720),
                ("Pratap Nagar Pioneer Society", 21.1210, 79.0550),
                ("Gayatri Nagar IT Park", 21.1240, 79.0490),
                ("Trimurti Nagar Ring Rd", 21.1250, 79.0380),
                ("Hingna MIDC Industrial Zone", 21.1150, 78.9980),
                ("Dharampeth West High Court Rd", 21.1430, 79.0620),
                ("Ramdaspeth Central Avenue", 21.1370, 79.0750),
                ("Shankar Nagar Square", 21.1340, 79.0610),
                ("Civil Lines High Court Complex", 21.1550, 79.0710),
                ("Sadar Mount Road Market", 21.1630, 79.0830),
                ("Sitabuldi Interchange Metro", 21.1460, 79.0860),
                ("Medical Square GMC", 21.1330, 79.0980),
                ("Reshimbagh Ground Corridor", 21.1280, 79.1120),
                ("Nandanvan Hasanbagh Chowk", 21.1340, 79.1320),
                ("Kamptee Road Automotive Square", 21.1890, 79.1140),
                ("Koradi Road Power Grid Hub", 21.2120, 79.0960),
                ("Besa Pipla Urban Extension", 21.0780, 79.0910),
            ],
            "count": 55
        },
        6: { # Chhatrapati Sambhajinagar (Aurangabad)
            "name": "Chhatrapati Sambhajinagar",
            "center": (19.8762, 75.3433),
            "postal_prefix": "431",
            "nodes": [
                ("Kranti Chowk Main Junction", 19.8740, 75.3270),
                ("Jalna Road Highway Corridor", 19.8780, 75.3620),
                ("CIDCO Connaught Place", 19.8860, 75.3670),
                ("Prozone Mall Jalna Road", 19.8790, 75.3850),
                ("Nirala Bazar Commercial", 19.8820, 75.3290),
                ("Railway Station Area", 19.8620, 75.3190),
                ("Beed Bypass Highway Hub", 19.8450, 75.3350),
                ("Garkheda Renuka Mata Mandir Rd", 19.8590, 75.3580),
                ("Seven Hills Sky Junction", 19.8770, 75.3510),
                ("Waluj MIDC Industrial Sector", 19.8410, 75.2480),
                ("Shendra DMIC Smart City Hub", 19.8890, 75.4520),
                ("Chikalthana Airport Road", 19.8720, 75.3990),
                ("Paithan Road Mahanagar", 19.8480, 75.3120),
                ("TV Centre HUDCO Corner", 19.9070, 75.3490),
            ],
            "count": 40
        }
    }

    ev_networks = [
        ("Tata Power EZ Charge", "Tata Power EV Fleet Network"),
        ("Jio-bp pulse", "Reliance bp Mobility Limited"),
        ("Statiq HyperCharge", "Statiq EV Charging Infrastructure"),
        ("Zeon Fast Charging", "Zeon Charging High Speed Hub"),
        ("ChargeZone Highway Hub", "ChargeZone Inter-City Ultra Chargers"),
        ("Magenta ChargeGrid", "Magenta Mobility Smart Charge Point"),
        ("Shell Recharge", "Shell Mobility Global Recharge Hub"),
        ("Fortum Charge & Drive", "Fortum Clean Energy Station"),
        ("Ather Grid & Superchargers", "Ather / Multi-Brand Fleet PowerPoint"),
        ("VoltReserve Flagship Hub", "VoltReserve Certified Ultra-Fast Depot")
    ]

    amenity_combos = [
        "EV Lounge, High-Speed WiFi, Cafe, Clean Restrooms, 24/7 Security",
        "Convenience Store, Tire Pressure Air, Restrooms, CCTV Monitoring",
        "Shopping Mall Access, Dining Options, Restrooms, Covered Canopy",
        "Executive Work Pods, High-Speed WiFi, Coffee Vending, EV Valet",
        "24/7 Snack Bar, Clean Restrooms, Drinking Water, Well-lit Bay",
        "Organic Coffee Kiosk, EV Battery Diagnostics, Shaded Parking",
        "Food Court Access, ATM, 24/7 CCTV, Wheelchair Accessible, Tire Inflator",
        "Solar Canopy Roof, EV Tech Support, Driver Rest Pods, Free Air"
    ]

    location_id_counter = 10
    station_id_counter = 10
    charger_id_counter = 22

    lines.append("-- 2. LOCATIONS & STATIONS & CHARGERS")

    for city_id, cinfo in cities_data.items():
        city_name = cinfo["name"]
        target_count = cinfo["count"]
        nodes = cinfo["nodes"]
        postal_pfx = cinfo["postal_prefix"]

        # If it's one of the first 3 cities, 3 locations & stations already exist (IDs 1-9)
        # So generate (target_count - 3) additional stations
        count_to_generate = target_count
        if city_id in [1, 2, 3]:
            count_to_generate = target_count - 3

        lines.append(f"\n-- City: {city_name} (Generating {count_to_generate} stations, Total: {target_count})")

        for idx in range(count_to_generate):
            node_name, base_lat, base_lng = nodes[idx % len(nodes)]
            # Add small random jitter (0.001 to 0.008 deg, approx 100m to 800m)
            jitter_lat = (random.random() - 0.5) * 0.012
            jitter_lng = (random.random() - 0.5) * 0.012
            station_lat = round(base_lat + jitter_lat, 7)
            station_lng = round(base_lng + jitter_lng, 7)

            network_name, network_operator = random.choice(ev_networks)
            amenities = random.choice(amenity_combos)
            rating = round(random.uniform(4.25, 4.95), 2)
            operating_hours = "24/7" if random.random() > 0.15 else "06:00 AM - 11:00 PM"
            phone = f"+91{random.randint(9000000000, 9999999999)}"
            pincode = f"{postal_pfx}{random.randint(10, 99):02d}"

            loc_name = f"{node_name} Sector {idx + 1}"
            loc_address = f"Plot {random.randint(12, 450)}, {node_name} Main Road, Near Landmark {idx + 1}"
            loc_landmark = f"Opposite {node_name} Point"

            loc_name_esc = loc_name.replace("'", "''")
            loc_address_esc = loc_address.replace("'", "''")
            loc_landmark_esc = loc_landmark.replace("'", "''")
            amenities_esc = amenities.replace("'", "''")

            # Insert Location
            current_loc_id = location_id_counter
            location_id_counter += 1

            lines.append(
                f"INSERT INTO locations (id, city_id, name, address, landmark, postal_code, latitude, longitude) VALUES "
                f"({current_loc_id}, {city_id}, '{loc_name_esc}', '{loc_address_esc}', '{loc_landmark_esc}', '{pincode}', {station_lat}, {station_lng}) "
                f"ON DUPLICATE KEY UPDATE name=VALUES(name), latitude=VALUES(latitude), longitude=VALUES(longitude);"
            )

            # Insert Charging Station
            current_stn_id = station_id_counter
            station_id_counter += 1

            stn_name = f"[Demo] {network_name} - {node_name} #{idx + 1}"
            stn_name_esc = stn_name.replace("'", "''")
            stn_desc = f"Verified high-throughput EV dispensing hub operated by {network_operator}. Demo/Test Charging Station configured for VoltReserve advance slot booking and telemetry."
            stn_desc_esc = stn_desc.replace("'", "''")

            lines.append(
                f"INSERT INTO charging_stations (id, location_id, name, description, operating_hours, amenities, rating, is_active, contact_phone) VALUES "
                f"({current_stn_id}, {current_loc_id}, '{stn_name_esc}', '{stn_desc_esc}', '{operating_hours}', '{amenities_esc}', {rating}, TRUE, '{phone}') "
                f"ON DUPLICATE KEY UPDATE name=VALUES(name), rating=VALUES(rating);"
            )

            # Insert Chargers (1 to 3 dispensers per station)
            charger_count = random.choices([1, 2, 3], weights=[0.2, 0.6, 0.2])[0]
            city_code = city_name[:3].upper()

            for c_idx in range(charger_count):
                current_chg_id = charger_id_counter
                charger_id_counter += 1

                # Pick dispenser profile
                # Options:
                # 1: Dual CCS2 120-150kW
                # 2: CCS2 60kW DC Fast
                # 3: Type 2 AC 22kW
                # 4: CHAdeMO DC 50-60kW
                disp_type = random.choices([1, 2, 3, 4], weights=[0.45, 0.30, 0.20, 0.05])[0]
                if disp_type == 1:
                    conn_id = 1 # CCS2
                    power = random.choice([120.00, 150.00, 180.00])
                    cur_type = 'DC'
                    price = round(random.uniform(20.50, 24.00), 2)
                    c_code = f"{city_code}-STN{current_stn_id}-CCS2-{c_idx+1}"
                elif disp_type == 2:
                    conn_id = 1 # CCS2 60kW
                    power = 60.00
                    cur_type = 'DC'
                    price = round(random.uniform(18.00, 20.00), 2)
                    c_code = f"{city_code}-STN{current_stn_id}-DC60-{c_idx+1}"
                elif disp_type == 3:
                    conn_id = 2 # TYPE2
                    power = 22.00
                    cur_type = 'AC'
                    price = round(random.uniform(13.50, 16.00), 2)
                    c_code = f"{city_code}-STN{current_stn_id}-TYP2-{c_idx+1}"
                else:
                    conn_id = 3 # CHADEMO
                    power = 50.00
                    cur_type = 'DC'
                    price = round(random.uniform(17.50, 19.50), 2)
                    c_code = f"{city_code}-STN{current_stn_id}-CHAD-{c_idx+1}"

                lines.append(
                    f"INSERT INTO chargers (id, station_id, connector_type_id, identifier_code, power_output_kw, current_type, price_per_kwh, status) VALUES "
                    f"({current_chg_id}, {current_stn_id}, {conn_id}, '{c_code}', {power}, '{cur_type}', {price}, 'ACTIVE') "
                    f"ON DUPLICATE KEY UPDATE power_output_kw=VALUES(power_output_kw), price_per_kwh=VALUES(price_per_kwh);"
                )

    out_path = os.path.join(os.path.dirname(__file__), "seed_large_stations.sql")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated {station_id_counter - 1} total stations, {location_id_counter - 1} locations, {charger_id_counter - 1} chargers.")
    print(f"Output saved to: {out_path}")

if __name__ == "__main__":
    generate()
