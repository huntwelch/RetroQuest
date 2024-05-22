#!/usr/bin/env python

from psd_tools import PSDImage
import sys

from __init__ import compress

WIDTH = 320
im = PSDImage.open(sys.argv[1])
name = sys.argv[1].split('.')[0]

output = ''

def basic_extract(layer):
    data = list(layer.topil().getdata())
    farry = [ "%s,%s,%s" % rgba[:-1] if rgba[3] else "" for rgba in data ]
    return '%s' % compress(farry)

for layer in im:
    output = '  %s\n%s: %s,' % (output, layer.name, basic_extract(layer))

print '''const stillart = {{
{output}
}}

export default stillart'''.format(
    name=name,
    output=output,
)

