const fs = require('fs');

const etag = require('etag');

const requestTransclude = (p, fn) => new Promise((accept, reject) => {
  fs.readFile(p, 'utf8', (err, s) => {
    if (!err) {
      s = fn(s);
      const b = new Buffer(s, 'utf8');
      b.etag = etag(b);

      accept(b);
    } else {
      reject(err);
    }
  })
});

const requestTranscludeRequestHandler = (p, fn) => requestTransclude(p, fn)
  .then(d => (req, res, next) => {
    const ifNoneMatch = req.get('If-None-Match');

    if (ifNoneMatch && ifNoneMatch.split(/,\s*/).some(etag => etag === d.etag)) {
      res.statusCode = 304;
      res.end();
    } else {
      res.set('Etag', d.etag);
      res.end(d);
    }
  });

module.exports = {
  requestTransclude,
  requestTranscludeRequestHandler,
};
