def compress(farry):
    _iter = 0
    _last = None
    roll = []
    compressed = []
    def _apply_roll(roll, pixel):
        compressed.append('%s-%s' % (pixel, len(roll)))
        
    for pixel in farry:
        if _last is None:
            _last = pixel

        if pixel != _last:
            _apply_roll(roll, _last)
            roll = []

        roll.append(_iter)

        if _iter == len(farry)-1:
            _apply_roll(roll, pixel)

        _last = pixel
        _iter += 1

    return compressed


