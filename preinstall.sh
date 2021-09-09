#!/usr/bin/env bash

# remove old dirs
panel="Cutterman"

if [ -d "/Library/Application Support/Adobe/CEP/extensions/${panel}" ]; then
    rm -rf "/Library/Application Support/Adobe/CEP/extensions/${panel}"
fi

if [ -d "${HOME}/Library/Application Support/Adobe/CEP/extensions/${panel}" ]; then
    rm -rf "${HOME}/Library/Application Support/Adobe/CEP/extensions/${panel}"
fi
