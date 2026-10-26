#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Resolve installation-specific paths locally, never in published payloads."""
from pathlib import Path
import json

def configure(root):
 root=Path(root);path=root/'runtime/distribution/policies.json'
 data=json.loads(path.read_text());wanted=(root/'runtime/distribution/ublock-origin.xpi').as_uri()
 entry=data['policies']['ExtensionSettings']['uBlock0@raymondhill.net']
 if entry['install_url']!=wanted:
  entry['install_url']=wanted;temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(data,indent=2)+'\n');temporary.replace(path)
if __name__=='__main__':configure(Path(__file__).resolve().parent)
