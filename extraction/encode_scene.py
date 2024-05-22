#!/usr/bin/env python3

from psd_tools import PSDImage
import sys

from __init__ import compress

WIDTH = 320
im = PSDImage.open(sys.argv[1])
name = sys.argv[1].split('.')[0]

output = {
    'bg': None,
    'block': None,
    'layers': [],
    'zones': [],
}

def block_extract(layer):

    data = list(layer.topil().getdata())

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
    farry = [ "%s,%s,%s" % rgba[:-1] if rgba[3] else "" for rgba in data ]
    farry = compress(farry)
    if pre:
        farry = [int(pre)] + farry
        
    return '%s' % farry


def animation_extract(data):
    output = '''
        {
                  name: '%s',''' % data.name
    for layer in data:
        if layer.name == 'content':
            output = '''%s
                  position: { x: %s, y: %s, z: %s },
                  content: %s,
                  width: %s,
                  ''' % (
                  output,
                  layer.left,
                  layer.top,
                  layer.top + child.height,
                  basic_extract(layer),
                  layer.width,                 
                  )
            continue
        
        if layer.name == 'alts':
            output = '''%s
                alts: {''' % output
            for alt in layer:
                output = '''%s
                    %s: %s,''' % (output, alt.name, basic_extract(alt))
            output = '''%s
                },''' % output


        if layer.name == 'animations':
            output = '''%s
                  animations: {''' % output
            for moving_set in layer:
                output = '''%s
                    %s: {''' % (output, moving_set.name)
                for animation in moving_set:
                    frames = ',\n'.join([ basic_extract(frame, pre=frame.name) for frame in animation ])
                    output = '''%s
                      %s: {
                        frames: [
                        %s
                        ],
                      },''' % (output, animation.name, frames)
                output = '''%s
                    },''' % output
            output = '''%s
                },''' % output
    output = '''%s
        },''' % output

    return output            


for layer in im:
    if layer.name == 'layers' and layer.is_group():
        for child in layer:
            if child.is_group():
                output['layers'].append(animation_extract(child))
                continue

            output['layers'].append('''{
                name: '%s',
                position: { x: %s, y: %s, z: %s },
                content: %s,
                width: %s,
            },''' % (
                child.name,
                child.left,
                child.top,
                child.top + child.height,
                basic_extract(child),
                child.width,
                )
            )

    if layer.name == 'zones' and layer.is_group():
        for child in layer:
            content = block_extract(child)
            output['zones'].append('''{
                name: '%s',
                content: %s,
            },''' % (child.name, content))
            

    if layer.name not in ['fg', 'bg', 'block']: continue

    if not layer.topil(): continue

    if layer.name == 'block':
        output['block'] = block_extract(layer)

    if layer.name == 'bg':
       output['bg'] = basic_extract(layer)

    if layer.name == 'fg':
        output['layers'].append('''{
            name: 'foreground',
            position: { x: %s, y: %s, z: Infinity },
            content: %s,
            width: %s,
        },''' % (layer.left, layer.top, basic_extract(layer), layer.width))



print('''const {name}art = {{
    bg: {bg},
    foot_block: {block},
    layers: [{layers}],
    zones: [{zones}],
}}

export default {name}art'''.format(
    name=name,
    bg=output['bg'],
    block=output['block'],
    layers=''.join(output['layers']),
    zones=''.join(output['zones']),
))

