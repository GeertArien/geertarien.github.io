function createCube(size)
{
  this.colorFaces = vec4(0.0, 0.0, 0.0, 1.0);
  this.colorEdges = vec4(0.0, 0.0, 0.0, 1.0);

  this.count_vertices_faces = 6 * 6;
  this.count_vertices_edges = 6 * 8;

  var pos =  size / 2.0;

  this.vertices = [
      vec4( -pos, -pos, pos, 1.0 ),
      vec4( -pos, pos, pos, 1.0 ),
      vec4( pos, pos, pos, 1.0 ),
      vec4( pos, -pos, pos, 1.0 ),
      vec4( -pos, -pos, -pos, 1.0 ),
      vec4( -pos, pos, -pos, 1.0 ),
      vec4( pos, pos, -pos, 1.0 ),
      vec4( pos, -pos, -pos, 1.0 )
  ];


  this.faces_as_triangles = function (normals = false)
  {
    var arr = [];

    this._quad_triangles( arr, normals, 1, 2, 6, 5 );
    this._quad_triangles( arr, normals, 5, 4, 0, 1 );
    this._quad_triangles( arr, normals, 1, 0, 3, 2 );
    this._quad_triangles( arr, normals, 2, 3, 7, 6 );
    this._quad_triangles( arr, normals, 7, 3, 0, 4 );
    this._quad_triangles( arr, normals, 7, 4, 5, 6 );

    return arr;
  }

  this._quad_triangles = function(arr, normals, a, b, c, d)
  {
    var t1 = vec4(subtract(this.vertices[b], this.vertices[a]));
    var t2 = vec4(subtract(this.vertices[c], this.vertices[b]));
    var normal = vec4(normalize(cross(t1, t2)));
    normal[3] = 0.0;

    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        arr.push( this.vertices[indices[i]] );
        if (normals)
        {
            normals.push(normal);
        }
    }
  }

  this.edges_as_line_segments = function ()
  {
    var arr = [];

    this._square_line_segments( arr, 1, 2, 6, 5 );
    this._square_line_segments( arr, 5, 4, 0, 1 );
    this._square_line_segments( arr, 1, 0, 3, 2 );
    this._square_line_segments( arr, 2, 3, 7, 6 );
    this._square_line_segments( arr, 7, 3, 0, 4 );
    this._square_line_segments( arr, 7, 4, 5, 6 );

    return arr;
  }

  this._square_line_segments = function(arr, a, b, c, d)
  {
    var indices = [ a, b, b, c, c, d, d, a ];
    for ( var i = 0; i < indices.length; ++i ) {
        arr.push( this.vertices[indices[i]] );
    }
  }

  return this;
}
