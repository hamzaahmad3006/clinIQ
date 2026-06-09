import json
from database import supabase
from models.patient import WardBed, OvernightEvent, ClinicalFlag
from typing import Optional


def _parse_json(val):
    if isinstance(val, str):
        return json.loads(val)
    return val or []


def get_ward_beds() -> list[WardBed]:
    result = supabase.table("ward_beds").select("*").execute()
    beds = []
    for row in result.data or []:
        row["overnight_changes"] = _parse_json(row.get("overnight_changes"))
        beds.append(WardBed(**row))
    return beds


def get_overnight_events() -> list[OvernightEvent]:
    result = (
        supabase.table("overnight_events")
        .select("*")
        .order("id", desc=True)
        .execute()
    )
    return [OvernightEvent(**row) for row in (result.data or [])]


def generate_briefs_for_ward() -> list[WardBed]:
    beds = (
        supabase.table("ward_beds")
        .select("*")
        .eq("brief_status", "syncing")
        .execute()
    )

    if beds.data:
        syncing_ids = [b["bed"] for b in beds.data]
        supabase.table("ward_beds").update({"brief_status": "ready"}).in_("bed", syncing_ids).execute()

    supabase.table("encounters").update({"brief_status": "ready", "brief_percentage": 100}).eq("brief_status", "syncing").execute()

    return get_ward_beds()
