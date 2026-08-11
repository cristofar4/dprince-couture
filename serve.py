#!/usr/bin/env python3
"""Dprince Couture — local development server.

A plain static server that also implements HTTP Range requests. Range support
matters here: the scroll-scrubbed atelier film on the homepage seeks through
the video by setting currentTime, and a server without Range leaves the video
unseekable, so the scrub silently does nothing. Python's built-in
`http.server` does not implement Range, which is why this file exists.

    python3 serve.py           # http://localhost:8000
    python3 serve.py 3000      # a different port
"""
import os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))


class RangeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, *a):
        pass

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        if not os.path.exists(path):
            self.send_error(404)
            return None

        rng = self.headers.get('Range')
        ctype = self.guess_type(path)
        size = os.path.getsize(path)

        if not rng:
            f = open(path, 'rb')
            self.send_response(200)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(size))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()
            return f

        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        start, end = m.group(1), m.group(2)
        start = int(start) if start else 0
        end = int(end) if end else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416)
            return None

        f = open(path, 'rb')
        f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        self._limit = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        limit = getattr(self, '_limit', None)
        if limit is None:
            return super().copyfile(source, outputfile)
        remaining = limit
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f'Dprince Couture — serving {ROOT}')
    print(f'  http://localhost:{port}\n')
    try:
        ThreadingHTTPServer(('', port), RangeHandler).serve_forever()
    except KeyboardInterrupt:
        print('\nstopped')
