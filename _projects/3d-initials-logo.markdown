---
layout: post
title:  "3D Initials Logo"
tags: 3D 3DS-Max 3D-modeling Photoshop
sidebar: true
text: true
description: 3D model created and rendered in 3DS Max, post-production
             is done in Photoshop.
download: 3d-initials-logo.zip
image: /assets/images/projects/3d-initials-logo.jpg
---
Every website needs a logo, or so they say, so I went with the incredibly
original idea of turning my initials into 3D letters. Although I have a couple
years of working experience with [Solidworks][solidworks] and some experience
with [Blender][blender], I decided to create the logo using
[Autodesk 3ds Max][3ds-max] to broaden my horizon (and skill set).

{% include image.html
name="love-lock-monument-mas.jpg"
caption="The love lock monument at the MAS in Antwerp, a 10-storey museum close to where I work, was a source of inspiration for this project."
alt="Love lock monument MAS"
%}

This simple model consists of a text object that has been extruded using a
bevel modifier. After converting the text object to an editable poly, it was
further edited using insets, extrudes and chamfers to get the desired result.
Two different materials have been applied to the object using a Multi/Sub object
material, a standard material for the outside plastic hull and a mental ray
material for the interior glass section. Finally the two letters were separated
from each other to change their respective orientation.

{% include image.html
name="logo-collage.jpg"
caption="It took some experimentation with materials before getting the desired result."
alt="Logo collage"
%}

Besides the text objects, the scene consists of two omni lights, two directional
lights, a curved ground plane and a camera (obviously). The image is rendered
using [NVIDIA's mental ray renderer][mental-ray] and finally further edited
inside [Photoshop][photoshop]. The edits in Photoshop consists of small
modifications to the shadows and the replacement of the background with
transparency.

You can see the final result of this project at the top of this website. Or you
can use the download button below to take a look at the 3DS-Max and Photoshop
project files.

[solidworks]: http://www.solidworks.com/
[blender]: https://www.blender.org/
[3ds-max]: http://www.autodesk.nl/products/3ds-max/
[mental-ray]: http://www.nvidia.com/object/nvidia-mental-ray.html
[photoshop]: http://www.adobe.com/products/photoshop.html
