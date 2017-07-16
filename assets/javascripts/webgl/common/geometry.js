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


  this.faces_as_triangles = function ()
  {
    var arr = [];

    this._quad_triangles( arr, 1, 2, 6, 5 );
    this._quad_triangles( arr, 5, 4, 0, 1 );
    this._quad_triangles( arr, 1, 0, 3, 2 );
    this._quad_triangles( arr, 2, 3, 7, 6 );
    this._quad_triangles( arr, 7, 3, 0, 4 );
    this._quad_triangles( arr, 7, 4, 5, 6 );

    return arr;
  }

  this._quad_triangles = function(arr, a, b, c, d)
  {
      var indices = [ a, b, c, a, c, d ];
      for ( var i = 0; i < indices.length; ++i ) {
          arr.push( this.vertices[indices[i]] );
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
