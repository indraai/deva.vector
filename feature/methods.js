export default {
	async vector(packet) {
		this.state('set', `vector:transport:${packet.id}`);
		const transport = packet.id; // set the transport id from the packet id.
		
		this.zone('vector', transport); // set the current zone to guard
		this.feature('vector', transport); // set the Guard feature.
		this.context('vector', transport); // set the agent context to proxy.
		this.action('method', `proxy:${transport}`); // set the action method to proxy.
		
		this.state('set', `uid:${transport}`); //set the uid state for the proxy
		const uid = this.lib.uid(true); // The UID for the proxy
		this.state('set', `time:${transport}`); //set the time state for the proxy
		const time = Date.now(); // current timestamp
		this.state('created', `created:${transport}`); //set the uid state for the proxy
		const created = this.lib.formatDate(time, 'long', true); // Formatted created date.
		
		this.state('set', `vector:${transport}`); //set the guard state for the proxy
		const vector = this.guard(); // load the Guard profile
		const {concerns} = vector; // load concerns from client guard profile.
		
		this.state('set', `vector:agent:${transport}`); //set the agent state for the proxy
		const agent = this.agent(); // the agent processing the proxy
		
		this.state('set', `vector:client:${transport}`); //set the client state for the proxy
		const client = this.client(); // the client requesting the proxy
		
		this.state('set', `vector:meta:${transport}`); //set the meta state for the proxy
		const {meta} = packet.q; // set the meta information from the packet question.
		
		this.state('set', `vector:params:${transport}`); //set the meta state for the proxy
		const {params} = meta; // set params from the meta information.
		
		this.state('set', `vector:opts:${transport}`); //set the opts state for the proxy
		const opts = this.lib.copy(params); // copy the params and set as opts.
		
		this.state('set', `vector:command:${transport}`); //set the opts state for the proxy
		const command = opts.shift(); // extract the command first array item out of opts.
		
		this.state('set', `vector:message:${transport}`); //set the message state for the proxy
		const message = packet.q.text; // set packet.q.text as the message of the proxy.
		
		this.state('set', `vector:write:${transport}`); //set the message state for the proxy
		const write = `OM:VECTOR:${client.profile.write.split(' ').join(':').toUpperCase()}`; // set proxy write string.
		
		// hash the agent profile for security
		this.state('hash', `vector:agent:hash:${transport}`);
		const agent_hash = this.lib.hash(agent, 'sha256');
		
		// hash the agent profile for security
		this.state('hash', `vector:client:hash:${transport}`);
		const client_hash = this.lib.hash(client, 'sha256');
		
		// hash the agent profile for security
		this.state('hash', `vector:token:${transport}`);
		const token = this.lib.hash(`VECTOR ${client.profile.token} ${transport}`, 'sha256');
		
		this.state('set', `vector:data:${transport}`); // set the state to set data 
		// data packet
		const data = {
			uid,
			transport,
			time,
			write,
			message,
			caseid: client.profile.caseid,
			opts: opts.length? `:${opts.join(':')}` : '',
			agent: agent_hash,
			client: client_hash,
			name: client.profile.name,
			emojis: client.profile.emojis,
			company: client.profile.company,
			warning: client.profile.warning,
			token,
			concerns,
			meta,
			params,
			command,
			created,
			copyright: client.profile.copyright,
		};
		
		this.state('hash', `vector:md5:${transport}`); // set state to secure hashing
		data.md5 = this.lib.hash(data, 'md5'); // hash data packet into md5 and inert into data.
		
		this.state('hash', `vector:sha256:${transport}`); // set state to secure hashing
		data.sha256 = this.lib.hash(data, 'sha256'); // hash data into sha 256 then set in data.
		
		this.state('hash', `vector:sha512:${transport}`); // set state to secure hashing
		data.sha512 = this.lib.hash(data, 'sha512'); // hash data into sha 512 then set in data.
		
		// Text data that is joined by line breaks and then trimmed.
		this.state('set', `vector:text:${transport}`); // set state to text for output formatting.
		const text = [
			`::::`,
			`::BEGIN:${data.write}:${data.transport}`,
			`#Vector${data.opts} ${data.message}`,
			`::begin:vector:guard:proxy:${transport}:${data.emojis}`,
			`transport: ${data.transport}`,
			`time: ${data.time}`,
			`caseid: ${data.caseid}`,
			`agent: ${data.agent}`,
			`client: ${data.client}`,
			`token: ${data.token}`,
			`name: ${data.name}`,
			`company: ${data.company}`,
			`warning: ${data.warning}`,
			`created: ${data.created}`,
			`copyright: ${data.copyright}`,
			`md5: ${data.md5}`,
			`sha256: ${data.sha256}`,
			`sha512: ${data.sha512}`,
			`::end:vector:guard:proxy:${data.transport}:${data.emojis}`,
			`::END:${data.write}:${data.transport}`,
			`::::`
		].join('\n').trim();
		
		// send the text data to #feecting to parse and return valid text, html, and data.
		this.action('question', `vector:feecting:parse:${transport}`); // action set to feecting parse 
		const feecting = await this.question(`${this.askChr}feecting parse:${transport} ${text}`); // parse with feecting agent.
		
		this.state('return', `vector:${transport}`); // set the state to return proxy
		return {
			text: feecting.a.text,
			html: feecting.a.html,
			data,
		}	  
	},
	echo(key, type, opts) {
		const {id, agent, client, text, created, md5, sha256, sha512} = opts;

		this.prompt('ECHO ECHO ECHO')
		this.state('set', `${key}:echo:${type}:time:${id}`);
		const echo_time = Date.now();

		this.action('func', `${key}:echo:${type}:${id}`);
		
		this.state('set', `${key}:echo:${type}:keystr:${id}`);
		const keystr = `${key.toUpperCase()}:${type.toUpperCase()}:${id}`;

		this.state('set', `${key}:echo:${type}:data:${id}`);
		const echo_data = [
			`::::`
			`::BEGIN:${keystr}`,
			`key: ${key}`, 
			`type: ${type}`, 
			`transport: ${id}`, 
			`created: ${created}`,
			`echo: ${echo_time}`,
			`message: ${text}`,
			`agent: ${this.lib.hash(agent, 'sha256')}`, 
			`client: ${this.lib.hash(client, 'sha256')}`, 
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
