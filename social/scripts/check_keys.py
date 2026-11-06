"""Checks each key in turn and prints a plain result. Used by the 'Check keys' workflow."""
import sys, traceback
sys.path.insert(0, ".")
which = sys.argv[1]
try:
    if which == "gemini":
        import os, requests
        from autopilot.captions import gemini
        lr = requests.get("https://generativelanguage.googleapis.com/v1beta/models", headers={"x-goog-api-key": os.environ.get("GEMINI_API_KEY", "")}, timeout=30)
        print("Gemini model list:", lr.status_code, [m["name"] for m in lr.json().get("models", []) if "flash" in m["name"]][:15] if lr.ok else lr.text[:300])
        r = gemini('Reply with this JSON exactly: {"ok": true}')
        print("Gemini:", "WORKING" if r else "NOT WORKING (no reply; key missing, wrong, or not allowed on the free tier in the UK)")
    elif which == "drive":
        from autopilot import intake
        t = intake.token()
        print("Drive: WORKING. Files in Social inbox:", [f["name"] for f in intake.list_files(t)])
    elif which == "buffer":
        from autopilot import publish
        publish.buffer_check(); print("Buffer: WORKING")
except Exception:
    print(f"{which}: NOT WORKING"); traceback.print_exc()
