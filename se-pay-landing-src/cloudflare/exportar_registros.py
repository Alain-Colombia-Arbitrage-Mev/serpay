"""Descarga los registros del formulario de SE pay (Workers KV) a registros.csv.
Uso: python3 exportar_registros.py   (requiere wrangler con sesión iniciada)"""
import csv, json, subprocess, sys

NS = "f4475e4e52e24cbba500b1e69c3d24e9"
FIELDS = ["created_at", "name", "email", "whatsapp", "interest", "consent_contact",
          "consent_marketing", "ref", "project", "page", "country"]

def wr(*args):
    r = subprocess.run(["npx", "--yes", "wrangler@latest", "kv", *args, "--namespace-id", NS, "--remote"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stderr)
    return r.stdout

keys = [k["name"] for k in json.loads(wr("key", "list", "--prefix", "lead:"))]
with open("registros.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
    w.writeheader()
    for k in sorted(keys):
        w.writerow(json.loads(wr("key", "get", k)))
print(f"{len(keys)} registros guardados en registros.csv")
