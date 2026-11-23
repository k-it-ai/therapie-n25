#!/usr/bin/env python3
"""Render the static location map (src/assets/map.svg) from OpenStreetMap data.

Usage:
  1. Download the area once (about 13 MB):
     curl -o map.osm "https://api.openstreetmap.org/api/0.6/map?bbox=11.5225,48.1505,11.5385,48.1615"
  2. python3 scripts/build-map.py map.osm src/assets/map.svg

The map shows streets, parks, street names, the practice pin, the U-Bahn at Rotkreuzplatz and the
tram 12 / bus 144 stop Neuhausen (leave the stop out with --no-stops).
Map data © OpenStreetMap contributors (ODbL) – the page shows this credit next to the map.
"""
import math
import sys
import xml.etree.ElementTree as ET

PRACTICE = (48.1565809, 11.5303946)   # Nymphenburger Straße 191 (Nominatim)
UBAHN = (48.153423, 11.53312)         # Rotkreuzplatz (MVG station coordinates)
NEUHAUSEN = (48.156347, 11.531503)    # tram 12 / bus 144 stop (MVG station coordinates)
CENTER = ((PRACTICE[0] + UBAHN[0]) / 2 + 0.0004, (PRACTICE[1] + UBAHN[1]) / 2)
SIZE = 760                            # metres shown; 1 SVG unit = 1 metre
FONT = 15.5

STREET_WIDTH = {
    'primary': 20, 'secondary': 18, 'tertiary': 15, 'primary_link': 12, 'secondary_link': 12,
    'tertiary_link': 10, 'residential': 11, 'unclassified': 11, 'living_street': 10,
    'pedestrian': 10,
}
LABELLED = {'primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'living_street', 'pedestrian'}
GREEN = {('leisure', 'park'), ('landuse', 'grass'), ('leisure', 'garden'), ('landuse', 'recreation_ground'),
         ('leisure', 'playground'), ('landuse', 'meadow')}

COS = math.cos(math.radians(CENTER[0]))


def project(lat, lon):
    x = (lon - CENTER[1]) * 111320 * COS + SIZE / 2
    y = (CENTER[0] - lat) * 111320 + SIZE / 2
    return x, y


def fmt(points):
    return 'M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in points)


def length(points):
    return sum(math.dist(a, b) for a, b in zip(points, points[1:]))


def merge_chains(chains):
    """Join ways of the same street that share end points."""
    chains = [list(c) for c in chains]
    merged = True
    while merged:
        merged = False
        for i in range(len(chains)):
            for j in range(i + 1, len(chains)):
                a, b = chains[i], chains[j]
                if a[-1] == b[0]:
                    chains[i] = a + b[1:]
                elif a[-1] == b[-1]:
                    chains[i] = a + b[::-1][1:]
                elif a[0] == b[-1]:
                    chains[i] = b + a[1:]
                elif a[0] == b[0]:
                    chains[i] = b[::-1] + a[1:]
                else:
                    continue
                del chains[j]
                merged = True
                break
            if merged:
                break
    return chains


def straight_runs(points, max_turn=18):
    """Split a polyline wherever it turns more than max_turn degrees (labels look broken on bends)."""
    runs, cur = [], points[:2]
    for p in points[2:]:
        a, b = cur[-2], cur[-1]
        h1 = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        h2 = math.degrees(math.atan2(p[1] - b[1], p[0] - b[0]))
        turn = abs((h2 - h1 + 180) % 360 - 180)
        if turn > max_turn:
            runs.append(cur)
            cur = [b, p]
        else:
            cur.append(p)
    runs.append(cur)
    return runs


def point_at(run, dist):
    acc = 0
    for a, b in zip(run, run[1:]):
        seg = math.dist(a, b)
        if seg and acc + seg >= dist:
            t = (dist - acc) / seg
            return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        acc += seg
    return run[-1]


def inner_run(points, margin):
    """Longest run of consecutive points inside the visible area minus a margin."""
    best, cur = [], []
    for p in points:
        if margin <= p[0] <= SIZE - margin and margin <= p[1] <= SIZE - margin:
            cur.append(p)
        else:
            if length(cur) > length(best):
                best = cur
            cur = []
    return cur if length(cur) > length(best) else best


def main(src, dst, stops=True):
    root = ET.parse(src).getroot()
    nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in root.iter('node')}
    streets, greens = [], []
    for way in root.iter('way'):
        tags = {t.get('k'): t.get('v') for t in way.findall('tag')}
        refs = [nd.get('ref') for nd in way.findall('nd') if nd.get('ref') in nodes]
        if len(refs) < 2:
            continue
        hw = tags.get('highway')
        if hw in STREET_WIDTH and tags.get('area') != 'yes' and tags.get('tunnel') != 'yes':
            streets.append((hw, tags.get('name'), refs))
        elif any((k, tags.get(k)) in GREEN for k in ('leisure', 'landuse')) and refs[0] == refs[-1]:
            greens.append(refs)

    pts = lambda refs: [project(*nodes[r]) for r in refs]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 {SIZE} {SIZE}" preserveAspectRatio="xMidYMid slice">',
        '<style>.map-g{fill:#e8e7da}.map-s{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round}'
        f'.map-l{{font:400 {FONT}px "Jost Variable","Jost",system-ui,sans-serif;fill:#8a8f94;letter-spacing:.02em}}'
        '.map-p{font:500 17px "Jost Variable","Jost",system-ui,sans-serif;fill:#2e4a5f;letter-spacing:.04em}</style>',
        f'<rect width="{SIZE}" height="{SIZE}" fill="#f3eee8"/>',
    ]
    for refs in greens:
        out.append(f'<path class="map-g" d="{fmt(pts(refs))}Z"/>')
    # thin streets first, wide ones on top
    for hw, _, refs in sorted(streets, key=lambda s: STREET_WIDTH[s[0]]):
        out.append(f'<path class="map-s" stroke-width="{STREET_WIDTH[hw]}" d="{fmt(pts(refs))}"/>')

    # street names along the streets
    by_name = {}
    for hw, name, refs in streets:
        if name and hw in LABELLED:
            by_name.setdefault(name, []).append(refs)
    pin = project(*PRACTICE)
    stop = project(*NEUHAUSEN)
    placed, defs, labels = [], [], []
    for i, (name, chains) in enumerate(sorted(by_name.items())):
        need = len(name) * FONT * 0.56 + 30
        runs = [r for c in merge_chains(chains) for r in straight_runs(inner_run(pts(c), 24)) if length(r) >= need]
        done = False
        for run in sorted(runs, key=length, reverse=True):
            if run[-1][0] < run[0][0]:
                run = run[::-1]
            total = length(run)
            # try the middle first, then positions further along, away from the pin and other labels
            for frac in (0.5, 0.35, 0.65, 0.25, 0.75):
                pos = total * frac
                if pos - need / 2 < 0 or pos + need / 2 > total:
                    continue
                mid = point_at(run, pos)
                if math.dist(mid, pin) < 95 or (stops and math.dist(mid, stop) < 90) or any(math.dist(mid, p) < 120 for p in placed):
                    continue
                placed.append(mid)
                defs.append(f'<path id="map-s{i}" d="{fmt(run)}"/>')
                labels.append(f'<text class="map-l" dy="5"><textPath href="#map-s{i}" startOffset="{pos:.0f}" text-anchor="middle">{name}</textPath></text>')
                done = True
                break
            if done:
                break
    out.append('<defs>' + ''.join(defs) + '</defs>')
    out.extend(labels)

    # U-Bahn Rotkreuzplatz
    ux, uy = project(*UBAHN)
    out.append(f'<g transform="translate({ux:.1f},{uy:.1f})"><rect x="-13" y="-13" width="26" height="26" rx="3" fill="#0065ae"/>'
               '<text x="0" y="7.5" text-anchor="middle" style="font:700 19px system-ui,sans-serif;fill:#fff">U</text>'
               '<text class="map-p" x="20" y="6" style="font-weight:400;fill:#5d6a74">Rotkreuzplatz</text></g>')
    if stops:
        sx, sy = stop
        out.append(f'<g transform="translate({sx:.1f},{sy:.1f})" style="font:700 14px system-ui,sans-serif;fill:#fff">'
                   '<rect x="-13" y="-11" width="26" height="22" rx="3" fill="#c4161c"/>'
                   '<text x="0" y="5" text-anchor="middle">12</text>'
                   '<rect x="16" y="-11" width="36" height="22" rx="3" fill="#0d5c6b"/>'
                   '<text x="34" y="5" text-anchor="middle">144</text>'
                   '<text class="map-p" x="58" y="6" style="font-weight:400;fill:#5d6a74">Neuhausen</text></g>')
    # Practice pin
    px, py = pin
    out.append(f'<g transform="translate({px:.1f},{py:.1f})">'
               '<circle r="16" fill="#2e4a5f" opacity=".12"/>'
               '<path d="M0 0c-3-9-17-17-17-31a17 17 0 0 1 34 0c0 14-14 22-17 31z" fill="#2e4a5f"/>'
               '<circle cy="-31" r="6.5" fill="#f3eee8"/>'
               '<rect x="16" y="-58" width="128" height="30" rx="2" fill="#fffcf9"/>'
               '<text class="map-p" x="80" y="-37.5" text-anchor="middle">Therapie N25</text></g>')
    out.append('</svg>')
    svg = ''.join(out)
    open(dst, 'w', encoding='utf-8').write(svg)
    print(f'{dst}: {len(svg) // 1024} KB, {len(labels)} street labels')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], stops='--no-stops' not in sys.argv)
