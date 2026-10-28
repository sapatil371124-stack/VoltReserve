import random
import re

# Realistic landmarks and street suffixes for Maharashtra cities
LANDMARKS_BY_CITY = {
    1: [ # Nashik
        ("Gangapur Road", "Near Pramod Mahajan Garden", "422005"),
        ("College Road", "Opposite BYK College", "422005"),
        ("Mumbai Naka", "Near Express Inn & NH-3 Flyover", "422001"),
        ("Indira Nagar", "Beside Govind Nagar Flyover", "422009"),
        ("Govind Nagar", "Near City Centre Mall Annex", "422009"),
        ("Pathardi Phata", "Close to Lekha Nagar Ground", "422010"),
        ("Satpur MIDC", "Opposite Bosch Gate 2", "422007"),
        ("Ambad MIDC", "Near Mahindra & Mahindra Circle", "422010"),
        ("Nashik Road", "Adjacent to Central Railway Terminal", "422101"),
        ("Bytco Point", "Near Bytco Hospital Junction", "422101"),
        ("Jail Road", "Near Shivaji Chowk", "422101"),
        ("Dwarka Circle", "Near Hotel Dwarka Highway Crossing", "422011"),
        ("Panchavati", "Near Ramkund & Godavari Ghats", "422003"),
        ("Adgaon Naka", "Near MET Engineering Campus", "422003"),
        ("Mahatma Nagar", "Beside Golf Club Ground", "422007"),
        ("Sharanpur Road", "Near Kulkarni Garden", "422002"),
        ("Canada Corner", "Near Sharanpur Police Chowki", "422005"),
        ("Tidke Colony", "Near Rajiv Gandhi Bhavan", "422002"),
        ("Untwadi Road", "Opposite City Centre Mall Gate 3", "422002"),
        ("Ashoka Marg", "Near Ashoka Universal School", "422006"),
    ],
    2: [ # Pune
        ("Hinjawadi Phase 1", "Near Wipro Circle & Blue Ridge", "411057"),
        ("Hinjawadi Phase 2", "Opposite Infosys Campus Gate 1", "411057"),
        ("Hinjawadi Phase 3", "Near Tech Mahindra SEZ", "411057"),
        ("Wakad", "Near Bhumkar Chowk & Highway", "411057"),
        ("Baner High Street", "Opposite Balewadi Phata High Street", "411045"),
        ("Balewadi", "Near Shiv Chhatrapati Sports Complex", "411045"),
        ("Aundh", "Near Westend Mall & DP Road", "411007"),
        ("Pashan", "Near Pashan Lake Circle", "411021"),
        ("Kothrud", "Near Chandani Chowk Flyover", "411038"),
        ("Shivajinagar", "Near FC Road & Agriculture College", "411005"),
        ("Senapati Bapat Road", "Near ICC Tech Towers & Marriott", "411016"),
        ("Koregaon Park", "Near Lane 5 Cafe Strip", "411001"),
        ("Kalyani Nagar", "Near Joggers Park & Gold Adlabs", "411006"),
        ("Viman Nagar", "Adjacent to Phoenix Marketcity", "411014"),
        ("Kharadi", "Near EON Free Zone Gate 2", "411014"),
        ("Magarpatta City", "Near Cybercity Tower 4", "411028"),
        ("Hadapsar", "Near Gadital Highway Junction", "411028"),
        ("Pimpri", "Opposite Finolex Pipes MIDC", "411018"),
        ("Chinchwad", "Near Chinchwad Railway Station", "411033"),
        ("Bhosari", "Near Century Enka Industrial Area", "411026"),
    ],
    3: [ # Mumbai
        ("BKC Financial Center", "Near Bharat Diamond Bourse, G Block", "400051"),
        ("BKC Platina", "Near Jio World Drive, Avenue 3", "400051"),
        ("Bandra West", "Near Linking Road & Turner Rd", "400050"),
        ("Lower Parel", "Opposite Palladium & High Street Phoenix", "400013"),
        ("Worli", "Near Worli Sea Face Promenade", "400018"),
        ("Nariman Point", "Near Express Towers & Marine Drive", "400021"),
        ("Fort", "Near Ballard Estate Port Gate", "400001"),
        ("Dadar", "Near Shivaji Park North Gate", "400028"),
        ("Andheri East", "Near Terminal 2 International Airport", "400099"),
        ("Andheri West", "Near Lokhandwala Complex Market", "400053"),
        ("Powai", "Near Hiranandani Galleria & IIT Bombay", "400076"),
        ("Goregaon East", "Near Nesco IT Park & WEH", "400063"),
        ("Malad West", "Near Mindspace Tech Park & Inorbit", "400064"),
        ("Borivali West", "Near Shimpoli Metro Station", "400092"),
        ("Vashi", "Opposite Inorbit Mall Palm Beach Road", "400705"),
        ("Seawoods", "Inside Seawoods Grand Central Railway Complex", "400706"),
        ("CBD Belapur", "Near Sector 11 Tech Hub", "400614"),
        ("Airoli", "Near Mindspace Knowledge Park", "400708"),
        ("Mahape", "Near Millennium Business Park MBP", "400710"),
    ],
    4: [ # Thane
        ("Teen Hath Naka", "Near Nitin Company Flyover", "400601"),
        ("Cadbury Junction", "Near Eastern Express Highway Entry", "400601"),
        ("Viviana Mall", "Near Service Road Next to Jupiter Hospital", "400606"),
        ("Korum Mall", "Near Eastern Express Highway Corridor", "400606"),
        ("Wagle Estate", "Near Road No 16 Industrial Zone", "400604"),
        ("Naupada", "Near Ram Maruti Road Cross", "400602"),
        ("Majiwada Junction", "Near Lodha Paradise Approach", "400601"),
        ("Hiranandani Estate", "Near The Walk High Street", "400607"),
        ("Hiranandani Meadows", "Near Pokhran Road No 2", "400610"),
        ("Kasarvadavali", "Near Ghodbunder Highway Junction", "400615"),
    ],
    5: [ # Nagpur
        ("MIHAN SEZ", "Near AIIMS & Infosys Nagpur Campus", "441108"),
        ("Airport Metro Terminal", "Near Wardha Road South Approach", "440025"),
        ("Manish Nagar", "Near Railway Crossing Market", "440015"),
        ("Chhatrapati Square", "Near Ring Road Flyover", "440015"),
        ("Pratap Nagar", "Near Pioneer Society Garden", "440022"),
        ("Gayatri Nagar", "Near IT Park Complex & VNIT", "440022"),
        ("Dharampeth", "Near West High Court Road", "440010"),
        ("Civil Lines", "Near High Court of Judicature", "440001"),
        ("Sadar", "Near Mount Road Commercial Strip", "440001"),
        ("Hingna MIDC", "Near Electronic Zone Industrial Estate", "440028"),
    ],
    6: [ # Chhatrapati Sambhajinagar
        ("Kranti Chowk", "Near Shivaji Maharaj Flyover", "431001"),
        ("Jalna Road", "Near Seven Hills Sky Junction", "431005"),
        ("CIDCO Connaught Place", "Near CIDCO Bus Stand Market", "431003"),
        ("Prozone Mall", "Near Jalna Road Commercial Belt", "431003"),
        ("Nirala Bazar", "Near City Center Market", "431001"),
        ("Railway Station Area", "Near Central Railway Terminus", "431005"),
        ("Beed Bypass", "Near Highway Service Corridor", "431005"),
        ("Waluj MIDC", "Near Bajaj Auto Ancillary Zone", "431136"),
        ("Shendra DMIC", "Near Smart Industrial City Hub", "431154"),
        ("Chikalthana", "Near Airport Link Highway", "431006"),
    ]
}

def clean_name(raw_name):
    # Turn "[Demo] Tata Power EZ Charge - Gangapur Road #1" into "[Demo] Tata Power EZ Charge — Gangapur Hub"
    # or "[Demo] Jio-bp pulse — Hinjawadi Tech Point"
    # Remove awkward "#1", "#2", etc.
    s = re.sub(r'\s*#\d+', '', raw_name)
    s = s.replace(' - ', ' — ')
    # If ends with dash or space, trim
    s = s.strip()
    return s

def build_sql():
    import subprocess
    # Read existing locations and stations from mysql
    cmd = ['C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe', '-u', 'root', 'voltreserve', '-e', 
           'SELECT l.id, l.city_id, l.name, s.id as stn_id, s.name as stn_name FROM locations l JOIN charging_stations s ON s.location_id = l.id ORDER BY l.id;']
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    rows = res.stdout.strip().split('\n')[1:]
    
    updates = ["USE voltreserve;\n"]
    
    hub_types = ["Hub", "Superstation", "Express Point", "Charging Depot", "Power Plaza", "FastCharge Station", "Green Energy Hub"]
    
    for r in rows:
        parts = r.split('\t')
        if len(parts) < 5:
            continue
        loc_id, city_id, loc_name, stn_id, stn_name = parts[0], int(parts[1]), parts[2], parts[3], parts[4]
        
        # Pick realistic landmark set
        pool = LANDMARKS_BY_CITY.get(city_id, LANDMARKS_BY_CITY[1])
        item = pool[int(loc_id) % len(pool)]
        area_name, landmark, pincode = item
        
        hub_choice = hub_types[int(loc_id) % len(hub_types)]
        clean_loc_name = f"{area_name} {hub_choice}"
        clean_address = f"Plot {int(loc_id)*3 + 12}, {area_name} Main Road, {landmark}"
        
        # Clean station name
        c_stn_name = clean_name(stn_name)
        # Ensure it has an area descriptor
        if not any(a in c_stn_name for a in ["Hub", "Center", "Plaza", "Oasis", "Superstation", "Depot", "Station"]):
            c_stn_name = f"{c_stn_name} {hub_choice}"
            
        clean_loc_name_esc = clean_loc_name.replace("'", "''")
        clean_address_esc = clean_address.replace("'", "''")
        landmark_esc = landmark.replace("'", "''")
        c_stn_name_esc = c_stn_name.replace("'", "''")
        
        updates.append(
            f"UPDATE locations SET name='{clean_loc_name_esc}', address='{clean_address_esc}', landmark='{landmark_esc}', postal_code='{pincode}' WHERE id={loc_id};"
        )
        updates.append(
            f"UPDATE charging_stations SET name='{c_stn_name_esc}' WHERE id={stn_id};"
        )
        
    with open("database/polish_locations.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(updates))
        
    print(f"Generated polish SQL with {len(rows)} location and station updates.")

if __name__ == "__main__":
    build_sql()
