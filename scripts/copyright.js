var fs = require('fs');
hexo.extend.filter.register('before_post_render', function (data) {
    if (data.copyright == false) return data;
    try {
        var file_content = fs.readFileSync('copyright.md');
        if (file_content && data.content.length > 50) {
            data.content += file_content;
        }
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        // No process for ENOENT error
    }
    return data;
});
