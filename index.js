'use strict';

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const sass = require('node-sass');
const config = require('./config.js');
const header = require('./partials/header.js');
const footer = require('./partials/footer.js');

/*******************************************************************************
 * Set configuration and some global variables
 ******************************************************************************/

// Set the options for the marked processor
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
});

const entries = [];
const clients = [];

const tags = ['overview', 'fh', 'ss', 'mh', 'ph', 'ew', 'pp', 'tp', 't', 'ct', 'alt', 'analysis', 'ca', 'client', 'counselor', 'ms', 'pa'];

const opening = new RegExp(`<p>({)(${tags.join('|')})(})`, 'g');
const closing = new RegExp(`{\/(${tags.join('|')})}<\/p>`, 'g');

function renderSass(writeFile = false) {
  return new Promise((res, rej) => {
    sass.render(
      {
        file: path.resolve(__dirname, 'scss/index.scss'),
        omitSourceMapUrl: true,
        outputStyle: 'compressed',
      },
      (err, result) => {
        if (err) {
          return console.log('ERROR BUILDING SCSS', err);
          rej(err);
        }
        if (!writeFile) {
          return res(result.css);
        }

        fs.writeFile(path.join('output', 'styles.css'), result.css, error => {
          if (error) {
            console.log('ERROR WRITING SCSS', error);
          }
          res(result.css);
        });
      }
    );
  });
}

const formatContent = function(content) {
  const index = tags.reduce((acc, val) => ({ ...acc, [val]: 0 }), {});
  // Convert markdown to html
  return (
    marked(content.replace(/-{3,}/gi, ''))
      // replace the opening tags with the matched classnames
      .replace(opening, (match, _, tag) => {
        // put in the name but also put in an h3 at the top of each block
        return `${ 'counselor' === tag ? '<h3 style="text-align:center">[' + ++index[tag] + ']</h3>' : '' }<div class="${ tag }">\n<p>`;
      })
      // convert the closing tags
      .replace(closing, '</p>\n</div>')
  );
};

const getTags = function(tagData) {
  var tmp = tagData.split('\n');
  var tags = {};

  tmp.forEach(function(v) {
    var tag = v.split(': ');
    if ('' === tag[0]) {
      return;
    }

    tags[tag[0]] = tag[1];
  });

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
var formatDate = function(date) {
  date = date.split('-');
  date = changeMonth(+date[1]) + ' ' + Math.round(date[2]) + ', ' + date[0];
  return date;
};

var changeMonth = function(month) {
  var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1];
};

var sessionHeader = function(tags) {
  var client = tags.client.split(' ');
  client.forEach(function(value, index) {
    client[index] = value[0].toUpperCase() + value.substr(1);
  });

  client = client.join(' ');

  return `
<div class="counselor-name">${config.name}</div>
<div class="session-header-title">
  <div class="client-name">${client} — </div>
  <div class="date">${formatDate(tags.date)} | ${tags.time}</div>
</div>`.trim();
};

var processFile = function(content, name, css) {
  var tmp = content.split('!!--');
  var tags = getTags(tmp[0]);
  // content = formatContent( tmp[ 1 ] );

  const rendered =
    header({ title: 'Session', css: css }, config) +
    sessionHeader(tags) +
    formatContent(tmp[1]) +
    footer();
  const basename = path.join('output', 'session--' + name);
  const file = basename + '.html';

  fs.writeFile(file, rendered, err => {
    if (err) {
      console.log(err);
    }
  });

  if ('undefined' === typeof clients[tags.client]) {
    clients[tags.client] = [];
  }

  clients[tags.client].push({
    name: name,
    date: tags.date,
    time: tags.time,
    client: tags.client,
    summary: tags.summary || '',
  });

  entries.push({
    name: name,
    date: tags.date,
    time: tags.time,
    client: tags.client,
    summary: tags.summary || '',
  });
};

function makeIndex(entries) {
  entries = reverseSort(entries);

  var output = '';

  entries.forEach((v) => {
    output +=
      '<li><a href="session--' +
      v.name +
      '.html"><dt>' +
      v.date +
      ', ' +
      v.time +
      ' <em>' +
      v.client +
      '</em>' +
      '</a></dt>';

    if ('' !== v.summary) {
      output += '<dd>' + v.summary + '</dd>';
    }

    output += '</li>\n';
  });
  output = '<ul>\n' + output + '</ul>';
  fs.writeFile(path.join('output', 'index.html'), output, (err) => {
    console.log('Preparing index file.');
  });
};

function reverseSort(entries) {
  return entries.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    }

    if (a.date < b.date) {
      return 1;
    }

    if (a.time > b.time) {
      return -1;
    }

    if (a.time < b.time) {
      return 1;
    }

    return 0;
  });
};

/**
 * Main
 *
 * Process the sass first so that we can inline it into each page
 */

renderSass().then(css => {
  fs.readdirSync('content').forEach(function(name) {
    if (fs.statSync(path.join('content', name)).isFile) {
      if ( '.md' !== path.extname( path.join( 'content', name ) ) ) {
        return;
      }
      const content = fs.readFileSync(path.join('content', name), 'utf-8');
      processFile(content, name.replace('.md', ''), css);
    }
  });

  makeIndex(entries);
});
