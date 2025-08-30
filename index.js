// Copyright (c)2025 Quinn Michaels
// Vector Deva

import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;

import {exec, spawn}  from 'node:child_process';

// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

const info = {
  id: pkg.id,
  name: pkg.name,
  version: pkg.version,
  author: pkg.author,
  describe: pkg.description,
  dir: __dirname,
  url: pkg.homepage,
  git: pkg.repository.url,
  bugs: pkg.bugs.url,
  license: pkg.license,
  copyright: pkg.copyright
};

const VECTOR = new Deva({
  info,
  agent,
  vars,
  utils: {
    translate(input) {return input.trim();},
    parse(input) {return input.trim();},
    process(input) {return input.trim();},
  },
  listeners: {
    'devacore:question'(packet) {
      this.func.echo(packet.q);
    },
    'devacore:answer'(packet) {
      this.func.echo(packet.a);
    }
  },
  modules: {},
  devas: {},
  func: {
    echo(opts) {
      const {id, agent, client, md5, sha256, sha512} = opts;
      const created = Date.now();
    
      this.action('func', `echo:${id}`);
      this.state('set', `echo:${id}`);
      const echo_data = [
        `::begin:guard:${id}`,
        `transport: ${id}`, 
        `client: ${client.profile.id}`, 
        `agent: ${agent.profile.id}`, 
        `created: ${created}`, 
        `md5: ${md5}`, 
        `sha256:${sha256}`, 
        `sha512:${sha512}`,
        `::end:guard:${id}`,
      ].join('\n');
    
      // stub for later features right now just echo into the system process for SIGINT monitoring.
      const echo = spawn('echo', [echo_data])
      echo.stdout.on('data', data => {
        this.state('data', `echo:stdout:${id}`);
      });
      echo.stderr.on('data', err => {
        this.state('error', `echo:stderr:${id}`);
        this.error(err, opts);
      });
      echo.on('close', data => {
        this.state('close', `echo:${id}`);        
      });
      this.state('return', `echo:${id}`);
      return echo_data;
    }    
  },
  methods: {},
  onReady(data, resolve) {
    this.prompt(this.vars.messages.ready);
    return resolve(data);    
  },
  onError(data, err, reject) {
    this.prompt(this.vars.messages.error);
    console.log(err);
    return reject(err);
  },
});
export default VECTOR

