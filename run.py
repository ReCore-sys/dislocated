import http.server


def run(
    server_class=http.server.HTTPServer, handler_class=http.server.CGIHTTPRequestHandler
):
    server_address = ("", 8000)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()


if __name__ == "__main__":
    run()
