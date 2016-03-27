'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var marked = require( 'marked' );
var config = require( './config.js' );
var sass = require('node-sass');

sass.render({
  file: 'scss/index.scss',
}, function(err, result) {
  console.log( err, result );
  if ( err ) {
    console.log( 'ERROR BUILDING SCSS' );
    return;
  }
  fs.writeFile(
    path.join( 'output', 'styles.css' ),
    result.css,
    function( err ) {}
  );
});


// Set the options for the marked processor
marked.setOptions( {
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
} );

var content, pattern;
var entries = [];
var clients = [];

var formatContent = function( content ) {
  content = marked( content.replace( /-{3,}/ig, '' ) );

  pattern = /(<p>{)(alt|analysis|ca|client|counselor|ms|pa)(})/g;
  content = content.replace( pattern, function( match, $1, $2 ) {
    return '<div class="' + $2 + '">\n<p>';
  } );

  pattern = /{\/(alt|analysis|ca|client|counselor|ms|pa)}<\/p>/g;
  content = content.replace( pattern, '</p>\n</div>' );

  return content;
};

var getTags = function( tagData ) {
  var tmp = tagData.split( '\n' );
  var tags = {};

  tmp.forEach( function( v ) {
    var tag = v.split( ': ' );
    if ( '' === tag[ 0 ] ) {
      return;
    }

    tags[ tag[ 0 ] ] = tag[ 1 ];
  } );

  return tags;
};

/**
 * [formatDate description]
 *
 * @todo  Use actual date functions
 *
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
var formatDate = function( date ) {
  date = date.split('-');
  date = changeMonth( +date[1] ) + ' ' + Math.round( date[2] ) + ', ' + date[0];
  return date;
};

var changeMonth = function( month ) {
  var months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October',
    'November', 'December'
  ];
  return months[ month - 1 ];
}

var sessionHeader = function( tags ) {
  var client = tags.client.split(' ');
  client.forEach( function( value, index ) {
    client[index] = value[0].toUpperCase() + value.substr(1);
  });

  client = client.join( ' ' );

  return `<div class="client-name">Client Name: ${client}</div>`;
}

var processFile = function( content, name ) {
  var tmp = content.split( '!!--' );
  var tags = getTags( tmp[ 0 ] );
  content = formatContent( tmp[ 1 ] );

  fs.writeFile(
    path.join( 'output', 'session--' + name + '.html' ),
    require('./partials/header.js')({ title: 'Session' }, config ) +
      sessionHeader( tags ) +
      '<div class="date">' + formatDate( tags.date ) + ' | ' + tags.time + '</div>' +
      content +
      require('./partials/footer.js')(),
    function( err ) {
      console.log( 'Preparing index file.' );
    } );

  if ( 'undefined' === typeof clients[ tags.client ] ) {
    clients[ tags.client ] = [];
  }

  clients[ tags.client ].push( {
    name: name,
    date: tags.date,
    time: tags.time,
    client: tags.client,
    summary: tags.summary || '',
  } );

  entries.push( {
    name: name,
    date: tags.date,
    time: tags.time,
    client: tags.client,
    summary: tags.summary || '',
  } );
};

var makeIndex = function( entries ) {
  entries = reverseSort( entries );

  var output = '';

  entries.forEach( function( v ) {
    output +=
      '<li><a href="session--' + v.name + '.html"><dt>' +
      v.date + ', ' + v.time +
      '<em>' + v.client + '</em>' +
      '</a></dt>';

    if ( '' !== v.summary ) {
      output += '<dd>' + v.summary + '</dd>';
    }

    output += '</li>\n';
  } );
  output = '<ul>\n' + output + '</ul>';
  fs.writeFile( path.join( 'output', 'index.html' ), output, function( err ) {
    console.log( 'Preparing index file.' );
  } );
};

var makeClientPages = function( clients ) {
  var output;
  Object.keys( clients ).forEach( function( value ) {
    console.log( value );
    output = '';
    clients[ value ] = reverseSort( clients[ value ] );
    clients[ value ].forEach( function( v ) {

      console.log( v );
    } )

  } );

};

var reverseSort = function( entries ) {
  return entries.sort( function( a, b ) {
    if ( a.date > b.date ) {
      return -1;
    }

    if ( a.date < b.date ) {
      return 1;
    }

    if ( a.time > b.time ) {
      return -1;
    }

    if ( a.time < b.time ) {
      return 1;
    }

    return 0;
  } );
};

fs.readdirSync( 'content' ).forEach( function( name ) {
  if ( !fs.statSync( path.join( 'content', name ) ).isFile ) {
    return;
  }

  content = fs.readFileSync( path.join( 'content', name ), 'utf-8' );

  // console.log( marked( content ) );
  processFile( content, name.replace( '.md', '' ) );
} );

// console.log(clients);
makeClientPages( clients );
makeIndex( entries );