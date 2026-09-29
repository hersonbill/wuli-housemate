/* Original vector illustrations: Wuli's shared home and a small, consistent icon family. */
const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  expenses: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 7 3 4 3-4M9 12h6m-6 3h6m-3-4v7"/>',
  chores: '<path d="m15 3-5 11m-3-2 7 3-2 6H3l4-9Zm0 4-2 5m5-4-1 4M19 8v4m-2-2h4"/>',
  items: '<path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v11l9 4 9-4V7M12 11v11M7 5l10 4v5"/>',
  rules: '<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15M5 8h3m-3 4h3m8-4h3m-3 4h3"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  leaf: '<path d="M19 3C9 2 3 7 5 14s14 5 14-11ZM4 21 16 8"/>',
  heart: '<path d="M12 21 3 12C-2 4 7 0 12 6c5-6 14-2 9 6Z"/>',
  sparkle: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
  tea: '<path d="M4 8h13v6a6.5 6.5 0 0 1-13 0Zm13 1h2a3 3 0 0 1 0 6h-2M3 22h16M7 2v3m6-3v3"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>'
};
function icon(name, cls='') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.sparkle}</svg>`;
}
function roomArt(){return `<svg class="room-art" viewBox="0 0 600 440" fill="none" aria-hidden="true">
<defs><linearGradient id="wall" x1="170" y1="30" x2="400" y2="310" gradientUnits="userSpaceOnUse"><stop stop-color="#f6e8c4"/><stop offset="1" stop-color="#efe0ba"/></linearGradient><linearGradient id="floor" x1="280" y1="190" x2="330" y2="440" gradientUnits="userSpaceOnUse"><stop stop-color="#dec59b"/><stop offset="1" stop-color="#eddcbb"/></linearGradient><linearGradient id="sofa" x1="200" y1="200" x2="300" y2="330" gradientUnits="userSpaceOnUse"><stop stop-color="#dd8060"/><stop offset="1" stop-color="#ba5d44"/></linearGradient><clipPath id="window"><path d="M332 49h117v160H332Z"/></clipPath></defs>
<ellipse cx="313" cy="404" rx="226" ry="20" fill="#7c7653" opacity=".11"/>
<path d="M104 257 312 167 543 291 328 420Z" fill="url(#floor)"/>
<path d="M104 74 313 15v241l-209 65Z" fill="#e2d3ac"/>
<path d="m313 15 230 94v214l-230-67Z" fill="url(#wall)"/>
<path d="m104 321 224 99 215-97M313 256l15 164" stroke="#c4ac83" stroke-width="1.5"/>
<path d="m125 328 211 76m-157-99 210 65m-157-85 204 64m-149-80 201 57" stroke="#d1b992"/>
<g transform="matrix(1 .37 0 1 1 -111)"><rect x="331" y="46" width="121" height="167" rx="4" fill="#faf5df"/><g clip-path="url(#window)"><rect x="338" y="53" width="108" height="153" fill="#a9c8bb"/><circle cx="411" cy="94" r="28" fill="#fff0bb"/><path d="M332 185q34-65 58-5t65-42v90H332Z" fill="#7da68d"/><path d="M332 201q38-31 67 0t55-6v30H332Z" fill="#517f68"/></g><path d="M390 52v155m-53-78h109" stroke="#faf5df" stroke-width="6"/></g>
<path d="m346 174 94 33 59 116-131-33Z" fill="#fff4cf" opacity=".38"/>
<path d="m163 108 64-19v65l-64 21Z" fill="#f7efd8" stroke="#ac8d67" stroke-width="5"/><path d="m171 157 23-34 27 19-50 15Z" fill="#83947a"/><circle cx="206" cy="115" r="8" fill="#daac65"/>
<path d="m117 230 183-58v12l-183 57Z" fill="#b99972"/>
<g stroke="#446149" stroke-width="3"><path d="m159 213-1-33m-1 11-13-11m14 5 11-17"/></g><path d="M149 198h19l-3 22-12 4Z" fill="#cb825d"/><path d="M139 178q-4-17 13-8 9 8 4 18-9 0-17-10Zm23-8q10-16 16-8 1 16-17 23Z" fill="#618465"/>
<path d="m219 188 9-3v25l-9 3Z" fill="#c77351"/><path d="m230 183 8-3v26l-8 3Z" fill="#e9bf68"/><path d="m241 179 10-3v26l-10 3Z" fill="#456d62"/>
<path d="m175 308 170-48 134 68-169 72Z" fill="#7f967b"/><path d="m189 309 156-43 119 61-155 65Z" stroke="#dce0ba" stroke-width="2" stroke-dasharray="3 6"/>
<g class="sofa-group"><path d="m181 264 98-30 51 42v55l-136 12-13-79Z" fill="#98523e"/><path d="m173 218 104-32q15-4 24 6l12 58-120 38-20-70Z" fill="url(#sofa)"/><path d="m184 221 45-14 9 63-46 16Zm52-16 45-13 18 59-53 16Z" fill="#df8d6d"/><path d="m170 278 129-38 40 35-124 46-45-43Z" fill="#ec9b77"/><path d="m172 279 45 40v34l-45-31Z" fill="#b7674b"/><path d="m218 320 121-44v32l-121 45Z" fill="#c47555"/><path d="m155 245 18-5 33 62v37l-19 7-32-70Z" fill="#d88b6a"/><path d="m157 245 31 23 18 34-19 7-32-34Z" fill="#eba07b"/><path d="m285 208 16-4 36 64v37l-16 6-36-63Z" fill="#c87959"/><path d="m286 208 32 23 19 37-16 6-36-25Z" fill="#e2956f"/><path d="M194 343v13m118-41v14" stroke="#78503c" stroke-width="5"/>
<path d="m245 220 32-10 19 33-35 11Z" fill="#f0d487"/><path d="m249 226 32 10m-22-18 13 31" stroke="#c29652" stroke-width="2"/>
<path d="m193 236 29-9 15 29-32 9Z" fill="#f5e8c7"/></g>
<g class="coffee-table"><path d="m354 331-9 34m59-39 13 27" stroke="#94714b" stroke-width="6" stroke-linecap="round"/><ellipse cx="380" cy="321" rx="55" ry="24" fill="#ae8355"/><ellipse cx="380" cy="316" rx="55" ry="24" fill="#ecc994"/><path d="m359 309 29-7 16 12-27 9Z" fill="#678579"/><path d="m364 307 25-6 16 11-26 7Z" fill="#f4f0d7"/><path d="M392 301v12q8 7 16 0v-12Z" fill="#faf3dd"/><ellipse cx="400" cy="301" rx="8" ry="4" fill="#826149"/><path d="M409 302q12 3 0 10" stroke="#faf3dd" stroke-width="3"/><g class="tea-steam" stroke="#fffaf0" stroke-width="2" stroke-linecap="round"><path d="M398 292q-5-7 0-13m6 13q-4-5 0-9"/></g></g>
<g class="floor-plant"><path d="M470 263h39l-7 47q-13 10-26-2Z" fill="#bc7954"/><ellipse cx="490" cy="263" rx="20" ry="7" fill="#80573e"/><path d="m490 265-2-100m2 65-28-25m28 44 25-39" stroke="#446848" stroke-width="4"/><path d="M488 195q-44-13-25-48 29 1 25 48Z" fill="#597e52"/><path d="M489 209q43-17 20-48-25 12-20 48Z" fill="#3e7052"/><path d="M485 233q-49-4-36-32 29-5 36 32Z" fill="#809454"/><path d="M496 246q-2-38 31-42 13 27-31 42Z" fill="#587d4e"/></g>
<path d="M127 288V170" stroke="#596347" stroke-width="4"/><path d="m112 176 8-37h22l10 37Z" fill="#f8eac0"/><ellipse cx="132" cy="176" rx="20" ry="5" fill="#dbc497"/><ellipse cx="127" cy="291" rx="19" ry="7" fill="#596347"/>
<g class="lamp-light"><path d="m113 177-33 139q43 37 119 6l-49-145Z" fill="#fff3bb" opacity=".32"/><ellipse cx="132" cy="170" rx="29" ry="22" fill="#fff8c3" opacity=".45"/><ellipse cx="132" cy="176" rx="19" ry="5" fill="#fff6b3"/></g>
<g class="cat"><ellipse cx="371" cy="381" rx="27" ry="11" fill="#bd985f"/><path d="M365 373q-5-18 12-17 12 3 10 15" fill="#bd985f"/><path d="m367 360-1-10 9 6m4 1 8-5-1 12" fill="#bd985f"/><path d="M373 366h2m5 0h2" stroke="#674f33" stroke-width="2" stroke-linecap="round"/><path d="M345 379q-22-19-26-5t26 10" stroke="#bd985f" stroke-width="7" stroke-linecap="round"/></g>
</svg>`;}
function supplyArt(name){
  const paper=/纸/.test(name),bag=/袋|垃圾/.test(name);
  return `<svg class="supply-art" viewBox="0 0 120 100" fill="none" aria-hidden="true"><ellipse cx="60" cy="88" rx="34" ry="5" fill="currentColor" opacity=".08"/>${paper?'<path d="M28 32h47v43H28Z" fill="#f1dec0" stroke="#9b896f" stroke-width="1.5"/><ellipse cx="52" cy="32" rx="24" ry="12" fill="#fffaf0" stroke="#9b896f" stroke-width="1.5"/><ellipse cx="52" cy="32" rx="8" ry="4" fill="#c5b092"/><path d="M76 34v30q0 13 18 13V38q-9 6-18-4Z" fill="#fffaf0" stroke="#9b896f" stroke-width="1.5"/><path d="M80 59h9m-9 5h9" stroke="#d1c7b7"/>':bag?'<path d="M44 24h31l15 56q-30 13-61 0Z" fill="#729084" stroke="#345b4a" stroke-width="1.5"/><path d="m44 24 4-9h22l5 9m-24 5-6 41m18-40 6 43" stroke="#345b4a" stroke-width="2"/><path d="m50 16 15-6" stroke="#345b4a" stroke-width="3"/>':'<path d="M41 34q-9 4-9 14v34q27 9 54 0V48q0-9-12-14Z" fill="#b5c9a8" stroke="#5a7554" stroke-width="1.5"/><path d="M48 21h22v15H48Z" fill="#e5bd73" stroke="#8b784d" stroke-width="1.5"/><path d="M50 21v-8h33v7H66" stroke="#5a7554" stroke-width="4" stroke-linecap="round"/><rect x="40" y="48" width="38" height="23" rx="4" fill="#f5edcf"/><path d="M52 61q7-17 16-7-1 12-16 7Z" fill="#728d61"/>'}</svg>`;
}
