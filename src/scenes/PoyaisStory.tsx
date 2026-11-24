import React from "react";
import {AbsoluteFill, Sequence, useCurrentFrame} from "remotion";
import {Camera2D, Cam, Layer} from "../camera/Camera2D";
import {CaptionCue, CaptionTrack} from "../captions/CaptionTrack";
import {Board, Desk, Floor, FLOOR, Glow, Label, Wall} from "../environment/Furniture";
import {
  Banknote,
  Bicorne,
  Book,
  Coin,
  Deed,
  GhostCity,
  MoneyBag,
  Palm,
  PoyaisMap,
  Rain,
  Ship,
  Sky,
  Stamp,
  TopHat,
  Waves,
} from "../environment/StoryProps";
import {Narration} from "../audio/Narration";
import {eOut, keys, keysObj, linear, noise, prog} from "../motion/ease";
import {CASUAL, SHIRT_ORANGE, ShortHair} from "../rig/looks";
import {idle, mix, point, STRIDE, walk} from "../rig/poses";
import {Look, Pose, Stickman} from "../rig/Stickman";
import {C, FPS} from "../styles/palette";

/*
 * THE MAN WHO SOLD A COUNTRY THAT DIDN'T EXIST (62 s, ten scenes)
 * Gregor MacGregor and the Poyais scheme, London and the Mosquito Coast, 1821-1823.
 *
 *   Hook      0-200     A buyer with a deed, a map of Poyais, a FAKE stamp.
 *   Who       200-410   MacGregor arrives in London, "Cazique of Poyais".
 *   Pitch     410-680   The promises on a board, then the guidebook.
 *   Sell      680-950   Investors pay; the £200,000 loan; pounds swapped for Poyais dollars.
 *   Voyage    950-1130  Ships sail with about 250 settlers.
 *   Arrive    1130-1310 No city, only jungle and swamp.
 *   Tragedy   1310-1520 Rain and fever; a rescue ship to Belize.
 *   Paris     1520-1640 The second attempt in France; acquitted.
 *   Caracas   1640-1730 He dies in Venezuela, 1845.
 *   Finale    1730-1860 The land stays, the country fades away.
 *
 * Pass `narration` (e.g. "audio/poyais.mp3" in public/) to add a voice, then retime the scenes to it.
 */

const S = {
  hook: {from: 0, len: 200},
  who: {from: 200, len: 210},
  pitch: {from: 410, len: 270},
  sell: {from: 680, len: 270},
  voyage: {from: 950, len: 180},
  arrive: {from: 1130, len: 180},
  tragedy: {from: 1310, len: 210},
  paris: {from: 1520, len: 120},
  caracas: {from: 1640, len: 90},
  finale: {from: 1730, len: 130},
};
export const POYAIS_FRAMES = 1860;

const SCALE = 1.5;

const CAPTIONS: CaptionCue[] = [
  {from: 8, to: 100, text: "Imagine buying land\nin a country…"},
  {from: 100, to: 196, text: "…only to discover the\ncountry itself was fake."},
  {from: 210, to: 305, text: "London, 1821. A Scottish\nsoldier comes home."},
  {from: 305, to: 405, text: "Gregor MacGregor says he now\nrules a country: Poyais."},
  {from: 420, to: 545, text: "He promised fertile soil, gold\nin the rivers and a capital city."},
  {from: 545, to: 675, text: "There was even a printed\nguidebook to the country."},
  {from: 690, to: 815, text: "People bought land, army ranks\nand £200,000 of Poyais bonds."},
  {from: 815, to: 945, text: "Settlers swapped real pounds\nfor Poyais dollars."},
  {from: 960, to: 1125, text: "1822–23: two ships carry about\n250 settlers to Poyais."},
  {from: 1140, to: 1305, text: "They found no city.\nJust jungle and swamp."},
  {from: 1320, to: 1420, text: "Fever and hunger spread.\nMost of the settlers died."},
  {from: 1420, to: 1515, text: "Survivors were rescued\nand taken to Belize."},
  {from: 1530, to: 1635, text: "He tried the same scam in France.\nIn court, he was acquitted."},
  {from: 1645, to: 1725, text: "He died in Venezuela in 1845."},
  {from: 1740, to: 1852, text: "The land was real.\nThe country never existed."},
];

/* ---------- characters ---------- */

const MACGREGOR: Look = {
  top: "#D8D2C0",
  sleeve: "#8E2A22",
  coat: "#8E2A22",
  belt: C.yellow,
  headExtra: (
    <g>
      <ShortHair color="#5A3A22" />
      <Bicorne />
    </g>
  ),
};

const INVESTOR: Look = {
  top: "#3B3F46",
  sleeve: "#2A2C31",
  coat: "#2A2C31",
  tie: "#5A2A2A",
  headExtra: <TopHat />,
  handL: Deed,
};

const INVESTOR_BAG: Look = {...INVESTOR, top: "#4A3E33", sleeve: "#3A2E26", coat: "#3A2E26", headExtra: <TopHat color="#3A2E26" band="#1B1C1F" />, handL: undefined, handR: MoneyBag};
const INVESTOR_BAG2: Look = {...INVESTOR_BAG, top: "#33404A", sleeve: "#26323C", coat: "#26323C", headExtra: <TopHat color="#26323C" />};
const SETTLER_A: Look = {...CASUAL, top: "#7A6A4A", sleeve: "#7A6A4A"};
const SETTLER_B: Look = SHIRT_ORANGE;
const SETTLER_C: Look = {...CASUAL, top: "#5A6E7A", sleeve: "#5A6E7A", headExtra: <ShortHair color="#8A6A3A" />};

/** A tired, sad stance: head down, slight slump. */
const slump = (t: number, seed: number): Pose => ({...idle(t, seed), headTilt: 14, lean: 6, shL: -2, shR: 2, lookY: 0.6});

/* ---------- shared pieces ---------- */

/** A short fade from black at the start of each scene. */
const FadeIn: React.FC<{len?: number}> = ({len = 8}) => {
  const f = useCurrentFrame();
  const o = 1 - prog(f, 0, len, linear);
  return o > 0 ? <AbsoluteFill style={{backgroundColor: "#000", opacity: o}} /> : null;
};

/** Back wall and floor of an indoor room. */
const Room: React.FC<{color?: string; windows?: boolean}> = ({color, windows}) => (
  <>
    <Layer depth={0.5}>
      <Wall x0={-1800} x1={1800} y0={-1400} y1={FLOOR} color={color} />
      {windows
        ? [-520, 0, 520].map((x) => (
            <g key={x}>
              <rect x={x - 90} y={-560} width={180} height={300} fill="#3A4656" stroke={C.wallLine} strokeWidth={14} />
              <line x1={x} y1={-560} x2={x} y2={-260} stroke={C.wallLine} strokeWidth={8} />
              <line x1={x - 90} y1={-410} x2={x + 90} y2={-410} stroke={C.wallLine} strokeWidth={8} />
            </g>
          ))
        : null}
    </Layer>
  </>
);

/** Small heading near the top of the frame (place and year). */
const Heading: React.FC<{text: string; y: number; opacity?: number}> = ({text, y, opacity = 1}) => (
  <g opacity={opacity}>
    <Label x={0} y={y} text={text} size={50} color={C.yellow} />
  </g>
);

const shake = (f: number, at: number, len = 14, amt = 10) => {
  const k = f >= at && f < at + len ? 1 - (f - at) / len : 0;
  return {dx: Math.sin(f * 2.7) * amt * k, dy: Math.cos(f * 3.1) * amt * k};
};

const money = (n: number) => "£" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* ---------- scenes ---------- */

/** 1. Hook: a happy buyer, a map of Poyais, then a FAKE stamp. */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const STAMP = 104;
  const sh = shake(f, STAMP + 8);
  const c = keysObj(f, [
    [0, {x: -30, y: 70, zoom: 1.05, rot: 0}],
    [S.hook.len, {x: -30, y: 40, zoom: 1.2, rot: 0}],
  ]);
  const cam: Cam = {...c, x: c.x + sh.dx, y: c.y + sh.dy};
  const mapK = prog(f, 12, 40, eOut);
  const pointK = prog(f, 26, 46) * (1 - prog(f, 118, 136));
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room />
        <Layer depth={0.5}>
          <Heading text="CENTRAL AMERICA · 1820s" y={-560} opacity={prog(f, 4, 24)} />
        </Layer>
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <Board x={-170} y={FLOOR - 110} w={440} h={420}>
            <PoyaisMap w={440} h={420} k={mapK} />
          </Board>
          <Stamp x={-170} y={100} text="FAKE" k={prog(f, STAMP, STAMP + 8, eOut)} size={110} />
          <Stickman
            x={250}
            y={FLOOR}
            scale={SCALE}
            facing={-1}
            pose={mix(point(idle(t, 2), pointK, 80), {...idle(t, 2), lean: -8, bob: -6}, prog(f, STAMP + 8, STAMP + 14))}
            look={INVESTOR}
            expr={f < STAMP + 8 ? "happy" : "surprised"}
          />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 2. MacGregor walks into a London room; his self-given title appears. */
const Who: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const x = keys(f, [[0, -760], [78, -140]], linear);
  const phase = (x + 760) / (STRIDE * SCALE);
  const pose = mix(walk(phase, t, 1), idle(t, 1), prog(f, 74, 86));
  const cardK = prog(f, 100, 122, eOut);
  const cam = keysObj(f, [
    [0, {x: -60, y: 90, zoom: 1.0, rot: 0}],
    [90, {x: 40, y: 90, zoom: 1.05, rot: 0}],
    [S.who.len, {x: 60, y: 60, zoom: 1.12, rot: 0}],
  ]);
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room windows />
        <Layer depth={0.5}>
          <Heading text="LONDON · 1821" y={-650} opacity={prog(f, 4, 24)} />
        </Layer>
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <g opacity={cardK} transform={`translate(230 ${-300 + (1 - cardK) * 30})`}>
            <rect x={-260} y={-110} width={520} height={210} rx={14} fill={C.charcoal} stroke={C.yellow} strokeWidth={6} />
            <Label x={0} y={-30} text="GREGOR MacGREGOR" size={44} color={C.bone} />
            <Label x={0} y={40} text="“Cazique of Poyais”" size={40} color={C.yellow} />
          </g>
          <Stickman x={x} y={FLOOR} scale={SCALE} facing={1} pose={pose} look={MACGREGOR} expr={f < 95 ? "determined" : "smug"} />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

const PitchIcon: React.FC<{kind: number; x: number; y: number}> = ({kind, x, y}) => {
  if (kind === 0)
    return (
      <g stroke={C.ink} strokeWidth={3}>
        <ellipse cx={x} cy={y + 14} rx={28} ry={10} fill="#6B4A2E" />
        <path d={`M ${x} ${y + 10} Q ${x - 4} ${y - 14} ${x} ${y - 26}`} fill="none" stroke="#2F6A35" strokeWidth={5} />
        <path d={`M ${x} ${y - 8} Q ${x - 26} ${y - 26} ${x - 20} ${y - 2} Z`} fill="#4E9A4A" />
        <path d={`M ${x} ${y - 16} Q ${x + 26} ${y - 34} ${x + 20} ${y - 8} Z`} fill="#4E9A4A" />
      </g>
    );
  if (kind === 1) return <Coin x={x} y={y} r={28} />;
  return (
    <g stroke={C.ink} strokeWidth={3} fill="#C9B48A">
      <rect x={x - 30} y={y - 16} width={60} height={40} />
      <path d={`M ${x - 36} ${y - 16} L ${x} ${y - 40} L ${x + 36} ${y - 16} Z`} />
      <rect x={x - 6} y={y + 4} width={12} height={20} fill={C.ink} />
    </g>
  );
};

/** 3. The pitch: three promises on a board, then the guidebook. */
const Pitch: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const items = ["Fertile soil", "Gold in the rivers", "A capital city"];
  const listK = 1 - prog(f, 132, 146);
  const bookK = prog(f, 142, 160, eOut);
  const pointK = prog(f, 14, 34);
  const cam = keysObj(f, [
    [0, {x: 50, y: 60, zoom: 1.0, rot: 0}],
    [S.pitch.len, {x: 80, y: 40, zoom: 1.12, rot: 0}],
  ]);
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room windows />
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <Board x={180} y={FLOOR - 120} w={500} h={560}>
            <g opacity={listK}>
              <Label x={250} y={80} text="POYAIS" size={56} color={C.red} />
              {items.map((label, i) => {
                const k = prog(f, 18 + i * 34, 32 + i * 34, eOut);
                return (
                  <g key={label} opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
                    <PitchIcon kind={i} x={70} y={190 + i * 120} />
                    <Label x={125} y={204 + i * 120} text={label} size={38} color={C.ink} anchor="start" />
                  </g>
                );
              })}
            </g>
            <g transform={`translate(250 ${290 + (1 - bookK) * 40})`}>
              <Book x={0} y={0} w={250} h={350} title={["SKETCH OF", "THE MOSQUITO", "SHORE", "1822"]} opacity={bookK} />
            </g>
          </Board>
          <Stickman x={-290} y={FLOOR} scale={SCALE} facing={1} pose={point(idle(t, 3), pointK, 70)} look={MACGREGOR} expr="happy" />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 4. Selling: coins fly to MacGregor, the loan counter rises, pounds turn into Poyais dollars. */
const Sell: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const counterK = prog(f, 12, 110, eOut);
  const half1 = 1 - prog(f, 125, 138);
  const half2 = prog(f, 135, 150);
  const cam = keysObj(f, [
    [0, {x: -60, y: 20, zoom: 0.95, rot: 0}],
    [S.sell.len, {x: -60, y: 0, zoom: 1.0, rot: 0}],
  ]);
  const coins = [];
  for (let i = 0; i < 7; i++) {
    const s = 8 + i * 17;
    const k = prog(f, s, s + 22, linear);
    if (k <= 0 || k >= 1) continue;
    const cx = -230 + k * 480;
    const cy = 150 - Math.sin(k * Math.PI) * 220;
    coins.push(<Coin key={i} x={cx} y={cy} r={20} />);
  }
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room windows />
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <g opacity={half1}>
            <Label x={0} y={-640} text="POYAIS LOAN · 1822" size={46} color={C.yellow} />
            <Label x={0} y={-500} text={money(200000 * counterK)} size={120} color={C.bone} />
          </g>
          <g opacity={half2}>
            <Banknote x={-215} y={-520} w={320} title="POUND STERLING" value="£1" />
            <path d="M -40 -520 L 40 -520 M 20 -540 L 42 -520 L 20 -500" stroke={C.bone} strokeWidth={8} fill="none" strokeLinecap="round" />
            <Banknote x={215} y={-520} w={320} color="#B7CDB0" title="POYAIS" value="1 DOLLAR" />
            <Stamp x={215} y={-375} text="WORTHLESS" k={prog(f, 205, 213, eOut)} size={40} rot={-4} />
          </g>
          <Stickman x={300} y={FLOOR} scale={SCALE} facing={-1} pose={idle(t, 4)} look={MACGREGOR} expr="smug" />
          <Desk x={300} w={300} />
          <Glow x={300} y={FLOOR - 160} r={160} color={C.yellow} opacity={0.15 * half1} />
          {coins}
          <Stickman x={-500} y={FLOOR} scale={SCALE} facing={1} pose={idle(t, 7)} look={INVESTOR_BAG2} expr="happy" />
          <Stickman x={-360} y={FLOOR} scale={SCALE} facing={1} pose={idle(t, 6)} look={INVESTOR} expr="happy" />
          <Stickman x={-220} y={FLOOR} scale={SCALE} facing={1} pose={point(idle(t, 5), prog(f, 4, 16) * half1, 70)} look={INVESTOR_BAG} expr="happy" />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 5. The voyage at night. */
const Voyage: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam: Cam = {x: 0, y: 0, zoom: 1, rot: 0};
  const sx = keys(f, [[0, -430], [S.voyage.len, 360]], linear);
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Layer depth={1}>
          <Sky x0={-800} x1={800} y0={-1100} y1={400} top="#0B1622" bottom="#35566A" />
          <Glow x={330} y={-560} r={260} color={C.bone} opacity={0.25} />
          <circle cx={330} cy={-560} r={60} fill={C.bone} opacity={0.9} />
          <Heading text="ATLANTIC · 1822–1823" y={-760} opacity={prog(f, 4, 24)} />
          <Waves x0={-800} x1={800} y={260} t={t} color="#24526A" phase={1.2} />
          <Ship x={sx} y={300 + Math.sin(t * 2.2) * 6} scale={0.95} rock={Math.sin(t * 1.8) * 4} />
          <Waves x0={-800} x1={800} y={330} t={t} color="#163646" speed={2.1} />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 6. Arrival: the settlers expect a city; there is only jungle. */
const Arrive: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const settlers = [
    {end: -400, look: SETTLER_A, seed: 11},
    {end: -250, look: SETTLER_B, seed: 12},
    {end: -100, look: SETTLER_C, seed: 13},
  ];
  const ghost = keys(f, [[0, 0], [20, 0.8], [85, 0.8], [125, 0]]);
  const cam = keysObj(f, [
    [0, {x: -40, y: 90, zoom: 1.0, rot: 0}],
    [S.arrive.len, {x: 0, y: 70, zoom: 1.08, rot: 0}],
  ]);
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t} background="#1B2A22">
        <Layer depth={0.5}>
          <Sky x0={-1800} x1={1800} y0={-1400} y1={FLOOR} top="#5E7466" bottom="#9DAE8A" />
          {[-900, -560, -150, 260, 640, 1000].map((x, i) => (
            <Palm key={x} x={x} y={FLOOR} h={520 + (i % 3) * 90} sway={noise(t * 0.5, i) * 3} color="#3D6B45" />
          ))}
        </Layer>
        <Layer depth={1}>
          <rect x={-1800} y={FLOOR} width={3600} height={900} fill="#2E3B26" />
          <ellipse cx={260} cy={FLOOR + 40} rx={220} ry={26} fill="#4C6458" stroke={C.ink} strokeWidth={3} />
          <ellipse cx={-520} cy={FLOOR + 70} rx={160} ry={20} fill="#4C6458" stroke={C.ink} strokeWidth={3} />
          <rect x={-1800} y={FLOOR} width={3600} height={6} fill={C.ink} opacity={0.6} />
          <GhostCity x={260} y={FLOOR - 10} opacity={ghost} />
          <g opacity={ghost}>
            <Label x={290} y={-480} text="St Joseph?" size={46} color={C.bone} />
          </g>
          {settlers.map((s, i) => {
            const start = s.end - 620;
            const x = keys(f, [[0, start], [70 + i * 6, s.end]], linear);
            const phase = (x - start) / (STRIDE * SCALE);
            const pose = mix(walk(phase, t, s.seed), idle(t, s.seed), prog(f, 66 + i * 6, 80 + i * 6));
            return <Stickman key={i} x={x} y={FLOOR} scale={SCALE} facing={1} pose={pose} look={s.look} expr={f < 95 ? "happy" : "worried"} />;
          })}
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 7. Tragedy and rescue: rain and fever, then a ship on the horizon. */
const Tragedy: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const rescue = prog(f, 100, 160);
  const rainK = 1 - prog(f, 100, 140);
  const shipX = keys(f, [[100, 900], [175, 430]], eOut);
  const cam = keysObj(f, [
    [0, {x: 0, y: 80, zoom: 1.08, rot: 0}],
    [S.tragedy.len, {x: 60, y: 60, zoom: 1.0, rot: 0}],
  ]);
  const people = [
    {x: -330, look: SETTLER_A, seed: 21},
    {x: -150, look: SETTLER_B, seed: 22},
    {x: 30, look: SETTLER_C, seed: 23},
  ];
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t} background="#121A16">
        <Layer depth={0.5}>
          <Sky x0={-1800} x1={1800} y0={-1400} y1={FLOOR} top="#1E2A2A" bottom="#3E5350" />
          <Glow x={700} y={120} r={500} color={C.yellow} opacity={0.3 * rescue} />
          <Waves x0={200} x1={1800} y={180} t={t} depth={300} color="#2C4C5A" amp={6} />
          <Ship x={shipX} y={190} scale={0.45} rock={Math.sin(t * 2) * 3} facing={-1} />
          {[-1000, -640, -260].map((x, i) => (
            <Palm key={x} x={x} y={FLOOR} h={540 + i * 60} sway={noise(t * 0.9, i + 4) * 5} color="#2C4A33" />
          ))}
        </Layer>
        <Layer depth={1}>
          <rect x={-1800} y={FLOOR} width={3600} height={900} fill="#232E1F" />
          <rect x={-1800} y={FLOOR} width={3600} height={6} fill={C.ink} opacity={0.6} />
          {people.map((p, i) => (
            <Stickman
              key={i}
              x={p.x}
              y={FLOOR}
              scale={SCALE}
              facing={1}
              pose={mix(slump(t, p.seed), {...idle(t, p.seed), look: 0.8}, prog(f, 140 + i * 5, 158 + i * 5))}
              look={p.look}
              expr={f < 145 ? "sad" : "surprised"}
            />
          ))}
          <Rain t={t} x0={-1100} x1={1100} y0={-1200} y1={1100} opacity={0.45 * rainK} />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 8. Paris: the second attempt, and the court's verdict. */
const Paris: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = keysObj(f, [
    [0, {x: 0, y: 60, zoom: 1.05, rot: 0}],
    [S.paris.len, {x: 0, y: 40, zoom: 1.15, rot: 0}],
  ]);
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room color="#2A2630" windows />
        <Layer depth={0.5}>
          <Heading text="PARIS · 1826" y={-650} opacity={prog(f, 4, 24)} />
        </Layer>
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <Stickman x={0} y={FLOOR} scale={SCALE} facing={1} pose={idle(t, 8)} look={MACGREGOR} expr={f < 50 ? "worried" : "smug"} />
          <Stamp x={0} y={-240} text="ACQUITTED" k={prog(f, 44, 52, eOut)} color="#5FAF6A" size={70} rot={-6} />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 9. Caracas: his life ends; he fades away. */
const Caracas: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam: Cam = {x: 0, y: 60, zoom: 1.1, rot: 0};
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room color="#3A3024" windows />
        <Layer depth={0.5}>
          <Heading text="CARACAS · 1845" y={-650} opacity={prog(f, 4, 24)} />
        </Layer>
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <Stickman x={0} y={FLOOR} scale={SCALE} facing={1} pose={slump(t, 9)} look={MACGREGOR} expr="calm" opacity={1 - prog(f, 30, 80)} />
        </Layer>
      </Camera2D>
      <FadeIn />
    </AbsoluteFill>
  );
};

/** 10. Finale: the coast stays on the map; the made-up country fades away. */
const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = keysObj(f, [
    [0, {x: 0, y: -40, zoom: 1.15, rot: 0}],
    [S.finale.len, {x: 0, y: -40, zoom: 1.0, rot: 0}],
  ]);
  return (
    <AbsoluteFill>
      <Camera2D cam={cam} t={t}>
        <Room />
        <Layer depth={1}>
          <Floor x0={-1800} x1={1800} />
          <Board x={0} y={FLOOR - 120} w={640} h={600}>
            <PoyaisMap w={640} h={600} k={1 - prog(f, 20, 80)} />
          </Board>
          <Label x={0} y={-560} text="THE MOSQUITO COAST" size={46} color={C.yellow} />
        </Layer>
      </Camera2D>
      <FadeIn len={10} />
    </AbsoluteFill>
  );
};

export const PoyaisStory: React.FC<{narration?: string}> = ({narration}) => (
  <AbsoluteFill style={{backgroundColor: C.night}}>
    <Sequence from={S.hook.from} durationInFrames={S.hook.len}>
      <Hook />
    </Sequence>
    <Sequence from={S.who.from} durationInFrames={S.who.len}>
      <Who />
    </Sequence>
    <Sequence from={S.pitch.from} durationInFrames={S.pitch.len}>
      <Pitch />
    </Sequence>
    <Sequence from={S.sell.from} durationInFrames={S.sell.len}>
      <Sell />
    </Sequence>
    <Sequence from={S.voyage.from} durationInFrames={S.voyage.len}>
      <Voyage />
    </Sequence>
    <Sequence from={S.arrive.from} durationInFrames={S.arrive.len}>
      <Arrive />
    </Sequence>
    <Sequence from={S.tragedy.from} durationInFrames={S.tragedy.len}>
      <Tragedy />
    </Sequence>
    <Sequence from={S.paris.from} durationInFrames={S.paris.len}>
      <Paris />
    </Sequence>
    <Sequence from={S.caracas.from} durationInFrames={S.caracas.len}>
      <Caracas />
    </Sequence>
    <Sequence from={S.finale.from} durationInFrames={S.finale.len}>
      <Finale />
    </Sequence>
    <CaptionTrack cues={CAPTIONS} />
    <Narration file={narration} />
  </AbsoluteFill>
);
