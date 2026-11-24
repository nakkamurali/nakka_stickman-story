import React, {useId} from "react";
import {C, FONT} from "../styles/palette";
import {rand} from "../motion/ease";

/*
 * Story props for history scenes: hats, a deed, a map, a stamp, coins, banknotes, a book,
 * a sailing ship, waves, palm trees, rain and a sky. All flat shapes in world units.
 */

const sid = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");

/** Top hat (use as a Look headExtra). */
export const TopHat: React.FC<{color?: string; band?: string}> = ({color = "#1B1C1F", band = "#5A2A2A"}) => (
  <g stroke={C.ink} strokeWidth={3} strokeLinejoin="round">
    <rect x={-25} y={-92} width={50} height={64} rx={4} fill={color} />
    <rect x={-25} y={-42} width={50} height={10} fill={band} />
    <rect x={-42} y={-34} width={84} height={9} rx={4} fill={color} />
  </g>
);

/** Two-pointed officer's hat with a gold cockade (use as a Look headExtra). */
export const Bicorne: React.FC = () => (
  <g stroke={C.ink} strokeWidth={3} strokeLinejoin="round">
    <path d="M -58 -22 Q -20 -86 0 -84 Q 20 -86 58 -22 Q 0 -44 -58 -22 Z" fill="#17181B" />
    <circle cx={0} cy={-52} r={9} fill={C.yellow} />
  </g>
);

/** A rolled deed, held upright in the hand (use as a Look handR). */
export const Deed = () => (
  <g stroke={C.ink} strokeWidth={2.5}>
    <rect x={-10} y={-64} width={20} height={62} rx={6} fill={C.bone} />
    <rect x={-12} y={-34} width={24} height={7} fill={C.red} />
  </g>
);

/** A small money bag, held in the hand (use as a Look handL or handR). */
export const MoneyBag = () => (
  <g stroke={C.ink} strokeWidth={2.5}>
    <path d="M -18 6 Q -26 40 0 42 Q 26 40 18 6 Q 0 -2 -18 6 Z" fill="#B89A5A" />
    <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill={C.ink} stroke="none">
      £
    </text>
  </g>
);

/** A coin with a pound sign. */
export const Coin: React.FC<{x: number; y: number; r?: number; opacity?: number}> = ({x, y, r = 22, opacity = 1}) => (
  <g opacity={opacity}>
    <circle cx={x} cy={y} r={r} fill={C.yellow} stroke={C.ink} strokeWidth={3} />
    <text x={x} y={y + r * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={r * 1.05} fill="#7A5E1E">
      £
    </text>
  </g>
);

/** A paper banknote. `title` on top, `value` large in the middle. */
export const Banknote: React.FC<{x: number; y: number; w?: number; color?: string; title: string; value: string; opacity?: number}> = ({
  x,
  y,
  w = 300,
  color = "#CFC7A8",
  title,
  value,
  opacity = 1,
}) => {
  const h = w * 0.5;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill={color} stroke={C.ink} strokeWidth={4} />
      <rect x={x - w / 2 + 12} y={y - h / 2 + 12} width={w - 24} height={h - 24} rx={6} fill="none" stroke={C.ink} strokeWidth={2} opacity={0.5} />
      <text x={x} y={y - h * 0.16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.08} fill={C.ink}>
        {title}
      </text>
      <text x={x} y={y + h * 0.3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.17} fill={C.ink}>
        {value}
      </text>
    </g>
  );
};

/**
 * A simple map of a coast with the made-up country marked. Drawn in local coordinates 0..w, 0..h
 * (use it as the children of a Board). `k` (0..1) reveals the border and the label.
 */
export const PoyaisMap: React.FC<{w: number; h: number; k?: number; city?: number}> = ({w, h, k = 1, city = 1}) => (
  <g>
    <rect x={0} y={0} width={w} height={h} fill="#7FB3C8" />
    {/* land: the coast runs from the top left to the bottom right; the sea is on the right */}
    <path
      d={`M 0 0 L ${w * 0.62} 0 Q ${w * 0.7} ${h * 0.18} ${w * 0.6} ${h * 0.3} Q ${w * 0.74} ${h * 0.42} ${w * 0.7} ${h * 0.58} Q ${w * 0.84} ${h * 0.72} ${w * 0.78} ${h} L 0 ${h} Z`}
      fill="#9DBB7A"
      stroke={C.ink}
      strokeWidth={3}
    />
    {/* a river */}
    <path d={`M ${w * 0.1} ${h * 0.2} Q ${w * 0.35} ${h * 0.35} ${w * 0.3} ${h * 0.55} T ${w * 0.66} ${h * 0.52}`} fill="none" stroke="#5E95AE" strokeWidth={6} />
    <g opacity={k}>
      <path
        d={`M ${w * 0.12} ${h * 0.4} L ${w * 0.48} ${h * 0.3} L ${w * 0.66} ${h * 0.45} L ${w * 0.7} ${h * 0.82} L ${w * 0.2} ${h * 0.86} Z`}
        fill={C.yellow}
        fillOpacity={0.35}
        stroke={C.red}
        strokeWidth={4}
        strokeDasharray="12 8"
      />
      <text x={w * 0.42} y={h * 0.66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.12} fill={C.ink}>
        POYAIS
      </text>
    </g>
    <g opacity={k * city}>
      <circle cx={w * 0.6} cy={h * 0.5} r={9} fill={C.red} stroke={C.ink} strokeWidth={2} />
      <text x={w * 0.6} y={h * 0.5 - 16} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={w * 0.05} fill={C.ink}>
        St Joseph
      </text>
    </g>
  </g>
);

/** A rubber stamp mark that slams in: k 0..1 (scale 1.8 -> 1, fades in). */
export const Stamp: React.FC<{x: number; y: number; text: string; k: number; color?: string; size?: number; rot?: number}> = ({
  x,
  y,
  text,
  k,
  color = C.red,
  size = 90,
  rot = -12,
}) => {
  if (k <= 0) return null;
  const s = 1 + (1 - k) * 0.8;
  const w = size * text.length * 0.72 + 60;
  const h = size * 1.4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={Math.min(1, k * 1.4)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="none" stroke={color} strokeWidth={10} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} letterSpacing={6}>
        {text}
      </text>
    </g>
  );
};

/** A closed book standing upright, with a title on the cover. */
export const Book: React.FC<{x: number; y: number; w?: number; h?: number; title: string[]; opacity?: number}> = ({x, y, w = 260, h = 360, title, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x - w / 2 + 14} y={y - h / 2 + 10} width={w} height={h} rx={8} fill="#E2D9BF" stroke={C.ink} strokeWidth={3} />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8} fill="#6B3B2A" stroke={C.ink} strokeWidth={4} />
    <rect x={x - w / 2 + 18} y={y - h / 2 + 18} width={w - 36} height={h - 36} rx={4} fill="none" stroke={C.yellow} strokeWidth={3} />
    {title.map((line, i) => (
      <text key={i} x={x} y={y - h * 0.18 + i * h * 0.13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={w * 0.11} fill={C.yellow}>
        {line}
      </text>
    ))}
  </g>
);

/** Sky gradient filling a rectangle. */
export const Sky: React.FC<{x0: number; x1: number; y0: number; y1: number; top: string; bottom: string}> = ({x0, x1, y0, y1, top, bottom}) => {
  const id = "s" + sid(useId());
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={`url(#${id})`} />
    </g>
  );
};

/** A band of sea from y down to y + depth, with a moving wavy top edge. */
export const Waves: React.FC<{x0: number; x1: number; y: number; t: number; depth?: number; color?: string; amp?: number; speed?: number; phase?: number}> = ({
  x0,
  x1,
  y,
  t,
  depth = 900,
  color = "#1F4E66",
  amp = 12,
  speed = 1.6,
  phase = 0,
}) => {
  const step = 40;
  let d = `M ${x0} ${y + depth} L ${x0} ${y}`;
  for (let x = x0; x <= x1; x += step) {
    d += ` L ${x} ${y + Math.sin(x * 0.012 + t * speed + phase) * amp}`;
  }
  d += ` L ${x1} ${y + depth} Z`;
  return <path d={d} fill={color} stroke={C.ink} strokeWidth={3} />;
};

/** A small two-masted sailing ship. (x, y) is the waterline centre; rock is the tilt in degrees. */
export const Ship: React.FC<{x: number; y: number; scale?: number; rock?: number; facing?: 1 | -1}> = ({x, y, scale = 1, rock = 0, facing = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rock}) scale(${scale * facing} ${scale})`} stroke={C.ink} strokeWidth={3} strokeLinejoin="round">
    <path d="M -150 -40 L 160 -40 L 120 20 L -120 20 Z" fill={C.wood} />
    <rect x={-150} y={-52} width={300} height={14} fill={C.woodDark} />
    <line x1={-50} y1={-40} x2={-50} y2={-300} strokeWidth={7} />
    <line x1={60} y1={-40} x2={60} y2={-260} strokeWidth={7} />
    <path d="M -50 -290 Q 0 -230 -50 -170 L -120 -170 Q -80 -230 -120 -290 Z" fill={C.bone} />
    <path d="M -50 -160 Q 4 -110 -50 -60 L -130 -60 Q -86 -110 -130 -160 Z" fill={C.bone} />
    <path d="M 60 -250 Q 106 -200 60 -150 L -4 -150 Q 32 -200 -4 -250 Z" fill={C.bone} />
    <path d="M 60 -300 L 100 -290 L 60 -278 Z" fill={C.red} />
  </g>
);

/** A palm tree with its base at (x, y). sway is in degrees. */
export const Palm: React.FC<{x: number; y: number; h?: number; sway?: number; color?: string}> = ({x, y, h = 420, sway = 0, color = "#2F5A35"}) => (
  <g transform={`translate(${x} ${y}) rotate(${sway})`} stroke={C.ink} strokeWidth={3} strokeLinejoin="round">
    <path d={`M -16 0 Q 10 ${-h * 0.5} 4 ${-h} L 18 ${-h} Q 26 ${-h * 0.5} 16 0 Z`} fill="#5B4632" />
    {[-150, -110, -60, -20, 25].map((a, i) => (
      <g key={i} transform={`translate(11 ${-h}) rotate(${a})`}>
        <path d="M 0 0 Q 70 -40 150 10 Q 70 -10 0 0 Z" fill={color} />
      </g>
    ))}
  </g>
);

/** Falling rain lines inside a box, deterministic for a given t. */
export const Rain: React.FC<{t: number; x0: number; x1: number; y0: number; y1: number; count?: number; opacity?: number}> = ({t, x0, x1, y0, y1, count = 70, opacity = 0.45}) => {
  const span = y1 - y0;
  return (
    <g stroke="#9FB4C4" strokeWidth={3} strokeLinecap="round" opacity={opacity}>
      {Array.from({length: count}, (_, i) => {
        const x = x0 + rand(i + 11) * (x1 - x0);
        const y = y0 + ((rand(i + 51) * span + t * (900 + rand(i + 91) * 300)) % span);
        return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 38} />;
      })}
    </g>
  );
};

/** Dashed outline of a city that is not there (fades with opacity). */
export const GhostCity: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity} fill="none" stroke={C.bone} strokeWidth={4} strokeDasharray="14 10">
    <rect x={-300} y={-220} width={140} height={220} />
    <rect x={-140} y={-320} width={170} height={320} />
    <path d="M -140 -320 L -55 -400 L 30 -320" />
    <rect x={50} y={-260} width={120} height={260} />
    <path d="M 190 0 L 190 -180 Q 240 -260 290 -180 L 290 0" />
  </g>
);
