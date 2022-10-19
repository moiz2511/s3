
var _ = require('underscore');
var child_process = require('child_process');
var path = require('path');

var package = require('./package');

if (process.env.SKIP_POST_INSTALL) {
    process.exit(0);
}

var runcmd = function(cmd, dir, env, resolve)
{
    var args = [
        '/s',
        '/c',
        '"' + cmd + '"'
    ];
    
    child_process.spawn('cmd.exe', args,
    {
        cwd: dir,
        env: env,
        stdio: 'inherit',
        windowsVerbatimArguments: true
        
    }).on('exit', 
    function() {
        resolve();
    }).on('error', function(err) {
        console.log(err); 
        resolve(); 
    });
}

linkPackageIntoPrefix = function(package, env, callback)
{
    runcmd("npm link", package, env, callback);
};

linkPackageFromPrefix = function(package, env, callback)
{
    runcmd("npm link " + package, '.', env, callback);
};

var env = _.clone(process.env);
env.npm_config_prefix = path.resolve(path.join(__dirname, 'local'));

var installPackages = function(packages)
{
    function installPackagesA(package, rest) {
        if(!package) return;
        linkPackageIntoPrefix(package, env, function() {
            linkPackageFromPrefix(package, env, function() {
                installPackagesA(_.first(rest), _.rest(rest));
            });
        });
    };

    installPackagesA(_.first(packages), _.rest(packages));
};

installPackages(package.localDependencies);

