var fs = require('fs')
    , path = require('path');

var NSFileSystem = function (options)
{
    

    // FILESYSTEM
    function FileSystem()
    {
    }

    FileSystem.prototype = {
        canReadFrom: function (path)
        {
            return isInPath(path, options.readDirectories);
        },
        canWriteTo: function (path)
        {
            return isInPath(path, options.writeDirectories);
        },
        readFileSync: function (path, encoding)
        {
            if (!isInPath(path, options.readDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.readFileSync(path, encoding);
        },
        writeFileSync: function (path, data, encoding)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.writeFileSync(path, data, encoding);
        },
        writeFile: function (path, data, encoding, callback)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.writeFile(path, data, encoding, callback);
        },
        renameSync: function (oldPath, newPath)
        {
            if (!isInPath(oldPath, options.readDirectories))
                throw new NoAccessException(oldPath, 'No access');
            if (!isInPath(newPath, options.writeDirectories))
                throw new NoAccessException(newPath, 'No access');
            return fs.renameSync(oldPath, newPath);
        },
        statSync: function (path)
        {
            return fs.statSync(path);
        },
        deleteSync: function(path)
        {
            this.unlinkSync(path);
        },
        unlinkSync: function (path)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.unlinkSync(path);
        },
        rmdirSync: function (path)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            if (this.existsSync(path))
                return fs.rmdirSync(path);
        },
        mkdirSync: function (path)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.mkdirSync(path);
        },
        appendFileSync: function (path, data, encoding)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.appendFileSync(path, data, encoding);
        },
        existsSync: function (path)
        {
            if (!isInPath(path, options.readDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.existsSync(path);

        },
        createReadStream: function(path)
        {
            if (!isInPath(path, options.readDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.createReadStream(path);
        },
        createWriteStream: function (path)
        {
            if (!isInPath(path, options.writeDirectories))
                throw new NoAccessException(path, 'No access');
            return fs.createWriteStream(path);
        },
        copyFileSync: function (sourcePath, destPath)
        {
            if (!isInPath(sourcePath, options.readDirectories))
                throw new NoAccessException(sourcePath, 'No access');
            if (!isInPath(destPath, options.writeDirectories))
                throw new NoAccessException(destPath, 'No access');

            if (path.normalize(sourcePath) == path.normalize(destPath))
                return;

            var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
            BUF_LENGTH = 64 * 1024;
            buff = new Buffer(BUF_LENGTH);
            fdr = fs.openSync(sourcePath, 'r');
            fdw = fs.openSync(destPath, 'w');
            bytesRead = 1;
            pos = 0;
            while (bytesRead > 0)
            {
                bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
                fs.writeSync(fdw, buff, 0, bytesRead);
                pos += bytesRead;
            }
            fs.closeSync(fdr);
            return fs.closeSync(fdw);
        }
    };


    return new FileSystem();
}

module.exports = NSFileSystem;

function isInPath(thePath, allowedParentPaths)
{
    if (isEmpty(thePath))
        return false;
    thePath = path.resolve(thePath);
    var pathsArray = [];
    if (typeof allowedParentPaths == 'string')
        pathsArray.push(allowedParentPaths);
    else if (Array.isArray(allowedParentPaths))
        pathsArray = allowedParentPaths;
    else
        return false;

    for (i in pathsArray)
    {

        var allowedParentPath = path.normalize(pathsArray[i]);
        var relativeTo = path.relative(allowedParentPath, thePath);
        var notAllowedPath = /^(\\|\/|.\:|\.\.)/;
        if (!relativeTo.match(notAllowedPath))
            return true;
    }
    return false;
}


function NoAccessException(path, message)
{
    this.path = path;
    this.message = message;
}

function isEmpty(value)
{
    return (value == undefined || value == null || value.length === 0);
}
