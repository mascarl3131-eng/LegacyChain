import { useEffect, useMemo, useRef, useState } from 'react';
import { Mercator } from '@visx/geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { CHART_COLORS, COORD_MAP } from '@/lib/data';
import type { OriginRow } from '@/lib/data';
import worldAtlas from 'world-atlas/countries-110m.json';

type AtlasTopology = Topology<{ countries: GeometryCollection }>;

const COUNTRY_ALIASES: Record<string, string> = {
  sénégal: 'Senegal',
  senegal: 'Senegal',
  france: 'France',
  vietnam: 'Vietnam',
  viêt_nam: 'Vietnam',
  japon: 'Japan',
  allemagne: 'Germany',
  espagne: 'Spain',
  italie: 'Italy',
  royaume_uni: 'United Kingdom',
  états_unis: 'USA',
  etats_unis: 'USA',
  brésil: 'Brazil',
  bresil: 'Brazil',
  chine: 'China',
  inde: 'India',
  australie: 'Australia',
  pays_bas: 'Netherlands',
  corée_du_sud: 'South Korea',
  coree_du_sud: 'South Korea',
};

function resolveCoordinates(country: string) {
  const direct = COORD_MAP[country];
  if (direct) return direct;
  const key = country.trim().toLocaleLowerCase().replaceAll(' ', '_');
  return COORD_MAP[COUNTRY_ALIASES[key]];
}

export default function DnaWorldMap({ origins }: { origins: OriginRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(480);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, entry.contentRect.width));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const countries = useMemo(() => {
    const atlas = worldAtlas as unknown as AtlasTopology;
    const collection = feature(atlas, atlas.objects.countries) as FeatureCollection<Geometry>;
    return collection.features;
  }, []);

  const height = Math.max(230, Math.min(320, width * 0.58));
  const points = origins
    .map((origin, index) => ({ origin, index, coords: resolveCoordinates(origin.c) }))
    .filter((point): point is { origin: OriginRow; index: number; coords: [number, number] } => Boolean(point.coords && point.origin.p > 0));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: 12, background: 'radial-gradient(circle at 50% 45%,rgba(10,77,105,.34),rgba(1,8,18,.98) 67%)', border: '1px solid rgba(0,255,209,0.18)' }}>
      <svg width={width} height={height} role="img" aria-label="World ancestry map">
        <Mercator
          data={countries}
          scale={(width / 6.3) * zoom}
          translate={[width / 2, height / 1.72]}
        >
          {({ features, projection }) => (
            <>
              <rect width={width} height={height} fill="transparent" />
              <g>
                {features.map(({ path }, index) => (
                  <path
                    key={index}
                    d={path || ''}
                    fill="rgba(18,66,86,0.72)"
                    stroke="rgba(89,190,204,0.35)"
                    strokeWidth={0.55}
                  />
                ))}
              </g>
              {points.map(({ origin, index, coords }) => {
                const projected = projection([coords[1], coords[0]]);
                if (!projected) return null;
                const [x, y] = projected;
                const color = CHART_COLORS[index % CHART_COLORS.length];
                const active = selected === index;
                return (
                  <g key={`${origin.c}-${index}`} onClick={() => setSelected(active ? null : index)} style={{ cursor: 'pointer' }}>
                    <circle cx={x} cy={y} r={Math.max(12, origin.p / 2.8)} fill={color} opacity={0.1} />
                    <circle cx={x} cy={y} r={active ? 6 : 4.5} fill={color} stroke="#EFF6FF" strokeWidth={active ? 1.5 : 0.7} />
                    <text x={x} y={y - 10} textAnchor="middle" fill="#EFF6FF" fontSize={active ? 10 : 8} fontWeight={700} style={{ paintOrder: 'stroke', stroke: '#020711', strokeWidth: 3 }}>
                      {origin.c} · {origin.p}%
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </Mercator>
      </svg>

      <div className="desktop-zoom-controls" style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 }}>
        <button type="button" onClick={() => setZoom(value => Math.min(1.7, value + 0.15))} className="btn-sec" style={{ width: 32, height: 32, padding: 0, fontSize: '0.9rem' }} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => setZoom(value => Math.max(0.85, value - 0.15))} className="btn-sec" style={{ width: 32, height: 32, padding: 0, fontSize: '0.9rem' }} aria-label="Zoom out">−</button>
        <button type="button" onClick={() => setZoom(1)} className="btn-sec" style={{ height: 32, padding: '0 0.55rem', fontSize: '0.5rem' }} aria-label="Reset zoom">100%</button>
      </div>
    </div>
  );
}
