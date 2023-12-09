const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;

const server = http.createServer(app)

server.listen(port, () => {
    console.log(`Node API is running in http://localhost:${port}`);
    //console.log(process.env.PORT)
});
