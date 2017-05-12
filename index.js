const fs = require('fs');

const etag = require('etag');

const requestTransclude = (s, fn) => Promise.resolve(fn(s));
const requestTranscludeRequestHandler = (s, fn) => requestTransclude(s, fn)
  .then(makeRequestHandler);

const requestFileTransclude = (p, fn) => new Promise((accept, reject) => {
  fs.readFile(p, 'utf8', (err, s) => {
    if (!err) {
      accept(s);
    } else {
      reject(err);
    }
  })
})
  .then(s => requestTransclude(s, fn));
const requestFileTranscludeRequestHandler = (p, fn) => requestFileTransclude(p, fn)
  .then(makeRequestHandler);

const makeRequestHandler = s => (req, res, next) => {
  const d = new Buffer(s, 'utf8');
  d.etag = etag(d);

  const ifNoneMatch = req.get('If-None-Match');

  if (ifNoneMatch && ifNoneMatch.split(/,\s*/).some(etag => etag === d.etag)) {
    res.statusCode = 304;
    res.end();
  } else {
    res.set('Etag', d.etag);
    res.end(d);
  }
};

module.exports = {
  requestTransclude,
  requestTranscludeRequestHandler,
  requestFileTransclude,
  requestFileTranscludeRequestHandler,
  makeRequestHandler,
};
