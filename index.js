// Copyright (c)2025 Quinn Michaels
// Vector Deva

import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;

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
      console.log(packet);
      this.func.echo('question', packet.q);
    },
    'devacore:answer'(packet) {
      this.func.echo('answer', packet.a);
    }
  },
  modules: {},
  devas: {},
  func: {
    echo(type, opts) {
      const {id, agent, client, text, md5, sha256, sha512} = opts;
      const created = Date.now();
    
      this.action('func', `echo:${type}:${id}`);
      this.state('set', `echo:data:${type}:${id}`);
      
      const echo_data = [
        `\n::begin:vector:${type}:${id}`,
        `transport: ${id}`, 
        `created: ${created}`, 
        `message: ${text}`,
        `agent: ${this.lib.hash(agent, 'sha256')}`, 
        `client: ${this.lib.hash(client, 'sha256')}`, 
        `md5: ${md5}`, 
        `sha256:${sha256}`, 
        `sha512:${sha512}`,
        `::end:vector:${type}:${id}`,
        '::::',
      ].join('\n');
    
      // stub for later features right now just echo into the system process for SIGINT monitoring.
      const echo = this.lib.spawn('echo', [echo_data])
      echo.stdout.on('data', data => {
        console.log(data.toString());
        this.state('data', `echo:stdout:${type}:${id}`);
      });
      echo.stderr.on('data', err => {
        this.state('error', `echo:stderr:${type}:${id}`);
        this.error(err, opts);
      });
      echo.on('close', data => {
        this.state('close', `echo:close:${type}:${id}`);        
      });
      this.state('return', `echo:return:${type}:${id}`);
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

