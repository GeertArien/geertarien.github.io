---
layout: post
title:  "Learn OpenGL examples"
tags: C rendering opengl
sidebar: true
text: true
description: Unofficial cross platform examples for learnopengl.com.
repo: learnopeng-examples
image: /assets/images/projects/c-accelerated-exercises.jpg
---
The tutorials you can find on [learnopengl.com][learnopengl] are a great way
to learn the opengl rendering API. For simplicity's sake  I decided to
implement them in C instead of C++. And to support multiple patforms I used
the [Sokol cross-platform libraries][sokol-libraries].

{% include image.html
name="refractionn-backpack.jpg"
caption="A cubemap used as skybox and as environment map for refraction."
alt="Refraction Backpack"
center=true
%}

The sokol libraries are a set of simple STB-style cross-platform libraries 
written in C. It provides us with all the functionality we need to write
GUI applications that run on Windows, Linux, MacOS and WebAssembly. Sokol 
also supports iOS and Android, but I decided to ignore those platforms for 
now. A big motivation to use these libraries is the WebAssembly support, it
allows me to compile the examples for the web and provide 
[live demos][live-demos].

[learnopengl]: https://learnopengl.com
[sokol-libraries]: https://github.com/floooh/sokol
[live-demos]: https://www.geertarien.com/learnopengl-examples-html5/
