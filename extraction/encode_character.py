#!/usr/bin/env python3

from psd_tools import PSDImage
import sys

from __init__ import compress

WIDTH = 320
im = PSDImage.open(sys.argv[1])
name = sys.argv[1].split('.')[0]


output = {
    'animations': {},
    'stills': {},
}


def block_extract(layer):

    data = list(layer.as_PIL().getdata())

    xo = layer.left
    w = layer.width 
    x = 0#layer.left
    y = layer.top
    blocks = []

    for coord in data:
        if coord[3]: blocks.append("'%s,%s'" % (x+xo, y))
        x = (x + 1 + y*w) % w
        y += not x

    return '[%s]' % ','.join(blocks)


def basic_extract(layer, pre=None):
    # For animations
    if layer.name in ('STOP', 'LOOP', 'FUNC'):
        return "'%s'" % layer.name
    data = list(layer.topil().getdata())

    width = int(layer.name)
    padleft = [''] * layer.left
    padright = [''] * (width - layer.left - layer.width)
    farry = []
    temp = []

    farry = farry + [''] * (width * layer.top)
    for rgba in data:
        pixel = "%s,%s,%s" % rgba[:-1] if rgba[3] else ""
        temp.append(pixel)
        if not len(temp) % layer.width:
            farry = farry + padleft + temp + padright
            temp = []

    farry = compress(farry)
    # this is a width setting
    if pre:
        farry = [int(pre)] + farry

    return '%s' % farry


def animation_extract(data):
    output = '{'
    for moving_set in data:
        output='''%s
             %s: {''' % (output, moving_set.name)
        for layer in moving_set:
            output = '''%s
            %s: [''' % (output, layer.name)

            frames = ",\n".join([ basic_extract(frame, pre=frame.name) for frame in layer ])
            
            output = '''%s
                %s
              ''' % (output, frames)
            output = '''%s
                ],''' % output
        output = '''%s
                },''' % output
    output = '''%s
            }''' % output
    return output


def still_extract(data):
    output = '{'
    for still_box in data:
        output='''%s
             %s: {
                width: %s,
                content: %s,
             },''' % (output,
                      still_box.name,
                      still_box[0].name,
                      basic_extract(still_box[0]))
    output = '''%s
            }''' % output

    return output


for layer in im:
    if layer.name == 'animations' and layer.is_group():
        output['animations'] = animation_extract(layer)
    if layer.name == 'stills' and layer.is_group():
        output['stills'] = still_extract(layer)
            

print('''const {name}art = {{
    animations: {animations},
    stills: {stills},
}}

export default {name}art'''.format(
    name=name,
    animations=output['animations'],
    stills=output['stills'],
))
