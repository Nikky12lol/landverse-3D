import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Grid, Html, OrbitControls } from '@react-three/drei';
import type { Building, FloorInfo, InfraItem, Parcel } from '../../types';

/* ---------- helpers ---------- */

export function colorForType(t?: string): string {
  const s = (t || '').toLowerCase();
  if (s.includes('commercial') || s.includes('tower')) return '#f0abfc';
  if (s.includes('mixed')) return '#c4b5fd';
  if (s.includes('low')) return '#6ee7b7';
  if (s.includes('mid')) return '#67e8f9';
  return '#22d3ee';
}

function hash(n: number): number {
  let x = (n * 2654435761) % 4294967296;
  x ^= x >> 15;
  x = (x * 2246822519) % 4294967296;
  return Math.abs(x);
}

function footprintShape(fp: any, w: number, d: number): THREE.Shape | null {
  if (!Array.isArray(fp) || fp.length < 3) return null;
  try {
    const shape = new THREE.Shape();
    fp.forEach((p: any, i: number) => {
      const x = (Number(p[0]) - 0.5) * w;
      const y = (Number(p[1]) - 0.5) * d;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return shape;
  } catch {
    return null;
  }
}

const INFRA_COLORS: Record<string, string> = {
  'Water Pipeline': '#38bdf8',
  Sewer: '#a3a380',
  'Electric Cable': '#facc15',
  'Metro Tunnel': '#f472b6',
  'Fiber Cable': '#34d399',
};

/* ---------- building mesh ---------- */

function BuildingMesh({
  building,
  position,
  selected,
  exploded,
  drill,
  onSelect,
}: {
  building: Building;
  position: [number, number, number];
  selected: boolean;
  exploded: number;
  drill: boolean;
  onSelect: (id: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const hgt = Math.min(9, Math.max(0.7, (building.height || 12) / 12));
  const nFloors = Math.min(30, Math.max(1, building.floors || Math.max(1, Math.round((building.height || 12) / 3.4))));
  const hh = hash(building.id);
  const w = 1.7 + ((hh % 100) / 100) * 1.5;
  const d = 1.7 + (((hh >> 3) % 100) / 100) * 1.5;
  const color = colorForType(building.building_type);

  const extrude = useMemo(() => {
    const shape = footprintShape(building.footprint, w, d);
    if (!shape) return null;
    const geo = new THREE.ExtrudeGeometry(shape, { depth: hgt, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, hgt, 0);
    return geo;
  }, [building.footprint, w, d, hgt]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const target = selected ? 1.06 + Math.sin(t * 2.2) * 0.012 : hover ? 1.03 : 1;
    group.current.scale.lerp(new THREE.Vector3(target, 1, target), 0.12);
  });

  const explodeGap = exploded * 1.6;
  const showSlabs = drill || selected || exploded > 0.05;
  const slabCount = Math.min(nFloors, 16);
  const slabH = hgt / nFloors;

  return (
    <group position={position}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(building.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {extrude ? (
          <mesh geometry={extrude} position={[0, 0, 0]}>
            <meshStandardMaterial
              color={selected ? '#ffffff' : color}
              emissive={selected ? color : '#000000'}
              emissiveIntensity={selected ? 0.55 : hover ? 0.25 : 0.08}
              transparent
              opacity={0.94}
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>
        ) : (
          <mesh position={[0, hgt / 2, 0]}>
            <boxGeometry args={[w, hgt, d]} />
            <meshStandardMaterial
              color={selected ? '#ffffff' : color}
              emissive={selected ? color : '#000000'}
              emissiveIntensity={selected ? 0.55 : hover ? 0.25 : 0.08}
              transparent
              opacity={0.92}
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>
        )}
        {/* floor edge lines */}
        {Array.from({ length: Math.min(nFloors, 24) }).map((_, i) => (
          <mesh key={i} position={[0, ((i + 1) / Math.min(nFloors, 24)) * hgt + (showSlabs ? explodeGap * ((i + 1) / 24) : 0), 0]}>
            <boxGeometry args={[w * 1.002, 0.02, d * 1.002]} />
            <meshBasicMaterial color={selected ? '#ffffff' : '#0a0a0f'} transparent opacity={0.55} />
          </mesh>
        ))}
        {/* exploded floor slabs */}
        {showSlabs &&
          Array.from({ length: slabCount }).map((_, i) => (
            <mesh key={`s${i}`} position={[0, i * slabH + (i + 1) * (explodeGap / Math.max(1, slabCount)) + slabH / 2, 0]}>
              <boxGeometry args={[w * 1.04, 0.05, d * 1.04]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.5} />
            </mesh>
          ))}
        {/* rooftop beacon */}
        <mesh position={[0, hgt + 0.25 + (showSlabs ? explodeGap : 0), 0]}>
          <octahedronGeometry args={[0.14]} />
          <meshStandardMaterial color="#ff5470" emissive="#ff5470" emissiveIntensity={1.6} />
        </mesh>
        {(selected || hover) && (
          <Html distanceFactor={22} position={[0, hgt + 1 + (showSlabs ? explodeGap : 0), 0]} center>
            <div
              style={{
                background: 'rgba(8,12,20,0.92)',
                border: `1px solid ${color}`,
                borderRadius: 10,
                padding: '6px 10px',
                fontSize: 11,
                whiteSpace: 'nowrap',
                color: '#fff',
              }}
            >
              <b>{building.building_code}</b> · {building.height ?? '?'} m · {building.floors ?? '?'} fl
              <br />
              <span style={{ color }}>{building.building_type || 'Unclassified'}</span> · AI {building.ai_confidence ?? '?'}%
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

/* ---------- parcel pad ---------- */

function ParcelPad({ index, parcel, count }: { index: number; parcel?: Parcel; count: number }) {
  const cols = 3;
  const gx = (index % cols - 1) * 16;
  const gz = (Math.floor(index / cols) - 0.5) * 16;
  return (
    <group position={[gx, 0, gz]}>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[12, 0.12, 12]} />
        <meshStandardMaterial color="#141a2e" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.6, 11.6]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.05} />
      </mesh>
      <Html distanceFactor={34} position={[0, 0.25, -5.4]} center>
        <div
          style={{
            fontSize: 11,
            color: '#9be9ff',
            background: 'rgba(10,14,24,0.85)',
            border: '1px solid rgba(0,255,255,0.3)',
            padding: '3px 9px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {parcel?.parcel_number || `ZONE-${index + 1}`} · {count} bldg
        </div>
      </Html>
    </group>
  );
}

/* ---------- underground ---------- */

function InfraPipes({ items, visible }: { items: InfraItem[]; visible: boolean }) {
  if (!visible) return null;
  const types = useMemo(() => [...new Set(items.map((i) => i.type || 'Utility'))], [items]);
  return (
    <group>
      {types.map((t, ti) =>
        (items.filter((i) => (i.type || 'Utility') === t) || []).map((infra, idx) => {
          const depth = Math.min(6, Math.max(0.6, (infra.depth || 5) / 6));
          const color = INFRA_COLORS[infra.type || ''] || '#94a3b8';
          return (
            <group key={`${t}-${idx}`} position={[-10 + idx * 2.4, -depth, 8 + ti * 2.2]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.22, 0.22, 22, 14]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} transparent opacity={0.9} />
              </mesh>
              <Html distanceFactor={30} position={[0, 0.6, 0]} center>
                <div style={{ fontSize: 10, color, background: 'rgba(8,10,18,0.9)', padding: '2px 8px', borderRadius: 999, border: `1px solid ${color}`, whiteSpace: 'nowrap' }}>
                  {infra.infrastructure_id} · {infra.type} · {infra.depth} m
                </div>
              </Html>
            </group>
          );
        })
      )}
      {/* soil slice */}
      <mesh position={[0, -3.4, 4]} receiveShadow>
        <boxGeometry args={[34, 0.25, 22]} />
        <meshStandardMaterial color="#1c1410" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/* ---------- main scene ---------- */

export default function CityScene({
  buildings,
  parcels = [],
  infra = [],
  selectedId = null,
  onSelect = () => {},
  showInfra = true,
  exploded = 0,
  drillHierarchy = null,
  height = 520,
}: {
  buildings: Building[];
  parcels?: Parcel[];
  infra?: InfraItem[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  showInfra?: boolean;
  exploded?: number;
  drillHierarchy?: { floors: FloorInfo[] } | null;
  height?: number;
}) {
  // group buildings by parcel for pad layout
  const groups = useMemo(() => {
    const map = new Map<string, Building[]>();
    buildings.forEach((b) => {
      const key = String(b.parcel_id ?? 'unassigned');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    const arr = [...map.entries()];
    // biggest parcel-group first for stable layout
    arr.sort((a, b) => b[1].length - a[1].length);
    return arr.slice(0, 6);
  }, [buildings]);

  const parcelIndexOf = (pid?: number | null) => {
    const p = parcels.findIndex((x) => x.id === pid);
    return p >= 0 ? p : 0;
  };

  return (
    <div style={{ height, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.18)', background: '#070912' }}>
      <Canvas shadows camera={{ position: [20, 16, 22], fov: 45 }} onPointerMissed={() => onSelect(-1)}>
        <color attach="background" args={['#070912']} />
        <fog attach="fog" args={['#070912', 40, 95]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[14, 20, 10]} intensity={1.15} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-12, 8, -10]} intensity={0.6} color="#00ffff" />
        <pointLight position={[12, 6, 12]} intensity={0.4} color="#f0abfc" />

        <Grid position={[0, -0.12, 0]} args={[60, 60]} cellColor="#123" sectionColor="#0ff" fadeDistance={70} fadeStrength={2} infiniteGrid />

        {/* parcel pads */}
        {groups.map(([key, list], gi) => {
          const first = list[0];
          const parcel = parcels.find((p) => p.id === first?.parcel_id);
          return <ParcelPad key={key} index={parcel ? parcelIndexOf(parcel.id) : gi} parcel={parcel} count={list.length} />;
        })}

        {/* buildings */}
        {groups.map(([key, list]) => {
          const first = list[0];
          const parcel = parcels.find((p) => p.id === first?.parcel_id);
          const pi = parcel ? parcelIndexOf(parcel.id) : 0;
          const cols = 3;
          const gx = (pi % cols - 1) * 16;
          const gz = (Math.floor(pi / cols) - 0.5) * 16;
          return list.slice(0, 8).map((b, bi) => {
            const lx = ((bi % 2) - 0.5) * 5.4;
            const lz = ((Math.floor(bi / 2) % 2) - 0.5) * 5.4;
            return (
              <BuildingMesh
                key={b.id}
                building={b}
                position={[gx + lx, 0, gz + lz]}
                selected={selectedId === b.id}
                exploded={exploded}
                drill={!!drillHierarchy && selectedId === b.id}
                onSelect={(id) => onSelect(id === -1 ? -1 : id)}
              />
            );
          });
        })}

        <InfraPipes items={infra} visible={showInfra} />

        {buildings.length === 0 && (
          <Html center position={[0, 3, 0]}>
            <div style={{ color: '#9be9ff', background: 'rgba(10,14,24,0.9)', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(0,255,255,0.3)', fontSize: 13 }}>
              No buildings yet — run AI Analysis or seed the database.
            </div>
          </Html>
        )}

        <ContactShadows position={[0, -0.1, 0]} opacity={0.55} scale={60} blur={2.4} far={8} color="#00e5ff" />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={6} maxDistance={70} />
      </Canvas>
    </div>
  );
}
