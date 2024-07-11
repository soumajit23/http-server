const net = require("net");
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });

    socket.on("data", (data) => {
        const request = data.toString();
        const requestLines = request.split('\r\n');
        const url = request.split(' ')[1];
        const method = request.split(' ')[0];
        const header = requestLines[2];

        const headers = {};
        let i =1;
        while (requestLines[i] && requestLines[i] !== '') {
            const [key, value] = requestLines[i].split(': ');
            headers[key.toLowerCase()] = value;
            i++;
        }

        if (url == "/") {
            const res = "HTTP/1.1 200 OK\r\n\r\n";
            socket.write(res);
        } else if (url.includes('/echo/')) {
            const str = url.split('/echo/')[1];
            const acceptEncoding = headers['accept-encoding'];
            const encodings = acceptEncoding ? acceptEncoding.split(',').map(encoding => encoding.trim()) : [];
            
            if (encodings.includes('gzip')) {
                const bodyContent = url.split('/')[2];
                const compressedBody = zlib.gzipSync(bodyContent);
                const res = `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: plain/text\r\nContent-Length: ${bodyContent.length}\r\n\r\n`;
                socket.write(res);
                socket.write(compressedBody);
            } else {
                const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
                socket.write(res);
            }
        } else if (header.includes('User-Agent:')) {
            const userAgent = header.split(' ')[1];
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
            socket.write(res);
        } else if (url.startsWith('/files/') && method === 'GET') {
            const directory = process.argv[3];
            const fileName = url.split('/files/')[1];
            const filePath = path.join(directory, fileName);

            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath);
                const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
                socket.write(res);
            } else {
                const res = "HTTP/1.1 404 Not Found\r\n\r\n";
                socket.write(res);
            }
        } else if (url.startsWith('/files/') && method === 'POST') {
            const directory = process.argv[3];
            const fileName = url.split('/files/')[1];
            const filePath = path.join(directory, fileName);
            const content = request.split('\r\n')[request.split('\r\n').length - 1];
            
            fs.writeFileSync(filePath, content);
            const res = "HTTP/1.1 201 Created\r\n\r\n";
            socket.write(res);
        } else {
            const res = "HTTP/1.1 404 Not Found\r\n\r\n";
            socket.write(res);
        }

        socket.end();
    });
});

server.listen(4221, "localhost");
