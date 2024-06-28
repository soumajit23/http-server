const net = require("net");
const fs = require('fs');
const path = require('path');

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });

    socket.on("data", (data) => {
        const request = data.toString();
        const url = request.split(' ')[1];
        const header = request.split('\r\n')[2];

        if (url == "/") {
            const res = "HTTP/1.1 200 OK\r\n\r\n";
            socket.write(res);
        } else if (url.includes('/echo/')) {
            const str = url.split('/echo/')[1];
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
            socket.write(res);
        } else if (header.includes('User-Agent:')) {
            const userAgent = header.split(' ')[1];
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
            socket.write(res);
        } else if (url.startsWith('/files/')) {
            const directory = process.argv[3];
            const fileName = url.split('/files/')[1];
            const filePath = path.join(directory, fileName);

            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath);
                const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
                socket.write(res);
            } else {
                const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
                socket.write(res);
            }
        } else {
            const res = "HTTP/1.1 404 Not Found\r\n\r\n";
            socket.write(res);
        }

        socket.end();
    });
});

server.listen(4221, "localhost");
