var rimraf = require('rimraf');
var levelup = require('levelup');
var Schedule = require('..');
var tap = require('tap');

var delay = 0;

var scheduled;
var i = 0;

test('simple', function (t, db) {
  Schedule(db)
    .job('simple', function () {
      t.ok(true, 'job executed');
      t.end();
    })
    .run('simple', Date.now());
});

test('simple 2', function (t, db) {
  t.plan(2);
  var i = 0;

  Schedule(db)
    .job('simple', function (payload) {
      t.equal(payload, i++);
    })
    .run('simple', 0, Date.now() + 10)
    .run('simple', 1, Date.now() + 20);
});

test('repeat', function (t, db) {
  t.plan(2);

  var i = 0;
  Schedule(db)
    .job('repeat', function () {
      if (i++ == 0) {
        t.ok(true, 'job executed');
        this.run('repeat', Date.now());
      } else {
        t.ok(true, 'job repeated');
      }
    })
    .run('repeat', Date.now());
});

test('payload', function (t, db) {
  Schedule(db)
    .job('payload', function (payload) {
      t.equal(payload, 'foo');
      t.end();
    })
    .run('payload', 'foo', Date.now());
});

test('async w/ payload', function (t, db) {
  Schedule(db)
    .job('async', function (payload, done) {
      t.equal(payload, 'foo');
      done();
      // TODO better
      t.end();
    })
    .run('async', 'foo', Date.now());
});

test('error: job not found', function (t, db) {
  Schedule(db)
    .on('error', function (err) {
      t.ok(err);
      t.end();
    })
    .run('')
});

test('error: sync throw', function (t, db) {
  Schedule(db)
    .on('error', function (err) {
      t.ok(err);
      t.end();
    })
    .job('throws', function () { throw 'foo'; })
    .run('throws', Date.now());
});

test('error: async err', function (t, db) {
  Schedule(db)
    .on('error', function (err) {
      t.ok(err);
      t.end();
    })
    .job('async', function (_, done) { done(new Error()) })
    .run('async', Date.now());
});

function test (name, fn) {
  tap.test(name, function (t) {
    rimraf.sync(__dirname + '/db');
    var db = levelup(__dirname + '/db');
    t.end = db.close.bind(db, t.end.bind(t));
    fn(t, db);
  });
}
