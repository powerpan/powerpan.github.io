/* ========================================
   HERO CORE - Ray-marched chrome, no 3D runtime dependency
======================================== */
(() => {
    function sampleMotion(time, x = 0, y = 0) {
        return {
            spin: -0.24 + Math.sin(time * 0.48) * 0.18 + x * 0.12,
            tiltX: 0.3 + Math.sin(time * 0.61) * 0.2 + y * 0.6,
            tiltY: -0.14 + Math.cos(time * 0.43) * 0.16 + x * 0.8,
            driftX: Math.sin(time * 0.73) * 0.011 + x * 0.065,
            driftY: Math.cos(time * 0.57) * 0.012 - y * 0.055,
        };
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { sampleMotion };
        return;
    }
    const hero = document.getElementById('hero');
    const fallback = document.getElementById('particleCanvas');
    if (!hero || !fallback || !window.SiteMotion) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return;

    const vertex = `
        attribute vec2 position;
        void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;
    const fragment = `
        precision highp float;
        uniform vec2 resolution;
        uniform vec3 pose;
        uniform vec2 drift;
        uniform float time;
        uniform float scroll;
        uniform float themeMix;
        vec3 accent() { return mix(vec3(0.0, 1.0, 0.49), vec3(0.0, 0.43, 0.27), themeMix); }
        #define GREEN accent()

        mat2 rotate(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c, -s, s, c);
        }
        vec3 localPoint(vec3 p) {
            p.xy = rotate(pose.x) * p.xy;
            p.yz = rotate(pose.y + scroll * 0.35) * p.yz;
            p.xz = rotate(pose.z) * p.xz;
            return p;
        }
        vec2 bandPoint(vec3 p) {
            float a = atan(p.y, p.x);
            float flow = time * 0.72;
            float radius = 1.06 + 0.13 * sin(a * 3.0 - flow) + 0.035 * sin(a * 5.0 + flow * 0.7);
            vec2 band = vec2(length(p.xy) - radius, p.z - 0.09 * sin(a * 2.0 - flow));
            band = rotate(a * 2.0 - time * 0.4) * band;
            band.y *= 1.4 + 0.12 * sin(a * 3.0 - flow);
            return band;
        }
        float surface(vec3 p) {
            p = localPoint(p);
            float a = atan(p.y, p.x);
            float fold = 0.04 * sin(a * 4.0 - time * 0.85) + 0.012 * sin(a * 9.0 + time * 0.5);
            return (length(bandPoint(p)) - 0.29 - fold) * 0.68;
        }
        vec3 normalAt(vec3 p) {
            vec2 e = vec2(0.0015, 0.0);
            return normalize(vec3(surface(p + e.xyy) - surface(p - e.xyy),
                surface(p + e.yxy) - surface(p - e.yxy), surface(p + e.yyx) - surface(p - e.yyx)));
        }
        vec3 studio(vec3 r) {
            float broad = pow(max(dot(r, normalize(vec3(-0.7, 0.85, 0.8))), 0.0), 5.0);
            float softbox = smoothstep(0.46, 0.53, r.y) * (1.0 - smoothstep(0.68, 0.77, r.y));
            float edge = pow(max(dot(r, normalize(vec3(0.9, 0.4, 0.3))), 0.0), 36.0);
            float strip = pow(max(dot(r, normalize(vec3(-0.6, 0.1, 0.9))), 0.0), 22.0);
            float lower = pow(max(dot(r, normalize(vec3(0.6, -0.75, 0.5))), 0.0), 12.0);
            return mix(vec3(0.025, 0.035, 0.04), vec3(0.09, 0.14, 0.13), themeMix) + vec3(1.25, 1.35, 1.4) * broad
                + vec3(1.65) * softbox + vec3(1.4, 1.6, 1.65) * edge
                + vec3(1.0, 1.1, 1.08) * strip + GREEN * lower * 1.4;
        }
        void main() {
            float size = min(resolution.x, resolution.y);
            vec2 uv = (gl_FragCoord.xy - resolution * vec2(0.5, 0.51)) / size;
            uv -= drift;
            uv.x *= mix(1.0, 0.8, smoothstep(0.9, 1.5, resolution.x / resolution.y));
            vec3 origin = vec3(0.0, 0.0, 4.6);
            vec3 ray = normalize(vec3(uv * 3.0, -4.0));
            vec3 color = vec3(0.0);
            float alpha = 0.0;
            float distance = 2.8;
            float closest = 1.0;
            vec3 p;
            bool hit = false;
            // Bounded iterations and a small render target keep the effect decorative.
            for (int i = 0; i < 64; i++) {
                p = origin + ray * distance;
                float d = surface(p);
                closest = min(closest, d);
                if (d < 0.0018) { hit = true; break; }
                distance += max(d, 0.002);
                if (distance > 6.5) break;
            }
            if (hit) {
                vec3 n = normalAt(p);
                vec3 reflected = reflect(ray, n);
                float fresnel = pow(1.0 - max(dot(n, -ray), 0.0), 3.0);
                vec3 q = localPoint(p);
                vec2 band = bandPoint(q);
                float a = atan(q.y, q.x);
                float v = atan(band.y, band.x);
                float seam = pow(max(0.0, cos(v * 5.0 + a * 2.0 - time * 1.6)), 65.0);
                float rim = smoothstep(-0.8, 0.7, q.x - q.y);
                color = studio(reflected) * (0.65 + 0.55 * fresnel);
                color += GREEN * seam * rim * 1.5;
                color += vec3(0.12, 0.17, 0.16) * fresnel;
                color = 1.0 - exp(-color * 1.3);
                color = mix(color, color * vec3(0.69, 0.78, 0.74), themeMix);
                // Fade grazing edges instead of exposing the ray-march silhouette's hard steps.
                alpha = smoothstep(0.0, 0.11, max(dot(n, -ray), 0.0));
                color *= alpha;
            } else {
                float halo = exp(-max(closest, 0.0) * 55.0) * 0.24;
                color = GREEN * halo;
                alpha = halo;
            }
            // A fine orbital filament supplies a second depth cue without another canvas.
            vec2 orbit = rotate(-0.3 + sin(time * 0.38) * 0.12) * uv;
            float ellipse = length(orbit / vec2(0.46, 0.34));
            float wire = exp(-abs(ellipse - 1.0) * 500.0) * 0.38;
            float a = atan(orbit.y / 0.34, orbit.x / 0.46);
            float spark = pow(max(0.0, cos(a - time * 0.85)), 180.0) * wire * 3.0;
            color += vec3(0.55, 0.85, 0.73) * wire + GREEN * spark;
            alpha = max(alpha, wire + spark);
            gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
        }
    `;

    let program, buffer;
    const shaders = [];
    function compile(type, source) {
        const shader = gl.createShader(type);
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Hero shader is unavailable');
        return shader;
    }
    try {
        program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Hero shader cannot link');
        gl.useProgram(program);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const location = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    } catch (_) {
        shaders.forEach(shader => gl.deleteShader(shader));
        if (program) gl.deleteProgram(program);
        if (buffer) gl.deleteBuffer(buffer);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return;
    }

    canvas.id = 'particleCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.renderer = 'webgl';
    fallback.replaceWith(canvas);
    hero.dataset.core = 'webgl';
    const uniforms = Object.fromEntries(['resolution', 'pose', 'drift', 'time', 'scroll', 'themeMix'].map(name => [name, gl.getUniformLocation(program, name)]));
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const target = { x: 0, y: 0 };
    const view = { x: 0, y: 0 };
    let ready = true, lastPaint = -1, phase = 0, slowFrames = 0;
    let resolutionScale = 1;

    function resize() {
        if (!ready) return;
        const width = hero.clientWidth, height = hero.clientHeight;
        const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(720000 / Math.max(width * height, 1))) * resolutionScale;
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        gl.viewport(0, 0, canvas.width, canvas.height);
        draw(phase, 0);
    }
    function releasePointer() { target.x = target.y = 0; }
    function resetPointer() { releasePointer(); view.x = view.y = 0; }
    function draw(time, delta) {
        if (!ready || (delta && time - lastPaint < 1 / 30)) return;
        const elapsed = Math.max(0, time - lastPaint);
        lastPaint = phase = time;
        // Sustained slow frames lower only the decorative layer's resolution.
        slowFrames = delta > 0.043 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
        if (slowFrames > 24 && resolutionScale > 0.65) {
            resolutionScale = Math.max(0.65, resolutionScale - 0.15);
            slowFrames = 0;
            resize();
            return;
        }
        // Time-based damping keeps mouse response consistent across refresh rates.
        const ease = delta ? 1 - Math.exp(-elapsed / 0.16) : 1;
        view.x += (target.x - view.x) * ease;
        view.y += (target.y - view.y) * ease;
        const motion = sampleMotion(time, view.x, view.y);
        const progress = SiteMotion.enabled ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.clientHeight)) : 0;
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform3f(uniforms.pose, motion.spin, motion.tiltX, motion.tiltY);
        gl.uniform2f(uniforms.drift, motion.driftX, motion.driftY);
        gl.uniform1f(uniforms.time, time);
        gl.uniform1f(uniforms.scroll, progress);
        gl.uniform1f(uniforms.themeMix, window.SiteTheme?.amount || 0);
        if (window.SiteTheme) window.SiteTheme.phase = time;
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    hero.addEventListener('pointermove', event => {
        if (!ready || !finePointer.matches || !SiteMotion.enabled || event.pointerType === 'touch') return;
        const rect = hero.getBoundingClientRect();
        target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    }, { passive: true });
    hero.addEventListener('pointerleave', releasePointer);
    finePointer.addEventListener('change', resetPointer);
    const observer = new ResizeObserver(resize);
    observer.observe(hero);
    canvas.addEventListener('webglcontextlost', () => {
        ready = false;
        observer.disconnect();
        canvas.replaceWith(fallback);
        hero.dataset.core = 'fallback';
        window.initHeroFibers?.();
    });
    SiteMotion.subscribe(active => { if (!active) resetPointer(); });
    window.addEventListener('site-theme-change', () => draw(phase, 0));
    resize();
    SiteMotion.animate(hero, draw);
})();
