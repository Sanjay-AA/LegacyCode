# Legacy Python WSGI Handler
def application(environ, start_response):
    status = '200 OK'
    headers = [('Content-Type', 'text/html')]
    start_response(status, headers)
    return [b"Hello Legacy World"]
