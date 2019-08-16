module.exports = {
    render: async function(req, res) {
        res.writeHead(200);
        res.write('<html><head></head><body>This is placeholder output</body></html>');
        res.end();
    }
};
