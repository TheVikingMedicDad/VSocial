#!/usr/bin/env python
import livereload
import watchdog.observers
import watchdog.events
import threading
import time
import subprocess
import contextlib
from collections import deque
import sys
import os

if len(sys.argv) != 3:
    sys.exit("usage: {} src_dir out_dir".format(sys.argv[0]))
SRC_DIR = sys.argv[1]
OUT_DIR = sys.argv[2]
BUILD_CHECK_INTERVAL_SEC = 2
BUILD_COMMAND = "make html".split(" ")
VERBOSE = False
IGNORE_PATTERNS = []
WEBSERVER_LISTEN_HOST = "0.0.0.0"
WEBSERVER_LISTEN_PORT = os.environ.get("CSD_WEBAPP_DOCS_HTTP_PORT", 8080)
INITIAL_SPHINX_BUILD = True
WATCH_SRC_RECURSIVE = True

newlines = ["\n", "\r\n", "\r"]


def _unbuffered(proc, stream="stdout"):
    """
    Helper function that reads the next stdout line of a process `proc`

    Based on https://stackoverflow.com/questions/874815/how-do-i-get-real-time-information-back-from-a-subprocess-popen-in-python-2-5/2858790
    """
    stream = getattr(proc, stream)
    with contextlib.closing(stream):
        while True:
            out = []
            last = stream.read(1)
            # Don't loop forever
            if last == "" and proc.poll() is not None:
                break
            while last not in newlines:
                # Don't loop forever
                if last == "" and proc.poll() is not None:
                    break
                out.append(last)
                last = stream.read(1)
            out = "".join(out)
            yield out


def serve_output_dir():
    """
    Starts a webserver that serves the output folder.
    It serves and blocks until SIGINT is sent

    The webserver is also triggering a browser-refresh when the content of the output folder changes
    """
    server = livereload.Server()
    server.watch(OUT_DIR)
    server.serve(root=OUT_DIR, port=WEBSERVER_LISTEN_PORT, host=WEBSERVER_LISTEN_HOST)


class SharedMemory:
    """
    Is beeing used by the Sphinx Build Thread and the Source-Dir Watchdog Thread
    """

    def __init__(self):
        self.queue_lock = threading.Lock()
        self.queue = deque()


class SphinxBuildThread(threading.Thread):
    """
    This Thread runs an endless loop which checks every defined interval time
    if the the FileSystemEvent Queue has entries.
    If the queue has entries it empties the queue and invokes an action
    """

    def __init__(self, shared_memory):
        super().__init__()
        self.shared_memory = shared_memory
        self._kill_flag = False

    def run(self):
        """
        Starts the BuildThread. The Thread is terminating after kill() was called
        """
        print("SphinxBuildThread is running.")
        while not self._kill_flag:
            with self.shared_memory.queue_lock:
                if len(self.shared_memory.queue) > 0:
                    print(
                        "{} files changed. Building...".format(
                            len(self.shared_memory.queue)
                        )
                    )
                    # clear queue and trigger the build process
                    self.shared_memory.queue.clear()
                    must_build = True
                else:
                    must_build = False
            if must_build:
                self.build()
            else:
                time.sleep(BUILD_CHECK_INTERVAL_SEC)

    def build(self):
        """
        Starts the Sphinx-Build process and waits for its end
        """
        print("Start Sphinx Builder")
        p = subprocess.Popen(BUILD_COMMAND, stdout=subprocess.PIPE, shell=True)

        cmd = BUILD_COMMAND
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            # Make all end-of-lines '\n'
            universal_newlines=True,
        )
        for line in _unbuffered(proc):
            if VERBOSE:
                print(line)
        print("Sphinx builder finished")

    def kill(self):
        self._kill_flag = True


class SourceDirWatcher(object):
    """
    This class offers a watchdog thread that is writing FileSystemEvents to shared_memory.queue
    """

    def __init__(self, shared_memory):
        self.shared_memory = shared_memory

    def start(self):
        observer = watchdog.observers.Observer()
        event_handler = watchdog.events.PatternMatchingEventHandler(
            ignore_patterns=IGNORE_PATTERNS
        )
        event_handler.on_any_event = self.on_any_event
        observer.schedule(event_handler, SRC_DIR, recursive=WATCH_SRC_RECURSIVE)
        observer.start()
        print("Watchdog is watching.")

    def on_any_event(self, event):
        # append to queue:
        with self.shared_memory.queue_lock:
            self.shared_memory.queue.append(event)
        if VERBOSE:
            print(event, "changed")


def main():
    shared_memory = SharedMemory()

    # start the sphinx-build and then start the thread
    sphinx_build_thread = SphinxBuildThread(shared_memory)
    if INITIAL_SPHINX_BUILD:
        sphinx_build_thread.build()  # this takes a while
    sphinx_build_thread.start()

    # start the watcher thread
    source_dir_watcher = SourceDirWatcher(shared_memory)
    source_dir_watcher.start()

    # the following command blocks the main thread until ctrl+c is pressed:
    serve_output_dir()

    print("Webserver stopped.")
    # stop the other threads as well
    print("Stopping SphinxBuildThread...")
    sphinx_build_thread.kill()
    sphinx_build_thread.join()
    print("SphinxBuildThread stopped.")
    # watchdog thread closes automatically when main thread saying goodbye
    return 0


if __name__ == "__main__":
    sys.exit(main())
