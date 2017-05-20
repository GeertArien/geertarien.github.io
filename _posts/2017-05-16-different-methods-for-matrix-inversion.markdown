---
layout: post
title:  "Different methods for matrix inversion"
date:   2017-05-15 12:33:47 +0100
categories: general
sidebar: true
text: true
math: true
download: matrix-inversion.zip
---
The inverse of a matrix is an important operation that is applicable only to
square matrices. Geometrically the inverse of a matrix is useful because it
allows us to compute the reverse of a transformation, i.e. a transformation that
undoes another transformation. There are several ways to calculate the inverse
of a matrix. We'll be taking a look at two well known methods, Gauss-Jordan
elimination and the adjoint method, and one lesser known method, the partition
method, and show how to implement these algorithms in C++ for a set of arbitrary
\\( 3 \times 3 \\) matrices.

We'll test the performance of our algorithms with an array of arbitrary
\\( 3 \times 3 \\) matrices for which we'll compute the inverse. An important
point to consider is that only **invertible/nonsingular** matrices have an inverse.
We can calculate and check the determinant of a matrix to see if it's invertible
or not, as the determinant of a singular matrix is zero and the determinant of a
nonsingular matrix is nonzero. We'll use a brute force method to generate our
arbitrary matrices, which means we'll keep generating random matrices until we
have enough matrices for which the determinant is nonzero (conveniently ignoring
the fact that we'll generate a few ill conditioned matrices that are nearly
singular).

We'll create a function that takes three arguments, a function pointer to
a function that returns (a random) integer and two floating-point numbers
\\(min\\) and \\(max\\). This function will returns a random \\( 3 \times 3 \\)
Matrix for which each element lies in the range \\([min, max]\\):

{% highlight cpp %}
#include <cmath>

Matrix generate_random_matrix(int random(), float min, float max)
{
  float m[3][3];

  for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++)
      m[i][j] = min + static_cast <float> (random())
                / (static_cast <float> (RAND_MAX / (max - min)));

  return Matrix(m[0][0], m[0][1], m[0][2], m[1][0], m[1][1],
                m[1][2], m[2][0], m[2][1], m[2][2]);
}
{% endhighlight %}

Next we'll call this function from our main program and check, using a tolerance
value, if the returned Matrix has a determinant which is nonzero. We keep
repeating this process until we have 1.000.000 invertible matrices. To calculate
the determinant of a \\( 3 \times 3 \\) matrix, we use the following formula:

$$
\begin{equation}
\begin{split}
det(A)& =\begin{vmatrix}
          a_{11} & a_{12} & a_{13} \\
          a_{21} & a_{22} & a_{23} \\
          a_{31} & a_{32} & a_{33} \\
           \end{vmatrix} \\
& =a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32}\\
& \quad - a_{13}a_{22}a_{31} - a_{12}a_{21}a_{33} - a_{11}a_{23}a_{32}\\
\end{split}
\end{equation}
$$

For the random integers we pass the `rand()` function from `<cstdlib>` to our
random matrix function. Because `rand()` is a pseudo-random number generator, we
need to seed it before we start using it. We do this by by calling `srand()`.

{% highlight cpp %}
#include <vector>
using std::vector;

#include <ctime>
#include <stdlib.h>
#include "matrix.h"

int main()
{
  vector<Matrix> matrices;

  srand(static_cast <unsigned> (time(0)));

  while (matrices.size() != 1000000)
  {
	  Matrix m = generate_random_matrix(rand(), -10.0f, 10.0f);

    if (abs(m.determinant()) > 0.001f)
      matrices.push_back(m);
  }

  ...
}
{% endhighlight %}

Now that we have our matrices, we can take a look at the different ways to
calculate the inverse.

## Gauss-Jordan Elimination

Gauss-Jordan Elimination is an extension of Gaussian Elimination, an algorithm
for solving systems of linear equations. Both algorithms make use row of
operations to solve the system, however the difference between the two is that
Gaussian Elimination helps to put a matrix in [row echelon form], while
Gauss-Jordan Elimination puts a matrix in [reduced row echelon form].
Gauss-Jordan Elimination is a much less efficient method for solving systems of
linear equations, compared to Gaussian Elimination, however it's an excellent
method for calculating the inverse of a Matrix.

As an example we'll calculate the inverse of the \\( 2 \times 2 \\) matrix A.

$$
A = \left[\begin{matrix}
  1 & 3 \\
  2 & 7 \\
\end{matrix}\right]
$$

First we adjoin the idendity matrix to the right side of A then we'll apply
row operations untill the matrix on the left side is reduced to the identity
matrix.

$$
\begin{align*}
&\left[\begin{array}{rr|rr}
  1 & 3 & 1 & 0 \\
  2 & 7 & 0 & 1 \\
\end{array}\right]
\\
\xrightarrow{\substack{R_2-2.R_1}}
&\left[\begin{array}{rr|rr}
  1 & 3 & 1 & 0 \\
  0 & 1 & -2 & 1 \\
\end{array}\right]
\\
\xrightarrow{\substack{R_1-3.R_2}}
&\left[\begin{array}{rr|rr}
  1 & 0 & 7 & -3 \\
  0 & 1 & -2 & 1 \\
\end{array}\right]
\end{align*}
$$

The inverse of matrix is A is the \\( 2 \times 2 \\) matrix on the right side.

$$
A^{-1} = \left[\begin{matrix}
  7 & -3 \\
  -2 & 1 \\
\end{matrix}\right]
$$

For our implementation we have split the algorithm into four distinct parts:

1. Adding a unit matrix to the right side of our matrix.
2. Partial pivoting to reduce [round-off errors], which is a negative side-effect
of the way numbers are stored on a computer.
3. Performing row operations to reduce our matrix to a diagonal matrix.
4. Reducing the diagonal matrix to a unit matrix.

We make the Gauss-Jordan inversion method a member of our matrix class, we pass
and return the output matrix as a reference, that way we avoid creating and
copying matrix objects during the function call.

{% highlight cpp %}
#include "matrix.h"

Matrix& Matrix::calculate_inverse_gause(Matrix& out) const
{
  int i, j, k;
  float copied[3][6] = { 0 }, d;

  for (i = 0; i < 3; i++)
    for (j = 0; j < 3; j++)
      copied[i][j] = data[i][j];

  copied[0][3] = 1;
  copied[1][4] = 1;
  copied[2][5] = 1;

  /************** partial pivoting **************/
  for (i = 2; i > 0; i--)
  {
    if (copied[i - 1][1] < copied[i][1])
      for (j = 0; j < 6; j++)
      {
        d = copied[i][j];
        copied[i][j] = copied[i - 1][j];
        copied[i - 1][j] = d;
      }
  }

  /********** reducing to diagonal  matrix ***********/
  for (i = 0; i < 3; i++)
  {
    for (j = 0; j < 3; j++)
      if (j != i && copied[j][i] != 0)
      {
        d = copied[j][i] / copied[i][i];
        for (k = 0; k < 6; k++)
          copied[j][k] -= copied[i][k] * d;
      }
  }

  /************** reducing to unit matrix *************/
  out.data[0][0] = copied[0][3] / copied[0][0];
  out.data[0][1] = copied[0][4] / copied[0][0];
  out.data[0][2] = copied[0][5] / copied[0][0];
  out.data[1][0] = copied[1][3] / copied[1][1];
  out.data[1][1] = copied[1][4] / copied[1][1];
  out.data[1][2] = copied[1][5] / copied[1][1];
  out.data[2][0] = copied[2][3] / copied[2][2];
  out.data[2][1] = copied[2][4] / copied[2][2];
  out.data[2][2] = copied[2][5] / copied[2][2];

  return out;
}
{% endhighlight %}

One of the advantages of this method is that it features fewer arithmetic
operations compared to other methods. The disadvantage is that if features quite
a lot of `if` statements and loops that cannot be unrolled. That's why this
method is preferred when working with large matrices or matrices with a
structure that can be exploited.

## Classical Adjoint method

The classical adjoint of a matrix A is the [transpose] of the matrix of cofactors
of A. Once we have the adjoint we can compute the inverse of A by
dividing the adjoint matrix by the determinant of A.

$$
A^{-1} = \frac{adj A}{|A|}
$$

We can compute the cofactors of a matrix by computing the corresponding [minor],
negating every other element.

$$
C^{ij} = (-1)^{i+j}M^{ij}
$$

Lets take a look at an example. We want to compute the inverse of the
\\( 3 \times 3 \\) matrix A.

$$
A = \begin{bmatrix}1 & 2 & 3\\ 0 & 1 & 4\\ 5 & 6 & 1\end{bmatrix}
$$

First we compute the cofactors of matrix A.

$$
\begin{align*}
&C^{11} = +\begin{vmatrix}1 & 4\\ 6 & 1\end{vmatrix} = -23
&&C^{12} = -\begin{vmatrix}0 & 4\\ 5 & 1\end{vmatrix} = 20\\
&C^{13} = +\begin{vmatrix}0 & 1\\ 5 & 6\end{vmatrix} = -5
&&C^{21} = -\begin{vmatrix}2 & 3\\ 6 & 1\end{vmatrix} = 16\\
&C^{22} = +\begin{vmatrix}1 & 3\\ 5 & 1\end{vmatrix} = -14
&&C^{23} = -\begin{vmatrix}1 & 2\\ 5 & 6\end{vmatrix} = 4\\
&C^{31} = +\begin{vmatrix}2 & 3\\ 1 & 4\end{vmatrix} = 5
&&C^{32} = -\begin{vmatrix}1 & 3\\ 0 & 4\end{vmatrix} = -4\\
&C^{33} = +\begin{vmatrix}1 & 2\\ 0 & 1\end{vmatrix} = 1\\
\end{align*}\\
$$

The classical adjoint is the **transpose** of the matrix of cofactors.

$$
\begin{align*}
adj A = \begin{bmatrix}C^{11} & C^{12} & C^{13}\\
                   C^{21} & C^{22} & C^{23}\\
                   C^{31} & C^{32} & C^{33}
                   \end{bmatrix}^T
      &= \begin{bmatrix}-23 & 20 & -5\\ 16 & -14 & 4\\ 5 & -4 & 1\end{bmatrix}^T\\
      &= \begin{bmatrix}-23 & 16 & 5\\ 20 & -14 & -4\\ -5 & 4 & 1\end{bmatrix}\\
\end{align*}
$$

Now we can compute the inverse by dividing the classical adjoint of A by the
determinant of A.

$$
\begin{align*}
A^{-1} = \frac{adj A}{|A|}
       &= \begin{bmatrix}-23 & 16 & 5\\ 20 & -14 & -4\\ -5 & 4 & 1\end{bmatrix} \frac{1}{2}\\
       &= \begin{bmatrix}-11.5 & 8 & 2.5\\ 10 & -7 & -2\\ -2.5 & 2 & 0.5\end{bmatrix}
\end{align*}
$$

The implementation of the classical adjoint method is very straight forward. All
we have to do is solve the equation for each element of the inverse matrix.

{% highlight cpp %}
#include "matrix.h"

Matrix& Matrix::calculate_inverse_adjoint(Matrix& out) const
{
  float det_inv = 1 / calculate_determinant();

  out.data[0][0] =  (data[1][1] * data[2][2]
                     - data[1][2] * data[2][1]) * det_inv;
  out.data[0][1] = -(data[0][1] * data[2][2]
                     - data[0][2] * data[2][1]) * det_inv;
  out.data[0][2] =  (data[0][1] * data[1][2]
                     - data[0][2] * data[1][1]) * det_inv;
  out.data[1][0] = -(data[1][0] * data[2][2]
                     - data[1][2] * data[2][0]) * det_inv;
  out.data[1][1] =  (data[0][0] * data[2][2]
                     - data[0][2] * data[2][0]) * det_inv;
  out.data[1][2] = -(data[0][0] * data[1][2]
                     - data[0][2] * data[1][0]) * det_inv;
  out.data[2][0] =  (data[1][0] * data[2][1]
                     - data[1][1] * data[2][0]) * det_inv;
  out.data[2][1] = -(data[0][0] * data[2][1]
                     - data[0][1] * data[2][0]) * det_inv;
  out.data[2][2] =  (data[0][0] * data[1][1]
                     - data[0][1] * data[1][0]) * det_inv;

  return out;
}
{% endhighlight %}

The classical adjoint method provides for a branchless implementation, this is a
big advantage when working on today's superscalar computer hardware. It's the
go to method when working with matrices of smaller order such as
\\( 2 \times 2 \\), \\( 3 \times 3 \\) and \\( 4 \times 4 \\) matrices. As such,
it is the method of choice in most geometric applications.

## Partition method

The [partition (or escalator) method][partition method] is a less famous recursive method for
computing the inverse of a square matrix. The partition method is based on the
fact that if the inverse of square matrix \\(A_{n}\\) of order n is known, then
the inverse of the matrix \\(A_{n+1}\\) can be obtained by adding (n+1)th row
and (n+1)th column to \\(A_{n}\\). We do this by, as the name of the method
suggests, partitioning our matrix into 4 smaller sub-matrices.

$$
\begin{align}
A_{n + 1} &=
\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} & \vdots & a_{1(n + 1)}\\
a_{21} & a_{22} & \cdots & a_{2n} & \vdots & a_{2(n + 1)}\\
\cdots & \cdots & \cdots & \cdots & \vdots & \cdots\\
a_{n1} & a_{n2} & \cdots & a_{nn} & \vdots & a_{n(n + 1)}\\
\cdots & \cdots & \cdots & \cdots & \vdots & \cdots \\
a_{(n + 1)1} & a_{(n + 1)2} & \cdots & a_{(n + 1)n} & \vdots & a_{(n + 1)(n + 1)}
\end{bmatrix}\\
&=
\left[\begin{array}{c|c}
  A_{n} & B_{n \times 1}\\
  \hline
  C_{1 \times n} & d
\end{array}
\right]
\end{align}
$$

with

$$
\begin{align*}
A_{n} &=
\begin{bmatrix}
  a_{11} & a_{12} & \cdots & a_{1n}\\
  a_{21} & a_{22} & \cdots & a_{2n}\\
  \cdots & \cdots & \cdots & \cdots\\
  a_{n1} & a_{n2} & \cdots & a_{nn}
\end{bmatrix}\quad
B_{n \times 1} =
\begin{bmatrix}
  a_{1(n + 1)}\\a_{2(n + 1)}\\
  \cdots \\
  a_{n(n + 1)}
\end{bmatrix}\\
C_{1\times n} &=
\begin{bmatrix}
  a_{(n + 1)1} & a_{(n + 1)2} & \cdots & a_{(n + 1)n}
\end{bmatrix}\\
d &= a_{(n + 1)(n + 1)}
\end{align*}
$$

Now we can calculate the inverse of matrix \\(A_{n}\\) using the classical
adjoint or Gauss-Jordan method. Once we have the inverse of matrix \\(A_{n}\\)
we can compute the inverse of the other sub-matrices of matrix \\(A_{n+1}\\)
using the following formulas.

$$
A_{n + 1} =
\left[\begin{array}{c|c}
  A & B\\
  \hline
  C & d
\end{array}
\right]
\qquad \qquad \qquad
A_{n + 1}^{-1} =
\left[\begin{array}{c|c}
  X & Y\\
  \hline
  Z & t
\end{array}
\right]
$$

$$
\begin{align}
t &= (d - CA^{-1}B)^{-1}\\
Y &= -A^{-1}Bt\\
Z &= -CA^{-1}t\\
X &= A^{-1}(I - BZ)
\end{align}
$$

For a more thorough explanation, please check out
[this excellent article][partition method] about the partition
method. Now, let's take a look at an example.

$$
A_3 =
\begin{bmatrix}
  1 & 2 & 3\\
  0 & 1 & 4\\
  5 & 6 & 1
\end{bmatrix}
= \left[\begin{array}{cc|c}
  1 & 2 & 3\\
  0 & 1 & 4\\
  \hline
  5 & 6 & 1
\end{array}
\right]
= \left[\begin{array}{c|c}
  A & B\\
  \hline
  C & d
\end{array}
\right]
$$

$$
A = \begin{bmatrix}1 & 2\\ 0 & 1\end{bmatrix}\quad
B = \begin{bmatrix}3\\ 4\end{bmatrix}\quad
C = \begin{bmatrix}5 & 6\end{bmatrix}\quad
d = 1
$$

First we compute the inverse of A by using the classical adjoint method.

$$
A^{-1} = \begin{bmatrix}1 & 2\\ 0 & 1\end{bmatrix}^{-1} =
         \begin{bmatrix}1 & -2\\ 0 & 1\end{bmatrix}
$$

Now that we have the inverse of A we can compute the inverse of the matrix
\\(A_{3}\\) using the above mentioned formulas.

$$
\begin{align}
t &= (d - CA^{-1}B)^{-1}\\
&= \left(1 - \begin{bmatrix}5 & 6\end{bmatrix}\begin{bmatrix}1 & -2\\ 0 & 1\end{bmatrix}\begin{bmatrix}3\\4\end{bmatrix}\right)^{-1}\\
&= 0.5\\
Y &= -A^{-1}Bt\\
&= -\begin{bmatrix}1 & -2\\ 0 & 1\end{bmatrix}\begin{bmatrix}3\\4\end{bmatrix} \frac{1}{2}
= \begin{bmatrix}2.5 \\ -2\end{bmatrix}\\
Z &= -CA^{-1}t\\
&= -\begin{bmatrix}5 & 6\end{bmatrix}\begin{bmatrix}1 & -2\\ 0 & 1\end{bmatrix} \frac{1}{2}
= \begin{bmatrix}-2.5 & 2\end{bmatrix}\\
X &= A^{-1}(I - BZ)\\
&= \begin{bmatrix}1 & -2\\ 0 & 1\end{bmatrix}\left(\begin{bmatrix}1 & 0\\ 0 & 1\end{bmatrix} - \begin{bmatrix}3\\4\end{bmatrix}\begin{bmatrix}-2.5 & 2\end{bmatrix}\right)\\
&= \begin{bmatrix}-11.5 & 8\\ 10 & -7\end{bmatrix}\end{align}
$$

Finally, putting everything together, we have the inverse matrix for the matrix
\\(A_{3}\\).

$$
\begin{align*}
A_{3}^{-1}
= \left[\begin{array}{c|c}
  X & Y\\
  \hline
  Z & t
\end{array}\right]
&= \left[\begin{array}{cc|c}
  -11.5 & 8 & 2.5 \\
  10 & -7 & -2 \\
  \hline
  -2.5 & 2 & 0.5
\end{array}\right]\\
&= \begin{bmatrix}
  -11.5 & 8 & 2.5 \\
  10 & -7 & -2 \\
  -2.5 & 2 & 0.5
\end{bmatrix}
\end{align*}
$$

For our implementation we follow the same procedure as in our example. First we
compute the inverse of submatrix A, next we solve the equation for each element
of the inverse matrix \\(A_{3}^{-1}\\).

{% highlight cpp %}
#include "matrix.h"

Matrix& Matrix::calculate_inverse_partition(Matrix& out) const
{
  float det_A_inv = 1 / (data[0][0] * data[1][1]
                         - data[0][1] * data[1][0]);
  float inv_A[2][2];

  inv_A[0][0] =  data[1][1] * det_A_inv;
  inv_A[0][1] = -data[0][1] * det_A_inv;
  inv_A[1][0] = -data[1][0] * det_A_inv;
  inv_A[1][1] =  data[0][0] * det_A_inv;

  // d
  out.data[2][2] = 1 / (data[2][2]
                        - (data[0][2] * data[2][0] * inv_A[0][0]
                           + data[0][2] * data[2][1] * inv_A[1][0]
                           + data[1][2] * data[2][0] * inv_A[0][1]
                           + data[1][2] * data[2][1] * inv_A[1][1]));

  // Y
  out.data[0][2] = -out.data[2][2] * (inv_A[0][0] * data[0][2]
                                      + inv_A[0][1] * data[1][2]);
  out.data[1][2] = -out.data[2][2] * (inv_A[1][0] * data[0][2]
                                      + inv_A[1][1] * data[1][2]);

  // Z
  out.data[2][0] = -out.data[2][2] * (data[2][0] * inv_A[0][0]
                                      + data[2][1] * inv_A[1][0]);
  out.data[2][1] = -out.data[2][2] * (data[2][0] * inv_A[0][1]
                                      + data[2][1] * inv_A[1][1]);

  // X
  out.data[0][0] = inv_A[0][0]
                   - inv_A[0][0] * data[0][2] * out.data[2][0]
                   - inv_A[0][1] * data[1][2] * out.data[2][0];
  out.data[0][1] = - inv_A[0][0] * data[0][2] * out.data[2][1]
                   + inv_A[0][1]
                   - inv_A[0][1] * data[1][2] * out.data[2][1];
  out.data[1][0] = inv_A[1][0]
                   - inv_A[1][0] * data[0][2] * out.data[2][0]
                   - inv_A[1][1] * data[1][2] * out.data[2][0];
  out.data[1][1] = -inv_A[1][0] * data[0][2] * out.data[2][1]
                   + inv_A[1][1]
                   - inv_A[1][1] * data[1][2] * out.data[2][1];

  return out;
}
{% endhighlight %}

The partition method is fairly complex compared to the other methods we have
covered. The main advantage that it provides is that it allows us to compute
the inverse of a matrix by recursively computing the inverses of smaller
sub-matrices. The method can also be combined with any other matrix inversion
method, as we have in our example and implementation with the classical adjoint
method.

## Performance

Now that we have implemented our 3 different methods, let's take a look at how
well they perform. We benchmark our implementation for a set of 1.000.000,
100.000 and 1.000 matrices, and show the time taken to invert them in
microseconds (μs).

|---
| # of matrices | Gauss-Jordan | Classical adjoint | Partition
|:-|:-:|:-:|:-:
| 1.000.000 | 506.193 μs | 408.457 μs | 398.056 μs
| 100.000 | 51.908 μs | 42.772 μs | 41.519 μs
| 1.000 | 544 μs | 427 μs | 421 μs
|---
{:.table}

As we can see, all three methods show similar performance. Our Gauss-Jordan
implementation is slightly slower in our benchmarks, yet this is by no means
proof that this method is slower for \\(3 \times 3\\) matrices, as our
implementations leaves plenty of room for optimization.

We can conclude that for matrices of smaller order, such as \\(3 \times 3\\) and
\\(4 \times 4\\) matrices, any of these three methods are viable and performant.
The classical adjoint method has the advantage that it's structure is more
optimized to benefit from parallel computing, while the Gauss-Jordan and
partitioning method are more suited for matrices of larger order.

You can use the download button below to download the complete project for this
article.

[row echelon form]: https://en.wikipedia.org/wiki/Row_echelon_form
[reduced row echelon form]: https://en.wikipedia.org/wiki/Row_echelon_form#Reduced_row_echelon_form
[round-off errors]: https://en.wikipedia.org/wiki/Pivot_element#Partial_and_complete_pivoting
[minor]: https://en.wikipedia.org/wiki/Minor_(linear_algebra)
[transpose]: https://en.wikipedia.org/wiki/Transpose
[partition method]: https://paramanands.blogspot.be/2012/08/matrix-inversion-partition-method.html
