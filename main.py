import requests
import json
import time
import os
from datetime import datetime

# System Configuration
SKYCIV_ENDPOINT = "https://api.skyciv.com/v3"
AUTH = {
    "username": "sahas.mittal@usask.ca",
    "key": "jtL6Tj0SAaOIepP1UuNltcCMwERAR6wOtvOcxuUSAfjTwL2xfWNZfGVDnTE78LQj"
}

# Local Output Setup
output_dir = 'data'
output_file = os.path.join(output_dir, datetime.now().strftime('%Y%m%d%H%M%S'))
os.makedirs(output_dir, exist_ok=True)

# Temporary Model Parameters
b_m = 0.130
d_m = 0.600
area_m = b_m * d_m
sec_mod_z_m = (b_m*(d_m ** 2)) / 6  # Elastic section modulus for a rectangular section

f_b_allowable_mpa = 24.0  # Max bending stress in MPa
f_r_allowable_mpa = 1.1  # Max radial stress in MPa
radius_of_curvature_m = 25.0

target_member = "2"

def run_simulation(base_model_file):
    """
    Run the SKyCiv solver by altering the exported
    SkyCiv JSON model to simulate degradation
    """

    # Load the exported model

    with open(base_model_file, 'r') as f:
        s3d_model = json.load(f)

    degradation_factor = 1.0

    print("Starting simulation...")
    print(f"Model: {base_model_file}")

    while degradation_factor >= 0.05:

        # 1. Apply the stiffness degradation
        current_stiffness = int(100000 * degradation_factor)
        s3d_model["members"][target_member]["fixity_B"] = "FFFFFS"
        s3d_model["members"][target_member]["stiffness_B_Rz"] = current_stiffness

        # Set up API instructions
        api_payload = {
            "auth": AUTH,
            "functions": [
                {"function": "S3D.session.start", "arguments": {}},
                {"function": "S3D.model.set", "arguments": {"s3d_model": s3d_model}},
                {"function": "S3D.model.solve", "arguments": {"format": "json"}}
            ]
        }

        # Trigger the API
        response = requests.post(SKYCIV_ENDPOINT, json=api_payload)

        if response.status_code != 200:
            print(f"HTTP Error {response.status_code}: Connection failed.")
            break

        result_data = response.json()

        # Error Handling
        api_status = result_data.get("response", {}).get("status")

        if api_status != 0:
            print(f"\nCRITICAL SOLVER ERROR (Status {api_status}):")
            print(result_data.get("response", {}).get("msg", "No message provided."))
            break

        # Extraction

        try:
            # Extract peak forces

            peaks = result_data["response"]["data"][target_member]["member_peak_results"]

            Fx_kN = abs(peaks["axial_force"]["max"])
            Mz_kNm = abs(peaks["bending_moment_z"]["max"])

            print(f"Extraction Successful: Member {target_member} | Fx: {Fx_kN}kN | Mz: {Mz_kNm}kNm")

        except (KeyError, IndexError, TypeError) as e:
            print(f"Critical Extraction Error: {e}")
            break

        # Calculate Stresses
        axial_stress_mpa = (Fx_kN / area_m) / 1000
        bending_stress_mpa = (Mz_kNm / sec_mod_z_m) / 1000
        total_longitudinal_stress = axial_stress_mpa + bending_stress_mpa
        radial_stress_mpa = (3 * Mz_kNm) / (2 * radius_of_curvature_m * b_m * d_m * 1000)

        # Determine Utilization Status
        util_longitudinal = (total_longitudinal_stress / f_b_allowable_mpa) * 100
        util_radial = (radial_stress_mpa / f_r_allowable_mpa) * 100
        max_utilization = max(util_longitudinal, util_radial)

        status = "nominal" if max_utilization < 75 else ("warning" if max_utilization < 95 else "critical")

        # Output the data to local JSON file

        live_payload = {
            "metadata": {"facility_id": "Nutrien Allan", "timestamp": datetime.now().isoformat()},
            "structural_health": {
                "sensor_id": "SG-01",
                "current_stress_mpa": round(total_longitudinal_stress, 2),
                "utilization_percent": round(max_utilization, 1),
                "status": status
            }
        }

        with open(output_file, "w") as json_file:
            json.dump(live_payload, json_file, indent=2)

        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] K_r: {degradation_factor:.2f} | Status: {status} ")

        degradation_factor -= 0.15
        time.sleep(3)

    print("\n Simulation terminated.")


if __name__ == "__main__":
    run_simulation("arch.json")