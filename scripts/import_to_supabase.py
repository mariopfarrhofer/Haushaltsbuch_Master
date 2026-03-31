import os
import requests
import pandas as pd
import numpy as np

# Supabase configuration (using environment variables for security)
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'YOUR_SUPABASE_URL').rstrip('/')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'YOUR_SUPABASE_KEY')

# If URL is bare project URL without scheme wrapper, add it
if SUPABASE_URL and not SUPABASE_URL.startswith('http') and SUPABASE_URL != 'YOUR_SUPABASE_URL':
    SUPABASE_URL = 'https://' + SUPABASE_URL

EXCEL_FILE = 'real_data.xlsx'
TABLE_NAME = 'water_readings'

def main():
    if 'YOUR_SUPABASE_URL' in SUPABASE_URL or 'YOUR_SUPABASE_KEY' in SUPABASE_KEY:
        print("Warning: Default SUPABASE_URL or SUPABASE_KEY are being used.")
        print("Please export them in your environment before running this script.")
        print("Example: export SUPABASE_URL=... export SUPABASE_KEY=...")

    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }

    try:
        # Read all sheets (e.g. 2023, 2024, etc.)
        sheets = pd.read_excel(EXCEL_FILE, sheet_name=None)
    except FileNotFoundError:
        print(f"Error: {EXCEL_FILE} not found in the current directory.")
        return
    except ImportError:
        print("Error: Required libraries are missing. Please run:")
        print("pip install pandas openpyxl requests")
        return
    
    total_uploaded = 0
    
    for sheet_name, df in sheets.items():
        print(f"\nProcessing sheet: {sheet_name}")
        
        for index, row in df.iterrows():
            datum = row.get('Datum')
            zaehlerstand = row.get('Zählerstand', row.get('Zaehlerstand')) # fallback if missing umlaut
            aktion = row.get('Aktion')

            # Skip rows where Datum or Zählerstand is null
            if pd.isna(datum) or pd.isna(zaehlerstand):
                print(f"Skipping row {index} due to missing data.")
                continue

            # Parse 'Datum' cleanly to YYYY-MM-DD
            try:
                # pandas to_datetime works robustly on both Python datetime objects and strings
                formatted_date = pd.to_datetime(datum).strftime('%Y-%m-%d')
            except Exception:
                print(f"Could not parse date '{datum}' on row {index}. Falling back to clean string.")
                formatted_date = str(datum).split(' ')[0]

            # Clean 'Aktion' string (convert NaN to None)
            action_str = str(aktion).strip() if not pd.isna(aktion) else None

            # Prepare the row payload to match the DB schema
            payload = {
                "date": formatted_date,
                "value": float(zaehlerstand),
            }
            if action_str:
                 payload["action"] = action_str
            
            print(f"Uploading {payload} ...", end=" ")
            try:
                # Send the POST request to the Supabase REST API
                response = requests.post(url, headers=headers, json=payload)
                
                # Supabase REST returns 201 for Created
                if response.status_code in [200, 201, 204]:
                    print("Success")
                    total_uploaded += 1
                else:
                    print(f"Failed ({response.status_code}): {response.text}")
                    
            except requests.exceptions.RequestException as e:
                print(f"Request Failed: {e}")
                
    print(f"\nDone. Successfully uploaded {total_uploaded} rows to '{TABLE_NAME}'.")

if __name__ == "__main__":
    main()
