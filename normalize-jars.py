#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Make Mozilla's front-loaded ZIP central directory readable by Python zipfile."""
from pathlib import Path
import struct,sys,zipfile

def normalize(path):
 path=Path(path)
 try:
  with zipfile.ZipFile(path) as z:z.infolist()
  return
 except zipfile.BadZipFile:pass
 data=path.read_bytes();position=data.rfind(b'PK\x05\x06')
 if position<0:raise ValueError('Missing ZIP end record')
 record=list(struct.unpack('<4sHHHHLLH',data[position:position+22]));size,offset=record[5:7]
 if offset!=4 or data[offset:offset+4]!=b'PK\x01\x02':raise ValueError('Unknown archive layout')
 central=data[offset:offset+size];record[6]=position
 result=data[:position]+central+struct.pack('<4sHHHHLLH',*record)+data[position+22:]
 temporary=path.with_suffix('.normalizing');temporary.write_bytes(result)
 with zipfile.ZipFile(temporary) as z:z.infolist()
 temporary.replace(path)
if __name__=='__main__':
 for item in sys.argv[1:]:normalize(item)
