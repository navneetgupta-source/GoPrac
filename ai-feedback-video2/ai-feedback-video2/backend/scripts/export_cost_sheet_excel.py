from pathlib import Path
import json
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = PROJECT_ROOT / "backend" / "output" / "reports" / "professional_cost_sheet.csv"
XLSX_PATH = PROJECT_ROOT / "backend" / "output" / "reports" / "professional_cost_sheet.xlsx"

def main():
    df = pd.read_csv(CSV_PATH)

    with pd.ExcelWriter(XLSX_PATH, engine="xlsxwriter") as writer:

        # ---------------- RUN METADATA ----------------
        df[df["category"] == "run"] \
            .drop(columns=["cost_usd", "notes"]) \
            .to_excel(writer, sheet_name="Run_Metadata", index=False)

        # ---------------- TOTAL COSTS ----------------
        df[df["category"] == "cost"] \
            .to_excel(writer, sheet_name="Total_Costs", index=False)

        # ---------------- PER QUALITY ----------------
        df[df["category"].str.startswith("quality_")] \
            .to_excel(writer, sheet_name="Per_Quality", index=False)

        # ---------------- UNIT ECONOMICS ----------------
        df[df["metric"].str.contains("cost_per", na=False)] \
            .to_excel(writer, sheet_name="Unit_Economics", index=False)

        # ---------------- RAW DATA ----------------
        df.to_excel(writer, sheet_name="Raw_Data", index=False)

    print(f"✅ Excel cost sheet generated: {XLSX_PATH}")

if __name__ == "__main__":
    main()
