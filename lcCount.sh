#!/bin/bash
find . -name "node_modules" -prune -o -name ".git" -prune -o -name "music" -prune -o -name "images" -prune -o ! -path '*.json' -a ! -path '*.sqlite' | xargs wc -l