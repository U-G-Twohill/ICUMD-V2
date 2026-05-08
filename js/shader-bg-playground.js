/**
 * WebGL Shader Background — Playground / Tuner version
 *
 * Uniform-based variant of shader-bg.js. Reads its config live from
 * window.__shaderConfig instead of a baked-at-compile-time data-shader
 * attribute, so all parameters update in real time as the user moves
 * sliders or picks colours.
 *
 * Only `lineCount` requires a shader recompile (GLSL ES 1.0 loop bounds
 * must be a constant expression). Everything else is a uniform updated
 * each frame, so dragging sliders is buttery-smooth.
 *
 * The playground page is the only consumer; production pages keep using
 * shader-bg.js (constants version) which is fractionally cheaper at runtime.
 */
(function() {
  'use strict';

  // Default shader config — all tunable parameters
  var DEFAULTS = {
    bgColor1:        [0.059, 0.075, 0.094, 1.0],
    bgColor2:        [0.06,  0.14,  0.28,  1.0],
    lineColor:       [0.0,   0.48,  1.0,   0.6],
    overallSpeed:    0.2,
    lineCount:       16,
    minLineWidth:    0.02,
    maxLineWidth:    0.2,
    lineFrequency:   0.2,
    lineAmplitude:   1.0,
    warpFrequency:   0.5,
    warpAmplitude:   1.0,
    offsetFrequency: 0.5,
    minOffsetSpread: 0.6,
    maxOffsetSpread: 2.0,
    scale:           5.0,
    glowSpread:      0.5,
    circleRadius:    0.01,
    circleBrightness: 4.0,
    circleSpacing:   25.0
  };

  // Initialise global config (preserves any pre-set values)
  if (!window.__shaderConfig) {
    window.__shaderConfig = {};
    for (var k in DEFAULTS) {
      window.__shaderConfig[k] = Array.isArray(DEFAULTS[k]) ? DEFAULTS[k].slice() : DEFAULTS[k];
    }
  }
  window.__shaderDefaults = DEFAULTS;

  // Module state
  var gl, canvas, program, positionBuffer;
  var uniforms = {};
  var aPosition = null;
  var animationId = null;
  var startTime = null;
  var currentLineCount = window.__shaderConfig.lineCount;

  // Vertex shader (passthrough, fullscreen quad)
  var vsSource = [
    'attribute vec2 a_position;',
    'void main() {',
    '  gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
  ].join('\n');

  // Build fragment shader for a given lineCount (baked as the loop bound)
  function buildFragmentShader(lineCount) {
    return [
      'precision mediump float;',
      'uniform vec2 u_resolution;',
      'uniform float u_time;',
      '',
      'uniform vec4 u_bgColor1;',
      'uniform vec4 u_bgColor2;',
      'uniform vec4 u_lineColor;',
      'uniform float u_overallSpeed;',
      'uniform float u_scale;',
      'uniform float u_minLineWidth;',
      'uniform float u_maxLineWidth;',
      'uniform float u_lineFrequency;',
      'uniform float u_lineAmplitude;',
      'uniform float u_warpFrequency;',
      'uniform float u_warpAmplitude;',
      'uniform float u_offsetFrequency;',
      'uniform float u_minOffsetSpread;',
      'uniform float u_maxOffsetSpread;',
      'uniform float u_glowSpread;',
      'uniform float u_circleRadius;',
      'uniform float u_circleBrightness;',
      'uniform float u_circleSpacing;',
      '',
      'const float gridSmoothWidth = 0.015;',
      'const int linesPerGroup = ' + Math.max(1, Math.round(lineCount)) + ';',
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
      '  float lineSpeed = 1.0 * u_overallSpeed;',
      '  return random(x * u_lineFrequency + u_time * lineSpeed) * horizontalFade * u_lineAmplitude + offset;',
      '}',
      '',
      'void main() {',
      '  float lineSpeed = 1.0 * u_overallSpeed;',
      '  float warpSpeed = 0.2 * u_overallSpeed;',
      '  float offsetSpeed = 1.33 * u_overallSpeed;',
      '',
      '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;',
      '  vec2 space = (gl_FragCoord.xy - u_resolution.xy / 2.0) / u_resolution.x * 2.0 * u_scale;',
      '',
      '  float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);',
      '  float verticalFade   = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);',
      '',
      '  space.y += random(space.x * u_warpFrequency + u_time * warpSpeed) * u_warpAmplitude * (0.5 + horizontalFade);',
      '  space.x += random(space.y * u_warpFrequency + u_time * warpSpeed + 2.0) * u_warpAmplitude * horizontalFade;',
      '',
      '  vec4 lines = vec4(0.0);',
      '',
      '  for (int l = 0; l < linesPerGroup; l++) {',
      '    float normalizedLineIndex = float(l) / float(linesPerGroup);',
      '    float offsetTime = u_time * offsetSpeed;',
      '    float offsetPosition = float(l) + space.x * u_offsetFrequency;',
      '    float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;',
      '    float halfWidth = mix(u_minLineWidth, u_maxLineWidth, rand * horizontalFade) / 2.0;',
      '    float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(u_minOffsetSpread, u_maxOffsetSpread, horizontalFade);',
      '    float linePosition = getPlasmaY(space.x, horizontalFade, offset);',
      '    float line = drawSmoothLine(linePosition, halfWidth, space.y) * u_glowSpread + drawCrispLine(linePosition, halfWidth * 0.15, space.y);',
      '',
      '    float circleX = mod(float(l) + u_time * lineSpeed, u_circleSpacing) - u_circleSpacing * 0.48;',
      '    vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));',
      '    float circle = drawCircle(circlePosition, u_circleRadius, space) * u_circleBrightness;',
      '',
      '    line = line + circle;',
      '    lines += line * u_lineColor * rand;',
      '  }',
      '',
      '  vec4 fragColor = mix(u_bgColor1, u_bgColor2, uv.x);',
      '  fragColor *= verticalFade;',
      '  fragColor.a = 1.0;',
      '  fragColor += lines;',
      '',
      '  gl_FragColor = fragColor;',
      '}'
    ].join('\n');
  }

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

  function rebuildProgram() {
    if (program) {
      gl.deleteProgram(program);
      program = null;
    }

    var vs = compileShader(gl.VERTEX_SHADER, vsSource);
    var fs = compileShader(gl.FRAGMENT_SHADER, buildFragmentShader(currentLineCount));
    if (!vs || !fs) return false;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader link error:', gl.getProgramInfoLog(program));
      return false;
    }

    aPosition          = gl.getAttribLocation(program, 'a_position');
    uniforms.resolution      = gl.getUniformLocation(program, 'u_resolution');
    uniforms.time            = gl.getUniformLocation(program, 'u_time');
    uniforms.bgColor1        = gl.getUniformLocation(program, 'u_bgColor1');
    uniforms.bgColor2        = gl.getUniformLocation(program, 'u_bgColor2');
    uniforms.lineColor       = gl.getUniformLocation(program, 'u_lineColor');
    uniforms.overallSpeed    = gl.getUniformLocation(program, 'u_overallSpeed');
    uniforms.scale           = gl.getUniformLocation(program, 'u_scale');
    uniforms.minLineWidth    = gl.getUniformLocation(program, 'u_minLineWidth');
    uniforms.maxLineWidth    = gl.getUniformLocation(program, 'u_maxLineWidth');
    uniforms.lineFrequency   = gl.getUniformLocation(program, 'u_lineFrequency');
    uniforms.lineAmplitude   = gl.getUniformLocation(program, 'u_lineAmplitude');
    uniforms.warpFrequency   = gl.getUniformLocation(program, 'u_warpFrequency');
    uniforms.warpAmplitude   = gl.getUniformLocation(program, 'u_warpAmplitude');
    uniforms.offsetFrequency = gl.getUniformLocation(program, 'u_offsetFrequency');
    uniforms.minOffsetSpread = gl.getUniformLocation(program, 'u_minOffsetSpread');
    uniforms.maxOffsetSpread = gl.getUniformLocation(program, 'u_maxOffsetSpread');
    uniforms.glowSpread       = gl.getUniformLocation(program, 'u_glowSpread');
    uniforms.circleRadius     = gl.getUniformLocation(program, 'u_circleRadius');
    uniforms.circleBrightness = gl.getUniformLocation(program, 'u_circleBrightness');
    uniforms.circleSpacing    = gl.getUniformLocation(program, 'u_circleSpacing');

    return true;
  }

  function checkLineCountAndRebuild() {
    var requested = Math.max(1, Math.round(window.__shaderConfig.lineCount));
    if (requested !== currentLineCount) {
      currentLineCount = requested;
      rebuildProgram();
    }
  }

  function render() {
    var time = (performance.now() - startTime) / 1000.0;
    var cfg = window.__shaderConfig;

    checkLineCountAndRebuild();
    if (!program) {
      animationId = requestAnimationFrame(render);
      return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time);
    gl.uniform4fv(uniforms.bgColor1, cfg.bgColor1);
    gl.uniform4fv(uniforms.bgColor2, cfg.bgColor2);
    gl.uniform4fv(uniforms.lineColor, cfg.lineColor);
    gl.uniform1f(uniforms.overallSpeed,    cfg.overallSpeed);
    gl.uniform1f(uniforms.scale,           cfg.scale);
    gl.uniform1f(uniforms.minLineWidth,    cfg.minLineWidth);
    gl.uniform1f(uniforms.maxLineWidth,    cfg.maxLineWidth);
    gl.uniform1f(uniforms.lineFrequency,   cfg.lineFrequency);
    gl.uniform1f(uniforms.lineAmplitude,   cfg.lineAmplitude);
    gl.uniform1f(uniforms.warpFrequency,   cfg.warpFrequency);
    gl.uniform1f(uniforms.warpAmplitude,   cfg.warpAmplitude);
    gl.uniform1f(uniforms.offsetFrequency, cfg.offsetFrequency);
    gl.uniform1f(uniforms.minOffsetSpread, cfg.minOffsetSpread);
    gl.uniform1f(uniforms.maxOffsetSpread, cfg.maxOffsetSpread);
    gl.uniform1f(uniforms.glowSpread,       cfg.glowSpread);
    gl.uniform1f(uniforms.circleRadius,     cfg.circleRadius);
    gl.uniform1f(uniforms.circleBrightness, cfg.circleBrightness);
    gl.uniform1f(uniforms.circleSpacing,    cfg.circleSpacing);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationId = requestAnimationFrame(render);
  }

  function init() {
    var header = document.querySelector('.header');
    if (!header) return;

    canvas = document.createElement('canvas');
    canvas.className = 'shader-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);

    gl = canvas.getContext('webgl');
    if (!gl) {
      canvas.remove();
      console.warn('WebGL not available — playground shader cannot run.');
      return;
    }

    header.classList.add('shader-active');

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,  1, 1
    ]), gl.STATIC_DRAW);

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = header.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(header);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    if (!rebuildProgram()) {
      canvas.remove();
      header.classList.remove('shader-active');
      return;
    }

    startTime = performance.now();
    render();

    document.addEventListener('visibilitychange', function() {
      if (document.hidden && animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      } else if (!document.hidden && !animationId) {
        startTime = performance.now();
        render();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
