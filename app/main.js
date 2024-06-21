const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("close", () => {
        socket.end();
    });

    socket.on("data", (data) => {
        const request = data.toString();
        if (request.startsWith('GET / ')) {
            const res = "HTTP/1.1 200 OK\r\n\r\n";
            socket.write(res);
        } else if (request.includes('/echo/')) {
            str = request.split('/echo/');
            length = str.length();
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${length}\r\n\r\n${str}`;
            socket.write(res);
        } else {
            const res = "HTTP/1.1 404 Not Found\r\n\r\n";
            socket.write(res);
        }
        socket.end();
    });
});

server.listen(4221, "localhost");
