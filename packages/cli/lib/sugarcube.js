#!/usr/bin/env node

import sourceMap from "source-map-support";

sourceMap.install();

// eslint-disable-next-line import/first
import "./cli";
