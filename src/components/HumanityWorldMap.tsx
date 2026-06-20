import { useEffect, useMemo, useRef, useState } from 'react';
import { Mercator } from '@visx/geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { COORD_MAP } from '@/lib/data';

type AtlasTopology = Topology<{ countries: GeometryCollection }>;

const ALIASES: Record<string, string> = {
  'United States': 'USA', 'United States of America': 'USA', 'États-Unis': 'USA',
  Sénégal: 'Senegal', Brésil: 'Brazil', Allemagne: 'Germany', Espagne: 'Spain',
  Italie: 'Italy', Japon: 'Japan', Chine: 'China', Inde: 'India', Australie: 'Australia',
  'Royaume-Uni': 'United Kingdom', 'Corée du Sud': 'South Korea', 'Pays-Bas': 'Netherlands',
};

export default function HumanityWorldMap({
  counts,
  selectedCountry,
  onSelect,
}: {
  counts: Record<string, number>;
  selectedCountry: string;
  onSelect: (country: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(480);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const countries = useMemo(() => {
    const atlas = worldAtlas as unknown as AtlasTopology;
    return (feature(atlas, atlas.objects.countries) as FeatureCollection<Geometry>).features;
  }, []);
  const height = Math.max(190, Math.min(270, width * 0.52));
  const points = Object.entries(counts).flatMap(([country, count]) => {
    const coords = COORD_MAP[ALIASES[country] || country];
    return coords ? [{ country, count, coords }] : [];
  });

  return (
    <div ref={ref} style={{ height, overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(0,255,209,.16)', background: 'radial-gradient(circle at center,rgba(8,69,91,.34),rgba(1,7,15,.98) 68%)' }}>
      <svg width={width} height={height} role="img" aria-label="Voices by country">
        <Mercator data={countries} scale={width / 6.25} translate={[width / 2, height / 1.7]}>
          {({ features, projection }) => (
            <>
              {features.map(({ path }, index) => <path key={index} d={path || ''} fill="rgba(22,65,82,.72)" stroke="rgba(84,182,195,.28)" strokeWidth=".5" />)}
              {points.map(({ country, count, coords }) => {
                const projected = projection([coords[1], coords[0]]);
                if (!projected) return null;
                const [x, y] = projected;
                const active = selectedCountry === country;
                return (
                  <g key={country} onClick={() => onSelect(active ? '' : country)} style={{ cursor: 'pointer' }}>
                    <circle cx={x} cy={y} r={Math.min(22, 8 + Math.sqrt(count) * 2)} fill="#00FFD1" opacity={active ? .34 : .14} />
                    <circle cx={x} cy={y} r={active ? 5.5 : 4} fill={active ? '#FFB347' : '#00FFD1'} stroke="#EFF6FF" strokeWidth=".8" />
                    <text x={x} y={y - 9} textAnchor="middle" fill="#EFF6FF" fontSize="7.5" style={{ paintOrder: 'stroke', stroke: '#020711', strokeWidth: 3 }}>{country} · {count}</text>
                  </g>
                );
              })}
            </>
          )}
        </Mercator>
      </svg>
    </div>
  );
}
