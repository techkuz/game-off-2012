// Generated by CoffeeScript 1.3.3
var EmptyBlock, GamePlay, KeyboardController, LevelState, LevelView, Observable, PlatformBlock, SolidBlock, View, e3d, levels, loadTextures, mat, vec;

e3d = e3d || {};

e3d.Camera = function() {
  var aspect, eye, far, fovy, near, target, up;
  this.position = [0, 0, 0];
  this.rotation = [0, 0, 0];
  this.distance = 0;
  fovy = 45;
  aspect = e3d.width / e3d.height;
  near = 0.1;
  far = 100;
  eye = [0, 0, 0];
  target = [0, -1, 0];
  up = [0, 0, 1];
  this.createMatrix = function() {
    var matrix;
    matrix = mat.perspective(fovy, aspect, near, far);
    matrix = mat.lookat(matrix, eye, target, up);
    matrix = mat.translate(matrix, [0, -this.distance, 0]);
    matrix = mat.rotateX(matrix, -this.rotation[0]);
    matrix = mat.rotateY(matrix, -this.rotation[1]);
    matrix = mat.rotateZ(matrix, -this.rotation[2]);
    matrix = mat.translate(matrix, vec.neg(this.position));
    return matrix;
  };
};

e3d = e3d || {};

e3d.init = function(canvas) {
  var gl;
  gl = canvas.getContext('experimental-webgl', {
    alpha: false
  });
  gl.enable(gl.DEPTH_TEST);
  e3d.width = canvas.width;
  e3d.height = canvas.height;
  e3d.gl = gl;
  e3d.scene = null;
  e3d.noTexture = new e3d.Texture(null);
  e3d.onrender = null;
  return e3d.program.mesh.init();
};

e3d.run = function() {
  var frame, requestAnimationFrame;
  requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
  frame = function() {
    var gl;
    requestAnimationFrame(frame);
    gl = e3d.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (e3d.scene != null) {
      e3d.scene.render();
    }
    if (e3d.onrender != null) {
      return e3d.onrender();
    }
  };
  return requestAnimationFrame(frame);
};

mat = {
  row: function(m, i) {
    return [m[i * 4 + 0], m[i * 4 + 1], m[i * 4 + 2], m[i * 4 + 3]];
  },
  col: function(m, i) {
    return [m[i + 4 * 0], m[i + 4 * 1], m[i + 4 * 2], m[i + 4 * 3]];
  },
  mul: function(a, b) {
    var c0, c1, c2, c3, dot, r0, r1, r2, r3;
    c0 = mat.col(a, 0);
    c1 = mat.col(a, 1);
    c2 = mat.col(a, 2);
    c3 = mat.col(a, 3);
    r0 = mat.row(b, 0);
    r1 = mat.row(b, 1);
    r2 = mat.row(b, 2);
    r3 = mat.row(b, 3);
    dot = vec.dot4;
    return [dot(c0, r0), dot(c1, r0), dot(c2, r0), dot(c3, r0), dot(c0, r1), dot(c1, r1), dot(c2, r1), dot(c3, r1), dot(c0, r2), dot(c1, r2), dot(c2, r2), dot(c3, r2), dot(c0, r3), dot(c1, r3), dot(c2, r3), dot(c3, r3)];
  },
  translate: function(m, v) {
    var t;
    t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, v[0], v[1], v[2], 1];
    return mat.mul(m, t);
  },
  scale: function(m, v) {
    var s;
    s = [v[0], 0, 0, 0, 0, v[1], 0, 0, 0, 0, v[2], 0, 0, 0, 0, 1];
    return mat.mul(m, s);
  },
  rotateX: function(m, a) {
    var c, r, s;
    s = Math.sin(a);
    c = Math.cos(a);
    r = [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    return mat.mul(m, r);
  },
  rotateY: function(m, a) {
    var c, r, s;
    s = Math.sin(a);
    c = Math.cos(a);
    r = [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
    return mat.mul(m, r);
  },
  rotateZ: function(m, a) {
    var c, r, s;
    s = Math.sin(a);
    c = Math.cos(a);
    r = [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    return mat.mul(m, r);
  },
  lookat: function(m, eye, target, up) {
    var dot, l, x, y, z;
    z = vec.unit(vec.sub(eye, target));
    x = vec.unit(vec.cross(z, up));
    y = vec.unit(vec.cross(x, z));
    dot = vec.dot;
    l = [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    return mat.mul(m, l);
  },
  identity: function() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },
  frustum: function(left, right, bottom, top, near, far) {
    var a00, a11, a20, a21, a22, a32;
    a00 = (near * 2) / (right - left);
    a11 = (near * 2) / (top - bottom);
    a20 = (right + left) / (right - left);
    a21 = (top + bottom) / (top - bottom);
    a22 = -(far + near) / (far - near);
    a32 = -(far * near * 2) / (far - near);
    return [a00, 0, 0, 0, 0, a11, 0, 0, a20, a21, a22, -1, 0, 0, a32, 0];
  },
  perspective: function(fovy, aspect, near, far) {
    var right, top;
    top = near * Math.tan(fovy * Math.PI / 360);
    right = top * aspect;
    return mat.frustum(-right, right, -top, top, near, far);
  }
};

e3d = e3d || {};

e3d.Mesh = function(data) {
  var gl, nvertices, program, vertexbuffer;
  gl = e3d.gl;
  program = e3d.program.mesh;
  vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.vertexAttribPointer(program.aPositionLoc, 3, gl.FLOAT, false, 32, 0);
  gl.vertexAttribPointer(program.aTexCoordLoc, 2, gl.FLOAT, false, 32, 12);
  gl.vertexAttribPointer(program.aColorLoc, 3, gl.FLOAT, false, 32, 20);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  nvertices = data.length / 8;
  this.render = function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
    gl.vertexAttribPointer(program.aPositionLoc, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(program.aTexCoordLoc, 2, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(program.aColorLoc, 3, gl.FLOAT, false, 32, 20);
    return gl.drawArrays(gl.TRIANGLES, 0, nvertices);
  };
};

e3d = e3d || {};

e3d.Object = function() {
  var gl, program;
  gl = e3d.gl;
  program = e3d.program.mesh;
  this.position = [0, 0, 0];
  this.rotation = [0, 0, 0];
  this.scale = [1, 1, 1];
  this.meshes = [];
  this.textures = [];
  this.children = [];
  this.render = function(matrix) {
    var child, i, mesh, _i, _j, _len, _len1, _ref, _ref1, _results;
    matrix = mat.translate(matrix, this.position);
    matrix = mat.rotateX(matrix, this.rotation[0]);
    matrix = mat.rotateY(matrix, this.rotation[1]);
    matrix = mat.rotateZ(matrix, this.rotation[2]);
    matrix = mat.scale(matrix, this.scale);
    program.setMatrix(matrix);
    e3d.noTexture.use();
    _ref = this.meshes;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      mesh = _ref[i];
      if (mesh != null) {
        if (this.textures[i] != null) {
          this.textures[i].use();
        }
        mesh.render();
      }
    }
    _ref1 = this.children;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      child = _ref1[_j];
      if (child != null) {
        _results.push(child.render(matrix));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
};

e3d = e3d || {};

e3d.Scene = function() {
  var gl, program;
  gl = e3d.gl;
  program = e3d.program.mesh;
  this.objects = [];
  this.camera = null;
  this.render = function() {
    var matrix, object, _i, _len, _ref;
    if (this.camera != null) {
      program.begin();
      matrix = this.camera.createMatrix();
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        if (object != null) {
          object.render(matrix);
        }
      }
      return program.end();
    }
  };
};

e3d = e3d || {};

e3d.program = {
  mesh: {
    vertexSource: "uniform mat4 uMatrix;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nattribute vec3 aColor;\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\n\nvoid main() {\n\n  gl_Position = uMatrix * vec4(aPosition,1);\n  vTexCoord = aTexCoord;\n  vColor = aColor;\n\n}",
    fragmentSource: "precision mediump float;\n\nuniform sampler2D uTexture;\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\n\nvoid main() {\n\n  gl_FragColor = texture2D(uTexture, vTexCoord) * vec4(vColor,1);\n\n}",
    init: function() {
      var gl, me, program, uMatrixLoc, uTextureLoc;
      gl = e3d.gl;
      me = e3d.program.mesh;
      program = e3d.compileProgram(me.vertexSource, me.fragmentSource);
      uMatrixLoc = gl.getUniformLocation(program, 'uMatrix');
      uTextureLoc = gl.getUniformLocation(program, 'uTexture');
      me.aPositionLoc = gl.getAttribLocation(program, 'aPosition');
      me.aTexCoordLoc = gl.getAttribLocation(program, 'aTexCoord');
      me.aColorLoc = gl.getAttribLocation(program, 'aColor');
      gl.useProgram(program);
      gl.uniform1i(uTextureLoc, 0);
      gl.useProgram(null);
      me.setMatrix = function(matrix) {
        return gl.uniformMatrix4fv(uMatrixLoc, false, matrix);
      };
      me.begin = function() {
        gl.useProgram(program);
        gl.enableVertexAttribArray(me.aPositionLoc);
        gl.enableVertexAttribArray(me.aTexCoordLoc);
        return gl.enableVertexAttribArray(me.aColorLoc);
      };
      return me.end = function() {
        gl.disableVertexAttribArray(me.aPositionLoc);
        gl.disableVertexAttribArray(me.aTexCoordLoc);
        gl.disableVertexAttribArray(me.aColorLoc);
        return gl.useProgram(null);
      };
    }
  }
};

e3d.compileProgram = function(vertexSource, fragmentSource) {
  var compileShader, gl, program;
  gl = e3d.gl;
  compileShader = function(type, source) {
    var shader;
    shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
      throw "compileShader fail!";
    }
    return shader;
  };
  program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    throw "linkProgram fail!";
  }
  return program;
};

e3d = e3d || {};

e3d.Texture = function(image) {
  var gl, pixels, program, texture;
  gl = e3d.gl;
  program = e3d.program.mesh;
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  if (image != null) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this.width = image.width;
    this.height = image.height;
  } else {
    pixels = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    this.width = 0;
    this.height = 0;
  }
  this.use = function() {
    return gl.bindTexture(gl.TEXTURE_2D, texture);
  };
  this.free = function() {
    if (texture != null) {
      gl.deleteTexture(texture);
      return texture = null;
    }
  };
};

vec = {
  add: function(u, v) {
    return [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
  },
  sub: function(u, v) {
    return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
  },
  mul: function(v, k) {
    return [v[0] * k, v[1] * k, v[2] * k];
  },
  div: function(v, k) {
    return [v[0] / k, v[1] / k, v[2] / k];
  },
  neg: function(v) {
    return [-v[0], -v[1], -v[2]];
  },
  dot: function(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  },
  dot4: function(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3];
  },
  cross: function(u, v) {
    return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  },
  len: function(v) {
    return Math.sqrt(vec.dot(v, v));
  },
  unit: function(v) {
    return vec.div(v, vec.len(v));
  }
};

GamePlay = function() {
  var levelState;
  return levelState = new LevelState(levels.test);
};

KeyboardController = function() {};

levels = levels || {};

levels.test = [["OOOO", "OOOO", "OOO^", "XOOO"], ["OOOO", "OOOO", "OO ^", "    "]];

LevelState = function(levelData) {
  var block, blockArray, layer, row;
  blockArray = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = levelData.length; _i < _len; _i++) {
      layer = levelData[_i];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = layer.length; _j < _len1; _j++) {
          row = layer[_j];
          _results1.push((function() {
            var _k, _len2, _results2;
            _results2 = [];
            for (_k = 0, _len2 = row.length; _k < _len2; _k++) {
              block = row[_k];
              switch (block) {
                case 'O':
                  _results2.push(new SolidBlock());
                  break;
                case 'X':
                  _results2.push(new PlatformBlock());
                  break;
                default:
                  _results2.push(new EmptyBlock());
              }
            }
            return _results2;
          })());
        }
        return _results1;
      })());
    }
    return _results;
  })();
  this.height = blockArray.length;
  this.depth = blockArray[0].length;
  this.width = blockArray[0][0].length;
  this.forEachBlock = function(callback) {
    var x, y, z, _i, _len, _results;
    _results = [];
    for (z = _i = 0, _len = blockArray.length; _i < _len; z = ++_i) {
      layer = blockArray[z];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (y = _j = 0, _len1 = layer.length; _j < _len1; y = ++_j) {
          row = layer[y];
          _results1.push((function() {
            var _k, _len2, _results2;
            _results2 = [];
            for (x = _k = 0, _len2 = row.length; _k < _len2; x = ++_k) {
              block = row[x];
              _results2.push(callback(block, x, y, z));
            }
            return _results2;
          })());
        }
        return _results1;
      })());
    }
    return _results;
  };
  this.blockAt = function(x, y, z) {
    if (x < 0 || x >= this.width) {
      return new EmptyBlock;
    }
    if (y < 0 || y >= this.depth) {
      return new EmptyBlock;
    }
    if (z < 0 || z >= this.height) {
      return new EmptyBlock;
    }
    return blockArray[z][y][x];
  };
};

EmptyBlock = function() {
  this.empty = true;
};

SolidBlock = function() {
  this.empty = false;
};

PlatformBlock = function() {
  this.empty = false;
};

loadTextures = function(textureList, callback) {
  var index, nLoaded, nTotal, name, textures, _i, _len, _results;
  nTotal = textureList.length;
  nLoaded = 0;
  textures = [];
  _results = [];
  for (index = _i = 0, _len = textureList.length; _i < _len; index = ++_i) {
    name = textureList[index];
    _results.push((function(name, index) {
      var image;
      image = new Image;
      image.onload = function() {
        textures[index] = new e3d.Texture(image);
        if (++nLoaded === nTotal) {
          return callback(textures);
        }
      };
      return image.src = 'res/tex/' + name + '.png';
    })(name, index));
  }
  return _results;
};

LevelView = function() {
  var buildStaticModel, camera, currState, makeBackFace, makeFrontFace, makeLeftFace, makeQuad, makeRightFace, makeTopFace, scene, staticModel;
  staticModel = new e3d.Object;
  camera = new e3d.Camera;
  camera.distance = 16;
  camera.rotation = [0.5, 0, 0];
  scene = new e3d.Scene;
  scene.camera = camera;
  scene.objects = [staticModel];
  loadTextures(['wall', 'floor', 'platform'], function(textures) {
    staticModel.textures = textures;
    return e3d.scene = scene;
  });
  currState = null;
  this.update = function(levelState) {
    if (levelState !== currState) {
      currState = levelState;
      buildStaticModel(levelState);
      return camera.position = [levelState.width / 2, levelState.depth / 2, levelState.height / 2];
    }
  };
  makeQuad = function(positions, color) {
    var b, g, p, r, v;
    p = positions;
    r = color[0];
    g = color[1];
    b = color[2];
    v = [[p[0][0], p[0][1], p[0][2], 0, 0, r, g, b], [p[1][0], p[1][1], p[1][2], 1, 0, r, g, b], [p[2][0], p[2][1], p[2][2], 0, 1, r, g, b], [p[3][0], p[3][1], p[3][2], 1, 1, r, g, b]];
    return [].concat(v[0], v[1], v[2], v[3], v[2], v[1]);
  };
  makeLeftFace = function(x, y, z) {
    var color, positions;
    positions = [[x, y, z + 1], [x, y + 1, z + 1], [x, y, z], [x, y + 1, z]];
    color = [0.7, 0.7, 0.7];
    return makeQuad(positions, color);
  };
  makeRightFace = function(x, y, z) {
    var color, positions;
    positions = [[x + 1, y + 1, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z], [x + 1, y, z]];
    color = [0.8, 0.8, 0.8];
    return makeQuad(positions, color);
  };
  makeBackFace = function(x, y, z) {
    var color, positions;
    positions = [[x + 1, y, z + 1], [x, y, z + 1], [x + 1, y, z], [x, y, z]];
    color = [0.6, 0.6, 0.6];
    return makeQuad(positions, color);
  };
  makeFrontFace = function(x, y, z) {
    var color, positions;
    positions = [[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z], [x + 1, y + 1, z]];
    color = [0.9, 0.9, 0.9];
    return makeQuad(positions, color);
  };
  makeTopFace = function(x, y, z) {
    var color, positions;
    positions = [[x, y, z + 1], [x + 1, y, z + 1], [x, y + 1, z + 1], [x + 1, y + 1, z + 1]];
    color = [1.0, 1.0, 1.0];
    return makeQuad(positions, color);
  };
  buildStaticModel = function(levelState) {
    var platformTop, side, solidTop;
    side = [];
    solidTop = [];
    platformTop = [];
    levelState.forEachBlock(function(block, x, y, z) {
      var backBlock, frontBlock, leftBlock, rightBlock, topBlock;
      if (!block.empty) {
        leftBlock = levelState.blockAt(x - 1, y, z);
        rightBlock = levelState.blockAt(x + 1, y, z);
        backBlock = levelState.blockAt(x, y - 1, z);
        frontBlock = levelState.blockAt(x, y + 1, z);
        topBlock = levelState.blockAt(x, y, z + 1);
        if (leftBlock.empty) {
          side = side.concat(makeLeftFace(x, y, z));
        }
        if (rightBlock.empty) {
          side = side.concat(makeRightFace(x, y, z));
        }
        if (backBlock.empty) {
          side = side.concat(makeBackFace(x, y, z));
        }
        if (frontBlock.empty) {
          side = side.concat(makeFrontFace(x, y, z));
        }
        if (topBlock.empty) {
          if (block instanceof SolidBlock) {
            solidTop = solidTop.concat(makeTopFace(x, y, z));
          }
          if (block instanceof PlatformBlock) {
            return platformTop = platformTop.concat(makeTopFace(x, y, z));
          }
        }
      }
    });
    return staticModel.meshes = [new e3d.Mesh(side), new e3d.Mesh(solidTop), new e3d.Mesh(platformTop)];
  };
};

Observable = function() {
  this.observerList = [];
  return this.notifyObservers = function(context) {
    var observer, _i, _len, _ref, _results;
    _ref = this.observerList;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      observer = _ref[_i];
      if (observer != null) {
        _results.push(observer.update(context));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
};

View = function(canvas) {
  e3d.init(canvas);
  this.level = null;
  return this.update = function(context) {};
};
