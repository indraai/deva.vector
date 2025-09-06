export default {
	async vector(packet) {
		const vector = await this.methods.sign('vector', 'default', packet);
		return vector;
	},
	
	async sign(key, type, packet) {
		this.state('set', `${key}:sign:${type}:${packet.id}`);
		const transport = packet.id; // set the transport id from the packet id.

		this.zone(key, `${key}:sign:${type}:${transport}`); // set the zone
		this.feature(key, `${key}:sign:${type}:${transport}`); // set the feature
		this.context(key, `${key}:sign:${type}:${transport}`); // set the agent context to proxy.
		this.action('method', `${key}:sign:${type}:${transport}`); // set the action method to proxy.
		
		this.state('set', `${key}:sign:${type}:uid:${transport}`); //set the uid state
		const uid = this.lib.uid(true); // The UID
		
		this.state('set', `${key}:sign:${type}:time:${transport}`); //set the time state
		const time = Date.now(); // current timestamp
		
		this.state('created', `${key}:sign:${type}:created:${transport}`); //set the created state
		const created = this.lib.formatDate(time, 'long', true); // Formatted created date.
		
		this.state('set', `${key}:sign:${type}:concerns:${transport}`); //set the concerns
		const {concerns} = this[key](); // load the Guard profile
		
		this.state('set', `${key}:sign:${type}:agent:${transport}`); //set the agent state
		const agent = this.agent(); // the agent processing the proxy

		this.state('set', `${key}:sign:${type}:client:${transport}`); //set the client state
		const client = this.client(); // the client requesting the proxy

		this.state('set', `${key}:sign:${type}:expires:${transport}`); //set the time state
		const expires = time + (client.expires || agent.expires || 10000); // signature expires in milliseconds
		
		this.state('set', `${key}:sign:${type}:meta:${transport}`); //set the meta state
		const {meta} = packet.q; // set the meta information from the packet question.
		
		this.state('set', `${key}:sign:${type}:params:${transport}`); //set the meta state
		const {params} = meta; // set params from the meta information.
		
		this.state('set', `${key}:sign:${type}:opts:${transport}`); //set the opts state
		const opts = this.lib.copy(params); // copy the params and set as opts.
		
		this.state('set', `${key}:sign:${type}:command:${transport}`); //set the opts state
		const command = opts.shift(); // extract the command first array item out of opts.
		
		this.state('set', `${key}:sign:${type}:message:${transport}`); //set the message state
		const message = packet.q.text; // set packet.q.text as the message of the proxy.
		
		this.state('set', `${key}:sign:${type}:container:${transport}`); //set the message state
		const container = `OM:${key.toUpperCase()}:${client.profile.container.split(' ').join(':').toUpperCase()}`; // set container string.

		this.state('set', `${key}:sign:${type}:write:${transport}`); //set the message state
		const write = client.profile.write; // set write string.
		
		// hash the agent profile for security
		this.state('hash', `${key}:sign:${type}:packet:sha256:${transport}`);
		const packet_hash = this.lib.hash(packet, 'sha256');

		// hash the agent profile for security
		this.state('hash', `${key}:sign:${type}:agent:sha256:${transport}`);
		const agent_hash = this.lib.hash(agent, 'sha256');
		
		// hash the agent profile for security
		this.state('hash', `${key}:sign:${type}:client:sha256:${transport}`);
		const client_hash = this.lib.hash(client, 'sha256');

		// hash the agent profile for security
		this.state('hash', `${key}:sign:${type}:laws:sha256:${transport}`);
		const laws_hash = this.lib.hash(agent.laws || client.laws, 'sha256');
		
		// hash the agent profile for security
		this.state('hash', `${key}:sign:${type}:token:${transport}`);
		const token = this.lib.hash(`${key} ${client.profile.token} ${transport}`, 'sha256');

		
		this.state('set', `${key}:sign:${type}:write:${transport}`); // set the state to set data 
		// data packet
		const data = {
			uid,
			transport,
			time,
			expires,
			container,
			write,
			message,
			caseid: client.profile.caseid,
			opts: opts.length? `.${opts.join('.')}` : '',
			name: client.profile.name,
			fullname: client.profile.fullname,
			emojis: client.profile.emojis,
			company: client.profile.company,
			client: client_hash,
			agent: agent_hash,
			packet: packet_hash,
			laws: laws_hash,
			warning: agent.warning || client.warning || 'none',
			token,
			concerns,
			meta,
			params,
			command,
			created,
			copyright: client.profile.copyright,
		};
		
		this.state('hash', `${key}:sign:${type}:md5:${transport.uid}`); // set state to secure hashing
		data.md5 = this.lib.hash(data, 'md5'); // hash data packet into md5 and inert into data.
		
		this.state('hash', `${key}:sign:${type}:sha256:${transport.uid}`); // set state to secure hashing
		data.sha256 = this.lib.hash(data, 'sha256'); // hash data into sha 256 then set in data.
		
		this.state('hash', `${key}:sign:${type}:sha512:${transport.uid}`); // set state to secure hashing
		data.sha512 = this.lib.hash(data, 'sha512'); // hash data into sha 512 then set in data.
		
		// Text data that is joined by line breaks and then trimmed.
		this.state('set', `${key}:sign:${type}:text:${transport.uid}`); // set state to text for output formatting.
		const text = [
			`::::`,
			`::BEGIN:${data.container}:${data.transport.uid}`,
			`#${key}.${type}${data.opts} ${write}? if yes ${write} ${data.message} while dropping a 💩🪣💣turdbucket.bombs on the violators who fail to issue proper chain of custody.`,
			'\n---\n',
			'Signed',
			data.fullname,
			data.emojis,
			'\n',
			`::begin:${key}:${type}:${transport.uid}`,
			`transport: ${data.transport.uid}`,
			`time: ${data.time}`,
			`expires: ${data.expires}`,
			`name: ${data.name}`,
			`fullname: ${data.fullname}`,
			`company: ${data.company}`,
			`caseid: ${data.caseid}`,
			`agent: ${data.agent}`,
			`client: ${data.client}`,
			`packet: ${data.packet}`,
			`token: ${data.token}`,
			`laws: ${data.laws}`,
			`warning: ${data.warning}`,
			`created: ${data.created}`,
			`copyright: ${data.copyright}`,
			`md5: ${data.md5}`,
			`sha256: ${data.sha256}`,
			`sha512: ${data.sha512}`,
			`::end:${key}:${type}${data.transport.uid}`,
			`::END:${data.container}:${data.transport.uid}`,
			`::::`
		].join('\n').trim();
		
		// send the text data to #feecting to parse and return valid text, html, and data.
		this.action('question', `${key}:sign:${type}:write:${transport.uid}`); // action set to feecting parse 
		const feecting = await this.question(`${this.askChr}feecting parse:${transport.uid} ${text}`); // parse with feecting agent.
		
		this.state('return', `${key}:sign:${type}:return:${transport.uid}`); // set the state to return proxy
		return {
			text: feecting.a.text,
			html: feecting.a.html,
			data,
		}	  
		
	},
	
	async echo(key, type, packet) {
		
		const {id, agent, client, text, created, md5, sha256, sha512} = packet[type];

		this.state('set', `${key}:echo:${type}:time:${id}`);
		const echo_time = Date.now();

		this.action('func', `${key}:echo:${type}:${id}`);
		
		this.state('hash', `${key}:echo:${type}:hash:message:${id}`);
		const message_hash = this.lib.hash(text || 'blank', 'sha256');

		// hash the agent profile for security
		this.state('hash', `${key}:echo:${type}:packet:sha256:${id}`);
		const packet_hash = this.lib.hash(packet, 'sha256');

		this.state('hash', `${key}:echo:${type}:hash:agent:${id}`);
		const agent_hash = this.lib.hash(agent, 'sha256');

		this.state('hash', `${key}:echo:${type}:hash:client:${id}`);
		const client_hash = this.lib.hash(client, 'sha256');

		this.state('set', `${key}:echo:${type}:keystr:${id}`);
		const keystr = `${key.toUpperCase()}:${type.toUpperCase()}:${id}`;

		this.state('set', `${key}:echo:${type}:data:${id}`);
		const echo_data = [
			`::::`,
			`::BEGIN:${keystr}`,
			`key: ${key}`, 
			`type: ${type}`, 
			`transport: ${id}`, 
			`created: ${created}`,
			`echo: ${echo_time}`,
			`message: ${message_hash}`,
			`agent: ${agent_hash}`, 
			`client: ${client_hash}`, 
			`packet: ${packet_hash}`, 
			`md5: ${md5}`, 
			`sha256:${sha256}`, 
			`sha512:${sha512}`,
			`::END:${keystr}`,
			'::::',
		].join('\n');
		
		// stub for later features right now just echo into the system process for SIGINT monitoring.
		const echo = this.lib.spawn('echo', [echo_data])
		echo.stdout.on('data', data => {
			this.state('data', `${key}:echo:${type}:stdout:${id}`);
		});
		echo.stderr.on('data', err => {
			this.state('error', `${key}:echo:${type}:stderr:${id}`);
			this.error(err, opts);
		});
		echo.on('close', data => {
			this.state('close', `${key}:echo:${type}:close:${id}`);        
		});
		this.state('return', `${key}:echo:${type}:return:${id}`);
		return echo_data;
	}    
};
