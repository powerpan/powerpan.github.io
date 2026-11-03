/* ==========================================================================
   INK FLUID — a WebGL2 stable-fluids solver rendered as pigment on paper.
   Dye stores premultiplied pigment: rgb = ink colour × amount, a = amount.
   Day:   paper × exp(−absorbance)  (Beer–Lambert, with wet-edge pooling)
   Night: the same pigment emits light on a dark ground.
   Public API on window.Ink; the page decides when and where to paint.
   ========================================================================== */
(() => {
    const canvas = document.getElementById('ink');
    const root = document.documentElement;
    const fail = () => { root.classList.add('no-ink'); window.Ink = null; };
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) return fail();
    gl.getExtension('OES_texture_float_linear');

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const small = Math.min(innerWidth, innerHeight) < 700;
    const config = {
        simRes: small ? 96 : 128,
        dyeRes: small ? 448 : 720,
        pressureIters: small ? 14 : 20,
        curl: 22,
        velocityDissipation: 0.35,
        dyeDissipation: 0.2,
        pressureDecay: 0.8,
    };

    // Inks as they appear on paper. Night mode lets the same values glow.
    const PALETTE = {
        ultramarine: [0.10, 0.17, 0.96],
        vermilion: [1.00, 0.24, 0.07],
        saffron: [1.00, 0.70, 0.02],
        viridian: [0.00, 0.62, 0.46],
        magenta: [0.90, 0.10, 0.56],
        sumi: [0.06, 0.06, 0.08],
    };
    const ORDER = ['ultramarine', 'vermilion', 'saffron', 'viridian', 'magenta', 'ultramarine', 'sumi'];

    /* ---------- GL plumbing ---------- */
    const VERT = `#version 300 es
        in vec2 aPos; uniform vec2 texel;
        out vec2 vUv, vL, vR, vT, vB;
        void main() {
            vUv = aPos * 0.5 + 0.5;
            vL = vUv - vec2(texel.x, 0.0); vR = vUv + vec2(texel.x, 0.0);
            vT = vUv + vec2(0.0, texel.y); vB = vUv - vec2(0.0, texel.y);
            gl_Position = vec4(aPos, 0.0, 1.0);
        }`;
    const HEAD = `#version 300 es
        precision highp float; precision highp sampler2D;
        in vec2 vUv, vL, vR, vT, vB; out vec4 o;\n`;
    const FRAG = {
        splat: `uniform sampler2D uTarget; uniform float aspect, radius; uniform vec2 point; uniform vec4 value;
            void main() {
                vec2 p = vUv - point; p.x *= aspect;
                o = texture(uTarget, vUv) + value * exp(-dot(p, p) / radius);
            }`,
        advect: `uniform sampler2D uVelocity, uSource; uniform vec2 simTexel; uniform float dt, dissipation;
            void main() {
                vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * simTexel;
                o = texture(uSource, coord) / (1.0 + dissipation * dt);
            }`,
        divergence: `uniform sampler2D uVelocity;
            void main() {
                float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x;
                float T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
                vec2 C = texture(uVelocity, vUv).xy;
                if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
                if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
                o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
            }`,
        curl: `uniform sampler2D uVelocity;
            void main() {
                float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y;
                float T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
                o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
            }`,
        vorticity: `uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
            void main() {
                float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x;
                float T = texture(uCurl, vT).x, B = texture(uCurl, vB).x, C = texture(uCurl, vUv).x;
                vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                force = force / (length(force) + 1e-4) * curl * C; force.y *= -1.0;
                vec2 v = texture(uVelocity, vUv).xy + force * dt;
                o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
            }`,
        pressure: `uniform sampler2D uPressure, uDivergence;
            void main() {
                float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
                float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
                o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
            }`,
        gradient: `uniform sampler2D uPressure, uVelocity;
            void main() {
                float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
                float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
                o = vec4(texture(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
            }`,
        scale: `uniform sampler2D uTarget; uniform float value;
            void main() { o = texture(uTarget, vUv) * value; }`,
        display: `uniform sampler2D uDye; uniform vec3 paper; uniform float night, time, strength; uniform vec2 res;
            float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
            float noise(vec2 p) {
                vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
            }
            void main() {
                vec4 d = texture(uDye, vUv) * strength;
                float dens = max(d.a, 0.0);
                // Watercolour pigment migrates to the drying edge: darken along density gradients.
                float dl = texture(uDye, vL).a, dr = texture(uDye, vR).a, dt = texture(uDye, vT).a, db = texture(uDye, vB).a;
                float edge = clamp(length(vec2(dr - dl, dt - db)) * 7.0 * strength, 0.0, 1.5);
                vec3 hue = d.rgb / max(dens, 1e-3);
                vec3 absorb = max(vec3(dens) - d.rgb, 0.0) * 3.4 + (1.0 - hue) * edge * 1.1;
                // Paper: cold-pressed tooth plus long fibres.
                vec2 px = vUv * res;
                float tooth = noise(px * 0.35) * 0.6 + noise(px * 1.3) * 0.4;
                float fibre = smoothstep(0.62, 1.0, noise(vec2(px.x * 0.04 + px.y * 0.012, px.y * 0.3)));
                vec3 day = paper * exp(-absorb * (0.92 + tooth * 0.16));
                day *= 1.0 - (tooth - 0.5) * 0.035 - fibre * 0.02;
                vec3 glow = 1.0 - exp(-(d.rgb * 2.3 + hue * edge * 0.7));
                vec3 dark = paper + glow * (0.85 + tooth * 0.3);
                dark += (tooth - 0.5) * 0.012;
                vec3 color = mix(day, dark, night);
                vec2 q = vUv - 0.5;
                color *= 1.0 - dot(q, q) * mix(0.14, 0.45, night);
                o = vec4(color, 1.0);
            }`,
    };

    function compile(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
    }
    let programs;
    try {
        const vs = compile(gl.VERTEX_SHADER, VERT);
        programs = Object.fromEntries(Object.entries(FRAG).map(([name, src]) => {
            const p = gl.createProgram();
            gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, HEAD + src));
            gl.bindAttribLocation(p, 0, 'aPos');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
            const uniforms = {};
            for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
                const n = gl.getActiveUniform(p, i).name;
                uniforms[n] = gl.getUniformLocation(p, n);
            }
            return [name, { p, u: uniforms }];
        }));
    } catch (error) {
        console.warn('Ink disabled:', error.message);
        return fail();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function target(w, h, internal, format) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        return { tex, fbo, w, h, texel: [1 / w, 1 / h],
            bind(unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; } };
    }
    function double(w, h, internal, format) {
        let a = target(w, h, internal, format), b = target(w, h, internal, format);
        return { get read() { return a; }, get write() { return b; }, swap() { [a, b] = [b, a]; }, w, h, texel: a.texel };
    }
    function size(res) {
        const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
        const min = Math.round(res), max = Math.round(res * Math.max(aspect, 1 / aspect));
        return aspect > 1 ? [max, min] : [min, max];
    }

    let velocity, dye, pressure, divergence, curlTex, simAspect = 0;
    function allocate() {
        const [sw, sh] = size(config.simRes), [dw, dh] = size(config.dyeRes);
        velocity = double(sw, sh, gl.RG16F, gl.RG);
        dye = double(dw, dh, gl.RGBA16F, gl.RGBA);
        pressure = double(sw, sh, gl.R16F, gl.RED);
        divergence = target(sw, sh, gl.R16F, gl.RED);
        curlTex = target(sw, sh, gl.R16F, gl.RED);
        simAspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    }
    function draw(out, prog, texel) {
        gl.useProgram(prog.p);
        if (prog.u.texel) gl.uniform2fv(prog.u.texel, texel);
        if (out) { gl.viewport(0, 0, out.w, out.h); gl.bindFramebuffer(gl.FRAMEBUFFER, out.fbo); }
        else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /* ---------- Simulation ---------- */
    function splatRaw(field, x, y, value, radius) {
        const { p, u } = programs.splat;
        gl.useProgram(p);
        gl.uniform1i(u.uTarget, field.read.bind(0));
        gl.uniform1f(u.aspect, canvas.width / canvas.height);
        gl.uniform2f(u.point, x, y);
        gl.uniform4fv(u.value, value);
        gl.uniform1f(u.radius, radius * 0.002);
        draw(field.write, programs.splat, field.texel);
        field.swap();
    }
    function step(dt) {
        gl.disable(gl.BLEND);
        let pr = programs.curl;
        gl.useProgram(pr.p); gl.uniform1i(pr.u.uVelocity, velocity.read.bind(0));
        draw(curlTex, pr, velocity.texel);

        pr = programs.vorticity;
        gl.useProgram(pr.p);
        gl.uniform1i(pr.u.uVelocity, velocity.read.bind(0)); gl.uniform1i(pr.u.uCurl, curlTex.bind(1));
        gl.uniform1f(pr.u.curl, config.curl); gl.uniform1f(pr.u.dt, dt);
        draw(velocity.write, pr, velocity.texel); velocity.swap();

        pr = programs.divergence;
        gl.useProgram(pr.p); gl.uniform1i(pr.u.uVelocity, velocity.read.bind(0));
        draw(divergence, pr, velocity.texel);

        pr = programs.scale;
        gl.useProgram(pr.p); gl.uniform1i(pr.u.uTarget, pressure.read.bind(0)); gl.uniform1f(pr.u.value, config.pressureDecay);
        draw(pressure.write, pr, pressure.texel); pressure.swap();

        pr = programs.pressure;
        gl.useProgram(pr.p); gl.uniform1i(pr.u.uDivergence, divergence.bind(1));
        for (let i = 0; i < config.pressureIters; i++) {
            gl.uniform1i(pr.u.uPressure, pressure.read.bind(0));
            draw(pressure.write, pr, velocity.texel); pressure.swap();
        }

        pr = programs.gradient;
        gl.useProgram(pr.p);
        gl.uniform1i(pr.u.uPressure, pressure.read.bind(0)); gl.uniform1i(pr.u.uVelocity, velocity.read.bind(1));
        draw(velocity.write, pr, velocity.texel); velocity.swap();

        pr = programs.advect;
        gl.useProgram(pr.p);
        gl.uniform2fv(pr.u.simTexel, velocity.texel); gl.uniform1f(pr.u.dt, dt);
        gl.uniform1i(pr.u.uVelocity, velocity.read.bind(0)); gl.uniform1i(pr.u.uSource, velocity.read.bind(0));
        gl.uniform1f(pr.u.dissipation, config.velocityDissipation);
        draw(velocity.write, pr, velocity.texel); velocity.swap();

        gl.uniform1i(pr.u.uVelocity, velocity.read.bind(0)); gl.uniform1i(pr.u.uSource, dye.read.bind(1));
        gl.uniform1f(pr.u.dissipation, config.dyeDissipation);
        draw(dye.write, pr, dye.texel); dye.swap();
    }
    // Start on the stored theme so a night page never flashes day paper first.
    const startNight = root.dataset.theme === 'night' ? 1 : 0;
    const cssPaper = getComputedStyle(root).getPropertyValue('--paper-rgb').split(',').map(n => parseFloat(n) / 255);
    const theme = { paper: cssPaper.length === 3 && cssPaper.every(n => n >= 0) ? cssPaper : [0.93, 0.91, 0.87], night: startNight, nightTarget: startNight, strength: document.body.dataset.ink === 'quiet' ? 0.72 : 1 };
    function render(time) {
        const { p, u } = programs.display;
        gl.useProgram(p);
        gl.uniform1i(u.uDye, dye.read.bind(0));
        gl.uniform3fv(u.paper, theme.paper);
        gl.uniform1f(u.night, theme.night);
        gl.uniform1f(u.strength, theme.strength);
        gl.uniform1f(u.time, time);
        gl.uniform2f(u.res, canvas.width, canvas.height);
        draw(null, programs.display, dye.texel);
    }

    /* ---------- Public painting API (viewport CSS pixels) ---------- */
    let colorIndex = 0;
    const current = () => PALETTE[ORDER[colorIndex % ORDER.length]];
    function toUv(x, y) { return [x / innerWidth, 1 - y / innerHeight]; }
    function splat(x, y, dx, dy, color = current(), amount = 0.55, radius = 0.42) {
        const [u, v] = toUv(x, y);
        // Pointer speed arrives in CSS px/s; the solver works in simulation cells/s.
        const k = config.simRes / innerHeight * 1.3;
        splatRaw(velocity, u, v, [dx * k, -dy * k, 0, 0], radius);
        splatRaw(dye, u, v, [color[0] * amount, color[1] * amount, color[2] * amount, amount], radius);
    }
    function burst(x, y, color = current()) {
        for (let i = 0; i < 7; i++) {
            const a = i / 7 * Math.PI * 2 + Math.random() * 0.4;
            splat(x + Math.cos(a) * 6, y + Math.sin(a) * 6, Math.cos(a) * 900, Math.sin(a) * 900, color, 0.32, 0.55);
        }
        splat(x, y, 0, 0, color, 1.1, 1.4);
    }
    function seed(count = 7) {
        for (let i = 0; i < count; i++) {
            const color = PALETTE[ORDER[(colorIndex + i) % ORDER.length]];
            const x = innerWidth * (0.12 + Math.random() * 0.76), y = innerHeight * (0.1 + Math.random() * 0.8);
            const a = Math.random() * Math.PI * 2;
            splat(x, y, Math.cos(a) * 700, Math.sin(a) * 700, color, 0.42, 1.2 + Math.random() * 1.8);
        }
    }

    /* ---------- Ambient brushes and scroll stirring ---------- */
    const brushes = [
        { ax: 0.34, ay: 0.23, fx: 0.11, fy: 0.17, px: 0.0, py: 1.3, cx: 0.32, cy: 0.42, ink: 'ultramarine' },
        { ax: 0.28, ay: 0.26, fx: 0.07, fy: 0.13, px: 2.1, py: 0.4, cx: 0.7, cy: 0.55, ink: 'vermilion' },
        { ax: 0.22, ay: 0.18, fx: 0.15, fy: 0.09, px: 4.0, py: 2.6, cx: 0.52, cy: 0.3, ink: 'saffron' },
    ].map(b => ({ ...b, x: 0, y: 0, t: 0 }));
    let ambient = 1, music = 0;
    function brushStep(t, dt) {
        if (ambient < 0.02) return;
        brushes.forEach((b, i) => {
            const nx = (b.cx + Math.sin(t * b.fx * 6.2832 + b.px) * b.ax) * innerWidth;
            const ny = (b.cy + Math.sin(t * b.fy * 6.2832 + b.py) * b.ay) * innerHeight;
            if (b.t) {
                const vx = (nx - b.x) / dt, vy = (ny - b.y) / dt;
                b.acc = (b.acc || 0) + dt;
                if (b.acc > 0.05) {
                    b.acc = 0;
                    const ink = (Math.floor(t / 14) + i) % 4 === 3 ? PALETTE.magenta : PALETTE[b.ink];
                    const m = 1 + music * 1.8;
                    splat(nx, ny, vx * 2.4 * ambient * m, vy * 2.4 * ambient * m, ink, 0.034 * ambient * m, 0.42 + music * .25);
                }
            }
            b.x = nx; b.y = ny; b.t = t;
        });
    }
    let lastScroll = scrollY, scrollDebt = 0;
    addEventListener('scroll', () => { scrollDebt += scrollY - lastScroll; lastScroll = scrollY; }, { passive: true });
    function scrollStir() {
        if (Math.abs(scrollDebt) < 1) return;
        const force = Math.max(-320, Math.min(320, scrollDebt * 4));
        for (let i = 0; i < 3; i++) {
            const x = innerWidth * (0.15 + 0.35 * i + Math.random() * 0.1);
            const [u, v] = toUv(x, innerHeight * (0.3 + Math.random() * 0.4));
            splatRaw(velocity, u, v, [0, force, 0, 0], 3.2);
        }
        scrollDebt = 0;
    }

    /* ---------- Lifecycle ---------- */
    function resize(force) {
        const ratio = Math.min(devicePixelRatio || 1, 1.25);
        const w = Math.round(innerWidth * ratio), h = Math.round(innerHeight * ratio);
        // Mobile toolbars change height constantly: keep the drawing buffer stable for small changes.
        if (!force && Math.abs(w - canvas.width) < 2 && Math.abs(h - canvas.height) / canvas.height < 0.18) return;
        canvas.width = w; canvas.height = h;
        const aspect = canvas.width / canvas.height;
        if (force || !velocity || Math.abs(aspect - simAspect) / simAspect > 0.25) { allocate(); seed(5); }
    }
    // Reading pages ask for quieter paper so long text stays comfortable.
    const quiet = document.body.dataset.ink === 'quiet';
    resize(true);
    seed(quiet ? 3 : 6);
    for (let i = 0; i < 46; i++) step(1 / 60);

    let running = false, frame = 0, last = 0, clock = 0, motion = !reduced.matches;
    function loop(now) {
        frame = 0;
        const dt = Math.min(1 / 30, Math.max(1 / 144, (now - last) / 1000 || 1 / 60));
        last = now; clock += dt;
        theme.night += (theme.nightTarget - theme.night) * (1 - Math.exp(-dt / 0.35));
        brushStep(clock, dt);
        scrollStir();
        step(dt);
        render(clock);
        if (running) frame = requestAnimationFrame(loop);
    }
    function start() {
        if (running || !motion || document.hidden) return;
        running = true; last = performance.now(); frame = requestAnimationFrame(loop);
    }
    function stop() { running = false; cancelAnimationFrame(frame); frame = 0; }
    function still() {
        // Reduced motion: a single composed, settled painting.
        theme.night = theme.nightTarget;
        render(clock);
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    addEventListener('resize', () => { resize(false); if (!running) still(); }, { passive: true });
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); fail(); });

    window.Ink = {
        PALETTE, ORDER,
        splat, burst,
        get color() { return current(); },
        nextColor() { colorIndex++; return current(); },
        setColor(name) { const i = ORDER.indexOf(name); if (i >= 0) colorIndex = i; return current(); },
        get colorName() { return ORDER[colorIndex % ORDER.length]; },
        setAmbient(v) { ambient = Math.max(0, Math.min(1, v)); },
        setMusic(v) { music = Math.max(0, Math.min(1, v)); },
        setStrength(v) { theme.strength = v; },
        setTheme(paper, night) {
            theme.paper = paper; theme.nightTarget = night ? 1 : 0;
            if (!running) still();
        },
        setMotion(on) {
            motion = on && !reduced.matches;
            if (motion) start(); else { stop(); still(); }
        },
        refresh() { if (!running) still(); },
    };
    reduced.addEventListener('change', () => window.Ink.setMotion(motion));
    root.classList.add('has-ink');
    still();
    if (motion) start();
})();
