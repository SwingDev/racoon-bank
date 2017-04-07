const recluster = require('recluster');
const path = require('path');

const workerPath = path.resolve(path.join(__dirname, 'server.js'));
const workerCount = process.env.WORKERS_NUM || 1;
console.log("Starting cluster for " + workerPath + " with " + workerCount +  " workers.");
const cluster = recluster(workerPath, {
    workers: workerCount,
    readyWhen: 'listening',
    timeout: 30,
    backoff: 5000
});
cluster.run();
process.on('SIGHUP', function () {
    console.log('Got SIGHUP, reloading cluster...');
    cluster.reload();
});
console.log("spawned cluster, kill -s SIGHUP", process.pid, "to reload");
