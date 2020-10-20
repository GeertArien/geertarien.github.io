---
layout: post
title:  "LearnOpenGL examples"
tags: C rendering sokol opengl glsl
sidebar: true
text: true
description: Unofficial cross platform examples for learnopengl.com.
repo: learnopengl-examples
image: /assets/images/projects/learnopengl-examples.jpg
---
The tutorials you can find on [learnopengl.com][learnopengl] are a great way
to learn the basics of 3D rendering and get familiar with the OpenGL API. 
For simplicity's sake  I decided to implement them in C instead of C++. 
And instead of using raw opengl I used the [Sokol libraries][sokol],
which makes it a lot easier to support multiple platforms.

{% include image.html
name="refraction-backpack.jpg"
caption="A cubemap used as skybox and as an environment map for refraction."
alt="Refraction Backpack"
center=true
%}

The [Sokol libraries][sokol] are a set of simple [STB-style][stb] 
cross-platform libraries written in C. It provides us with all the 
functionality we need to write GUI applications that run on Windows, Linux, 
MacOS and WebAssembly. Sokol also supports iOS and Android, but I decided 
to ignore native builds for mobile platforms. A big motivation to use 
these libraries is the [WebAssembly][wasm] support, it allows us to compile 
the examples for the web and provide [live demos][live-demos].

[Sokol][sokol] comes with a simple 3D-API wrapper with support for 
multiple backends: GLES2/WebGL, GLES3/WebGL2, GL3.3, D3D11 and Metal. 
The shaders are written in GLSL v450 and cross-compiled to other shader
dialects using [sokol-shdc][sokol-shdc]. Under the hood 
[sokol-shdc][sokol-shdc] uses [glslang][glslang],
[SPIRV-tools][SPIRV-tools] and [SPIRV-Cross][SPIRV-Cross] for compiling
the shader first from GLSL to SPIR-V and then from SPIR-V to the target 
shader dialect. 

For the [live demos][live-demos] I took a lot of inspiration from the 
[sokol samples website][sokol-samples]. I copied most of the webpage
generator and template code from that project, making some small
adjustments to style and layout.

This project is still a work in progress and will be updated regularly.
In the meantime you can find live demos of all implemented examples at 
the link below:

[Live Demos][live-demos]

[learnopengl]: https://learnopengl.com
[sokol]: https://github.com/floooh/sokol
[stb]: https://github.com/nothings/stb
[wasm]: https://webassembly.org/
[sokol-samples]: https://floooh.github.io/sokol-html5/index.html
[live-demos]: https://www.geertarien.com/learnopengl-examples-html5/
[sokol-shdc]: https://github.com/floooh/sokol-tools/blob/master/docs/sokol-shdc.md
[glslang]: https://github.com/KhronosGroup/glslang
[SPIRV-tools]: https://github.com/KhronosGroup/SPIRV-Tools
[SPIRV-Cross]: https://github.com/KhronosGroup/SPIRV-Cross
