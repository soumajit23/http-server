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
        const url = request.split(' ');
        const echoUrl = url[0];
        const userAgentUrl = url[1];

        if (url == "/") {
            const res = "HTTP/1.1 200 OK\r\n\r\n";
            socket.write(res);
        } else if (echoUrl.includes('/echo/')) {
            const str = echoUrl.split('/echo/')[1];
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`;
            socket.write(res);
        } else if (userAgentUrl.includes('/user-agent')) {
            const userAgent = userAgentUrl.split("\r\n")[0];
            const res = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
            socket.write(res);
        } else {
            const res = "HTTP/1.1 404 Not Found\r\n\r\n";
            socket.write(res);
        }

        socket.end();
    });
});

server.listen(4221, "localhost");
