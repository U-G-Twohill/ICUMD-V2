/**
 * WebGL Shader Background
 * Renders animated flowing lines behind .header on any page.
 * Per-page settings via data-shader='{ ... }' JSON on the <header> element.
 * Skips on mobile, no WebGL, or prefers-reduced-motion.
 * Pauses when header scrolls off screen or tab is hidden.
 *
 * Tuneable parameters (set via data-shader on each page's <header>):
 *
 *   COLORS (vec4 as [r, g, b, a] arrays, values 0.0–1.0):
 *     bgColor1        [0.059, 0.075, 0.094, 1.0]  Left background gradient
 *     bgColor2        [0.06, 0.14, 0.28, 1.0]     Right background gradient
 *     lineColor       [0.0, 0.48, 1.0, 0.6]       Line color + opacity
 *
 *   SPEED:
 *     overallSpeed    0.2       Master speed multiplier
 *
 *   LINES:
 *     lineCount       16        Number of flowing lines (int)
 *     minLineWidth    0.02      Thinnest line width
 *     maxLineWidth    0.2       Thickest line width
 *     lineFrequency   0.2       Wave oscillation frequency
 *     lineAmplitude   1.0       Wave height
 *
 *   WARP (organic distortion):
 *     warpFrequency   0.5       Distortion tightness
 *     warpAmplitude   1.0       Distortion strength (0 = no warp)
 *
 *   SPREAD:
 *     offsetFrequency 0.5       Positional variation along X
 *     minOffsetSpread 0.6       Min vertical spread between lines
 *     maxOffsetSpread 2.0       Max vertical spread
 *
 *   SCALE:
 *     scale           5.0       Zoom level (higher = more zoomed out)
 *
 * Example: <header class="header" data-shader='{"lineCount":10,"overallSpeed":0.1}'>
 */
(function() {
  'use strict';

  // Detect mobile for reduced shader settings
  var isMobile = window.innerWidth <= 768;

  // Skip if reduced motion is preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Check WebGL support
  var testCanvas = document.createElement('canvas');
  var testGl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  if (!testGl) return;
  testCanvas = null;
  testGl = null;

  // Default settings (reduced on mobile for performance)
  var DEFAULTS = {
    bgColor1:        [0.059, 0.075, 0.094, 1.0],
    bgColor2:        [0.06, 0.14, 0.28, 1.0],
    lineColor:       [0.0, 0.48, 1.0, isMobile ? 0.4 : 0.6],
    overallSpeed:    isMobile ? 0.12 : 0.2,
    lineCount:       isMobile ? 8 : 16,
    minLineWidth:    0.02,
    maxLineWidth:    0.2,
    lineFrequency:   0.2,
    lineAmplitude:   isMobile ? 0.8 : 1.0,
    warpFrequency:   0.5,
    warpAmplitude:   isMobile ? 0.6 : 1.0,
    offsetFrequency: 0.5,
    minOffsetSpread: 0.6,
    maxOffsetSpread: 2.0,
    scale:           5.0
  };

  function init() {
    var header = document.querySelector('.header');
    if (!header) return;

    // Parse per-page settings from data-shader attribute
    var cfg = {};
    var raw = header.getAttribute('data-shader');
    if (raw) {
      try { cfg = JSON.parse(raw); } catch(e) { console.warn('shader-bg: invalid data-shader JSON', e); }
    }

    // Merge with defaults
    var s = {};
    for (var key in DEFAULTS) {
      s[key] = cfg.hasOwnProperty(key) ? cfg[key] : DEFAULTS[key];
    }

    var canvas = document.createElement('canvas');
    canvas.className = 'shader-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);

    var gl = canvas.getContext('webgl');
    if (!gl) {
      canvas.remove();
      return;
    }

    header.classList.add('shader-active');

    // --- Shaders ---

    var vsSource = [
      'attribute vec2 a_position;',
      'void main() {',
      '  gl_Position = vec4(a_position, 0.0, 1.0);',
      '}'
    ].join('\n');

    // Build fragment shader with per-page values baked in as constants
    var bg1 = s.bgColor1, bg2 = s.bgColor2, lc = s.lineColor;

    var fsSource = [
      'precision mediump float;',
      'uniform vec2 u_resolution;',
      'uniform float u_time;',
      '',
      'const float overallSpeed = ' + s.overallSpeed.toFixed(4) + ';',
      'const float gridSmoothWidth = 0.015;',
      'const float scale = ' + s.scale.toFixed(4) + ';',
      'const float minLineWidth = ' + s.minLineWidth.toFixed(4) + ';',
      'const float maxLineWidth = ' + s.maxLineWidth.toFixed(4) + ';',
      'const float lineSpeed = 1.0 * overallSpeed;',
      'const float lineAmplitude = ' + s.lineAmplitude.toFixed(4) + ';',
      'const float lineFrequency = ' + s.lineFrequency.toFixed(4) + ';',
      'const float warpSpeed = 0.2 * overallSpeed;',
      'const float warpFrequency = ' + s.warpFrequency.toFixed(4) + ';',
      'const float warpAmplitude = ' + s.warpAmplitude.toFixed(4) + ';',
      'const float offsetFrequency = ' + s.offsetFrequency.toFixed(4) + ';',
      'const float offsetSpeed = 1.33 * overallSpeed;',
      'const float minOffsetSpread = ' + s.minOffsetSpread.toFixed(4) + ';',
      'const float maxOffsetSpread = ' + s.maxOffsetSpread.toFixed(4) + ';',
      'const int linesPerGroup = ' + Math.round(s.lineCount) + ';',
      '',
      'const vec4 lineColor = vec4(' + lc[0].toFixed(4) + ', ' + lc[1].toFixed(4) + ', ' + lc[2].toFixed(4) + ', ' + lc[3].toFixed(4) + ');',
      '',
      '#define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))',
      '#define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))',
      '#define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))',
      '',
      'float random(float t) {',
      '  return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;',
      '}',
      '',
      'float getPlasmaY(float x, float horizontalFade, float offset) {',
      '  return random(x * lineFrequency + u_time * lineSpeed) * horizontalFade * lineAmplitude + offset;',
      '}',
      '',
      'void main() {',
      '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;',
      '  vec2 space = (gl_FragCoord.xy - u_resolution.xy / 2.0) / u_resolution.x * 2.0 * scale;',
      '',
      '  float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);',
      '  float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);',
      '',
      '  space.y += random(space.x * warpFrequency + u_time * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);',
      '  space.x += random(space.y * warpFrequency + u_time * warpSpeed + 2.0) * warpAmplitude * horizontalFade;',
      '',
      '  vec4 lines = vec4(0.0);',
      '',
      '  vec4 bgColor1 = vec4(' + bg1[0].toFixed(4) + ', ' + bg1[1].toFixed(4) + ', ' + bg1[2].toFixed(4) + ', ' + bg1[3].toFixed(4) + ');',
      '  vec4 bgColor2 = vec4(' + bg2[0].toFixed(4) + ', ' + bg2[1].toFixed(4) + ', ' + bg2[2].toFixed(4) + ', ' + bg2[3].toFixed(4) + ');',
      '',
      '  for (int l = 0; l < linesPerGroup; l++) {',
      '    float normalizedLineIndex = float(l) / float(linesPerGroup);',
      '    float offsetTime = u_time * offsetSpeed;',
      '    float offsetPosition = float(l) + space.x * offsetFrequency;',
      '    float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;',
      '    float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;',
      '    float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);',
      '    float linePosition = getPlasmaY(space.x, horizontalFade, offset);',
      '    float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);',
      '',
      '    float circleX = mod(float(l) + u_time * lineSpeed, 25.0) - 12.0;',
      '    vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));',
      '    float circle = drawCircle(circlePosition, 0.01, space) * 4.0;',
      '',
      '    line = line + circle;',
      '    lines += line * lineColor * rand;',
      '  }',
      '',
      '  vec4 fragColor = mix(bgColor1, bgColor2, uv.x);',
      '  fragColor *= verticalFade;',
      '  fragColor.a = 1.0;',
      '  fragColor += lines;',
      '',
      '  gl_FragColor = fragColor;',
      '}'
    ].join('\n');

    // --- Shader compilation ---

    function compileShader(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    var vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
    var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
      canvas.remove();
      header.classList.remove('shader-active');
      return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(program));
      canvas.remove();
      header.classList.remove('shader-active');
      return;
    }

    // --- Geometry: fullscreen quad ---

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,  1, 1
    ]), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, 'a_position');
    var uResolution = gl.getUniformLocation(program, 'u_resolution');
    var uTime = gl.getUniformLocation(program, 'u_time');

    // --- Resize ---

    function resize() {
      var dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      var rect = header.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(header);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    // --- Animation loop ---

    var animationId = null;
    var startTime = performance.now();

    function render() {
      var time = (performance.now() - startTime) / 1000.0;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }

    // --- Visibility: pause when off-screen or tab hidden ---

    var headerVisible = false;

    function startRendering() {
      if (!animationId && headerVisible && !document.hidden) {
        startTime = performance.now();
        render();
      }
    }

    function stopRendering() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    var observer = new IntersectionObserver(function(entries) {
      headerVisible = entries[0].isIntersecting;
      if (headerVisible) {
        startRendering();
      } else {
        stopRendering();
      }
    }, { threshold: 0 });

    observer.observe(header);

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stopRendering();
      } else {
        startRendering();
      }
    });

    // --- Cleanup on navigation ---

    window.addEventListener('beforeunload', function() {
      if (animationId) cancelAnimationFrame(animationId);
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
