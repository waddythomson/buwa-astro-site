#!/bin/bash
# Commit and push script
# Usage: ./comp.sh "Your commit message here"

if [ -z "$1" ]; then
    echo "Error: Please provide a commit message"
    echo "Usage: ./comp.sh \"Your commit message\""
    exit 1
fi

git add -A
git commit -m "$1"
git push origin main
