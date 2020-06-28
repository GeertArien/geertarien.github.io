---
layout: post
title:  "Breakdown of the LookAt function in OpenGL"
date:   2017-07-30 11:33:47 +0100
categories: general
sidebar: true
text: true
math: true
---
The LookAt function in OpenGL creates a view matrix that transforms vertices
from world space to camera space. It takes three vectors as arguments that
together describe the position and orientation of a camera. It's a simple
yet effective function that's interesting to dissect as it applies a couple of
interesting properties concerning vector operations and orthogonal matrices.

The [LookAt function] was originally part of the [OpenGL Utility library (GLU)][GLU],
an utility library for OpenGL that is now outdated. The function
was used to update the internal model-view matrix using the [LookAt camera model].
With the release of version 3.0 in 2008, OpenGL moved away from the [fixed
function pipeline], which is often referred to as [legacy OpenGL] now, in favor of
a programmable, [shader] based, pipeline. This meant most concepts and elements
concerning the fixed function pipeline were declared deprecated, including the
LookAt function from the GLU library.

In a programmable pipeline there is no internal model-view matrix, we have
to manage the matrices ourselves and load them to our shaders when necessary.
This means we need to create our own LookAt function if we want to use the
LookAt camere model. The source code for the function is quite short as shown
below.

{% highlight cpp %}
mat4 LookAt(vec3 eye, vec3 at, vec3 up)
{
  vec3 zaxis = normalize(at - eye);    
  vec3 xaxis = normalize(cross(zaxis, up));
  vec3 yaxis = cross(xaxis, zaxis);

  negate(zaxis);

  mat4 viewMatrix = {
    vec4(xaxis.x, xaxis.y, xaxis.z, -dot(xaxis, eye)),
    vec4(yaxis.x, yaxis.y, yaxis.z, -dot(yaxis, eye)),
    vec4(zaxis.x, zaxis.y, zaxis.z, -dot(zaxis, eye)),
    vec4(0, 0, 0, 1)
  };

  return viewMatrix;
}
{% endhighlight %}

The function takes three vectors as arguments that together describe the
position and orientation of a camera in world space. The **eye** vector defines the
position of the camera, the **at** vector is the position where the camera is
looking at and the **up** vector specifies the up direction of the camera. Using
these three vectors we can construct a set of [orthonormal basis vectors] that
define the orientation of the camera coordinate system relative to the world
coordinate system. Using the orientation and position, which is the defined by
the *eye* vector, we can create an [affine transformation] matrix that transforms
vertices from camera space to world space. To do the reverse transformation,
moving the vertices from world space to camera space, we have to compute the inverse
of this affine transformation matrix.

We will be using a [right handed coordinate system] for the world and camera
space. Although with the programmable pipeline we are free to use whichever
coordinate system we prefer, the convention in OpenGL is to use a right handed
coordinate system in world and camera space, as this was the default setting
in legacy OpenGL. In world space the *x*-axis will be pointing east, the *y*-axis
up and the *z*-axis will be pointing south. In camera space the *x*-axis will be
pointing to the right, when looking in the direction of the camera, the *y*-axis
up and the *z*-axis will be pointing in the opposite direction of the camera, so
the camera will be looking in the negative *z* direction.

First we create the *z*-axis basis vector by subtracting the *eye* vector from the
*at* vector. We now have a vector that defines the displacement from the position 
where the camera is looking at to the position of the camera. All we need to do
now is [normalize] the vector to get the first basis vector.

{% highlight cpp %}
  vec3 zaxis = normalize(at - eye);
{% endhighlight %}

The *z*-axis basis vector we computed is pointing in the direction of the camera,
but as we stated above it should be pointing in the opposite direction. This
means we have to negate the *z*-axis basis vector we computed. However we will do
this after computing the other two basis vectors. In effect we are create a left
handed coordinate system with the *x*-axis pointing to the right, *y*-axis up and
*z*-axis in the direction of the camera. Finally we will transform this left
handed coordinate system into a right handed one by flipping the *z*-axis.

To compute the next basis vector we will use the [cross product], this yields
a vector that is **perpendicular** to the original two vectors, which is exactly
what we need. The order of the vectors is important as this determines in
which direction the perpendicular vector will point. We can determine in which
direction the vector will point by using the [right hand rule], right hand because
we are working in a right handed coordinate system. We also need to normalize
this vector because the up vector might not be a [unit vector].

{% highlight cpp %}
  vec3 xaxis = normalize(cross(zaxis, up));
{% endhighlight %}

We will compute the third basis vector by taking the cross product of the *x*-axis
and *z*-axis basis vectors. It's possible that this vector is the same as the up
vector that was passed as argument, but only if it is a unit vector [orthogonal]
to the vector from *eye* to *at*.

{% highlight cpp %}
  vec3 yaxis = cross(xaxis, zaxis);
{% endhighlight %}

Now we can negate the *z*-axis to become a right handed coordinate system with
the camera pointing in the negative *z* direction.

{% highlight cpp %}
  vec3 yaxis = cross(xaxis, zaxis);
{% endhighlight %}

With the orientation and the position of the camera specified, we can start
construction the affine transformation matrix that will transform vertices
from world space to camera space. An affine transformation is a [linear
transformation] followed by a [translation]. We can separate the linear
transformation and translations portions as shown below.

$$
\begin{align*}
M = TR &= \begin{bmatrix}
            1 & 0 & 0 & \Delta x\\
            0 & 1 & 0 & \Delta y\\
            0 & 0 & 1 & \Delta z\\
            0 & 0 & 0 & 1
          \end{bmatrix}
          \begin{bmatrix}
            r^{11} & r^{21} & r^{31} & 0\\
            r^{12} & r^{22} & r^{32} & 0\\
            r^{13} & r^{23} & r^{33} & 0\\
            0 & 0 & 0 & 1
          \end{bmatrix}\\
      &= \begin{bmatrix}
            r^{11} & r^{21} & r^{31} & \Delta x\\
            r^{12} & r^{22} & r^{32} & \Delta y\\
            r^{13} & r^{23} & r^{33} & \Delta z\\
            0 & 0 & 0 & 1
        \end{bmatrix}
\end{align*}
$$

It's important to keep in mind that the order of multiplication matters. OpenGL
uses [column vectors] by default, this means we need to read matrix
vector multiplication from right to left. So in the above example the linear
transformation would be applied first and then the translation.

Separating the affine transformation in a linear transformation and
translation portion makes it easier for us to compute its [inverse]. We will have
to reverse the order of the matrices, as the inverse of a matrix product is
equal to the product of the inverses of the matrices, taken in reverse order.

$$
(TR)^{-1} = R^{-1}T^{-1}
$$

First we'll compute the inverse of the linear transformation portion. In our
case this is the set of [orthonormal basis vectors] we just computed. Because a
set of orthonormal basis vectors form an [orthogonal matrix], its inverse is equal
to [transposing] the matrix.

$$
\begin{align*}
\mathbf R \ is \ orthogonal\\
\Leftrightarrow\\
\mathbf R^{-1} &= \mathbf R^T\\
      &= \begin{bmatrix}
            r^{11} & r^{21} & r^{31} & 0\\
            r^{12} & r^{22} & r^{32} & 0\\
            r^{13} & r^{23} & r^{33} & 0\\
            0 & 0 & 0 & 1
          \end{bmatrix}^{T}\\
      &= \begin{bmatrix}
            r^{11} & r^{12} & r^{13} & 0\\
            r^{21} & r^{22} & r^{23} & 0\\
            r^{23} & r^{32} & r^{33} & 0\\
            0 & 0 & 0 & 1
        \end{bmatrix}
\end{align*}
$$

Because we're using column vectors, the original transformation matrix contains
the basis vectors as columns of the matrix. By taking the transpose of
this matrix the basis vectors become the rows of the matrix.

Next up is the translation matrix. To compute its inverse we only need to negate
the translation components.

$$
\begin{align*}
\mathbf T^{-1}
      &= \begin{bmatrix}
            1 & 0 & 0 & \Delta x\\
            0 & 1 & 0 & \Delta y\\
            0 & 0 & 1 & \Delta z\\
            0 & 0 & 0 & 1
          \end{bmatrix}^{-1}\\
      &= \begin{bmatrix}
            1 & 0 & 0 & -\Delta x\\
            0 & 1 & 0 & -\Delta y\\
            0 & 0 & 1 & -\Delta z\\
            0 & 0 & 0 & 1
        \end{bmatrix}
\end{align*}
$$

Now we can combine the inverse of the linear transformation and the inverse of
the translation in one affine transformation. Because we have to reverse
the order of the matrix product when taking the inverse, we now need to multiply
the rows of the linear transformation matrix, the basis vectors, with the
columns of the translation matrix. For the linear transformation portion this
has no consequences, it remains unchanged. However for the right most column,
the translation component, we now need to multiply each basis vector with the
translation vector. Which is equal to taking the [dot product] of each basis
vector with the translation vector.

From a geometric point of view this makes sense as the dot product can be
interpreted as a **projection**. This means the dot product can be used to measure
displacement in a particular direction. In our case we measure the displacement
of the translation vector into the direction of each of the basis vectors.

We now have enough information to create the view matrix.

$$
\begin{align*}
&n \ = \ x\text{-}axis\\
&u \ = \ y\text{-}axis\\
&v \ = \ z\text{-}axis\\
&e \ = \ eye\\
\end{align*}
$$

$$
\begin{align*}
M^{-1} &= (TR)^{-1}\\
      &= R^{-1}T^{-1} \\
      &= \begin{bmatrix}
            n_{x} & u_{x} & v_{x} & 0\\
            n_{y} & u_{y} & v_{y} & 0\\
            n_{z} & u_{z} & v_{z} & 0\\
            0 & 0 & 0 & 1
          \end{bmatrix}^{-1}
          \begin{bmatrix}
            1 & 0 & 0 & e_{x}\\
            0 & 1 & 0 & e_{y}\\
            0 & 0 & 1 & e_{z}\\
            0 & 0 & 0 & 1
          \end{bmatrix}^{-1}\\
      &= \begin{bmatrix}
            n_{x} & n_{y} & n_{z} & 0\\
            u_{x} & u_{y} & u_{z} & 0\\
            v_{x} & v_{y} & v_{z} & 0\\
            0 & 0 & 0 & 1
          \end{bmatrix}
          \begin{bmatrix}
            1 & 0 & 0 & -e_{x}\\
            0 & 1 & 0 & -e_{y}\\
            0 & 0 & 1 & -e_{z}\\
            0 & 0 & 0 & 1
          \end{bmatrix}\\
      &= \begin{bmatrix}
            n_{x} & n_{y} & n_{z} & -(n \cdot e)\\
            u_{x} & u_{y} & u_{z} & -(u \cdot e)\\
            v_{x} & v_{y} & v_{z} & -(v \cdot e)\\
            0 & 0 & 0 & 1
          \end{bmatrix}\\      
\end{align*}
$$

Finally, in code this becomes:

{% highlight cpp %}
  mat4 viewMatrix = {
    vec4(xaxis.x, xaxis.y, xaxis.z, -dot(xaxis, eye)),
    vec4(yaxis.x, yaxis.y, yaxis.z, -dot(yaxis, eye)),
    vec4(zaxis.x, zaxis.y, zaxis.z, -dot(zaxis, eye)),
    vec4(0, 0, 0, 1)
  };
{% endhighlight %}

This concludes our overview of the LookAt function. If you have any questions
feel free to leave a comment below!

[LookAt function]: https://www.khronos.org/opengl/wiki/GluLookAt_code
[GLU]: https://en.wikipedia.org/wiki/OpenGL_Utility_Library
[LookAt camera model]: https://www.3dgep.com/understanding-the-view-matrix/#Look_At_Camera
[fixed function pipeline]: https://www.khronos.org/opengl/wiki/Fixed_Function_Pipeline
[legacy opengl]: https://www.khronos.org/opengl/wiki/Legacy_OpenGL
[shader]: https://www.khronos.org/opengl/wiki/Shader
[orthonormal basis vectors]: https://en.wikipedia.org/wiki/Orthonormal_basis
[affine transformation]: https://en.wikipedia.org/wiki/Affine_transformation
[right handed coordinate system]: http://mathworld.wolfram.com/Right-HandedCoordinateSystem.html
[normalize]: http://mathworld.wolfram.com/NormalizedVector.html
[cross product]: https://en.wikipedia.org/wiki/Cross_product
[right hand rule]: https://en.wikipedia.org/wiki/Right-hand_rule
[unit vector]: https://en.wikipedia.org/wiki/Unit_vector
[orthogonal]: https://en.wikipedia.org/wiki/Orthogonality
[linear transformation]: https://en.wikipedia.org/wiki/Transformation_matrix
[translation]: https://en.wikipedia.org/wiki/Translation_(geometry)
[inverse]: http://mathworld.wolfram.com/MatrixInverse.html
[orthogonal matrix]: https://en.wikipedia.org/wiki/Orthogonal_matrix
[transposing]: https://en.wikipedia.org/wiki/Transpose
[dot product]: https://en.wikipedia.org/wiki/Dot_product
[column vectors]: https://en.wikipedia.org/wiki/Row_and_column_vectors
